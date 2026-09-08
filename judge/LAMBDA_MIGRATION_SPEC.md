# Judge Lambda Migration — Implementation Spec

Self-contained handoff. Everything needed is in this file; no prior session context required.

**Read before starting:** `judge/LAMBDA_DEPLOYMENT_GUIDE.md` (what is already deployed and why),
`judge/src/executor.js` (the execution engine — do not restructure it).

---

## 0. Current state

| | |
|---|---|
| Worktree | `D:\PROJECTS\VANTAGE\.claude\worktrees\judge-lambda` |
| Branch | `worktree-judge-lambda` |
| Commit | `805edf2` — **local only, never pushed** |
| Remote | `https://github.com/roguekishore/Vantage.git` |
| Runtime host | EC2, **2 GB** (was 4 GB), ARM |
| Deployment repo | `D:\PROJECTS\deployment` (`docker-compose.yml`, `nginx.conf`, `2gb/`, `4gb/`) |

### Already built and verified in `805edf2`

Added: `judge/src/app.js`, `judge/src/lambda.js`, `judge/Dockerfile.lambda`, `judge/template.yaml`,
`judge/deploy.sh`, `judge/.dockerignore`, `judge/.gitignore`, rewritten `judge/LAMBDA_DEPLOYMENT_GUIDE.md`.

Modified: `judge/src/index.js` (now consumes `createApp()`), `judge/package.json` +
`package-lock.json` (`@codegenie/serverless-express@^4.16.0`),
`reactapp/src/services/judgeApi.js` (sends `x-judge-token`),
`springapp/.../battle/BattleService.java` (`judgeToken` field + `judgeHeaders()` helper on both
call sites), `springapp/.../common/WebConfig.java` (judge read timeout 30 s → 125 s).

**Verified** against the built image through the Lambda Runtime Interface Emulator: warm ping
short-circuit, `/api/health` 200, 401 without token, C++ compile+run (`3+4` → `7`), Java
compile+run (`6*7` → `42`), `/api/submit` → `Accepted` on bundled test cases, `/api/trace` →
tree-sitter block tree, `/api/problems` → catalog list.

**Not verified:** the Spring changes do not compile locally (local JDK is 14; vantage is Boot 4.0.2
and needs JDK 25). `template.yaml` parses locally but was never validated server-side (expired SSO
token). Nothing has been deployed to AWS.

---

## 1. Target architecture

```
Browser ──JWT──> Spring (EC2, GraalVM native, 2 GB host)
                   ├──> catalog container (Node, ~60 MB, same host, NO toolchains)
                   │      157 problem modules + problemStore.js + routes/problems.js
                   └──token──> executor Lambda (Node: g++, javac, tree-sitter, NO catalog)
                                in:  {language, code, testCases[]} | {language, code, input}
                                out: per-case results | trace
```

Two services. The catalog stays a Node container **specifically to avoid touching the working
GraalVM native build** — measured at 59.8 MB RSS with all problems loaded (11.3 MB heap; bare Node
is 38.4 MB), which fits the 2 GB host comfortably.

### Decisions already made — do not revisit

- **Bearer token, not SigV4/IAM.** SigV4 needs the AWS SDK in Spring, and the AWS SDK is what bloats
  GraalVM native binaries (argus 202 MB vs vantage 63.5 MB was largely that). `AuthType: NONE` +
  token is the accepted trade, bounded by `ReservedConcurrentExecutions` and a logs-only IAM role.
- **Spring proxies with `Map`/`String` pass-through, never new DTO records.** New records need
  `reflect-config.json` entries or Jackson throws `UnsupportedFeatureError` at *serialization* time,
  per endpoint — invisible until runtime, ~10 min per native build to discover. `callJudge` already
  proxies via `Map<String, Object>` + `ParameterizedTypeReference` and works in native today. Follow
  that pattern and no reflect-config work is needed.
- **The catalog is not ported into Spring.** Keeps the native image untouched.
- **The local catalog container must never gain `g++`/`javac`.** Untrusted code as root beside Spring
  could reach the DB and the EC2 IAM metadata endpoint. Execution stays remote. `/api/trace` also
  performs instrumented execution, so it stays on Lambda too.
- **`executor.js` is not restructured.** `runAgainstTestCases(language, code, testCases)` already
  takes test cases as an argument — the seam exists. Only its callers change.

---

## 2. Environment quirks on this machine

- **Worktree guard:** the Bash tool refuses commands it cannot verify stay inside the worktree —
  heredocs, `$VAR`-computed paths, `cd` + git combinations. Write files with the Write tool instead
  of `cat > x <<'EOF'`, and use literal absolute paths.
- **Docker volume mounts need `MSYS_NO_PATHCONV=1`** or Git Bash rewrites `/app` to a Windows path.
- **`docker build ... ; echo "EXIT=$?"` reports the echo's status, not Docker's.** Grep the build log
  for `naming to` (success) or `ERROR` instead of trusting an exit code.
- Docker Desktop's daemon may be stopped even though `docker --version` works. Check
  `docker info --format '{{.ServerVersion}}'`.
- Local JDK is 14 → Spring changes cannot be compiled here. Review them by eye; compile on the ARM
  build box (`13.206.78.249`, `ec2-user`, PEM `C:\Users\conta\Downloads\build.pem`).

---

## 3. Phase 0 — Security fixes (do these FIRST)

**Nothing may be deployed and no Spring proxy may be exposed until 0.1–0.3 are done.** Until then any
authenticated user can extract `JUDGE_TOKEN` and bypass Spring entirely.

### 0.1 Scrub the child-process environment — CRITICAL

**Problem:** in `MODE=host`, `executor.js` spawns `g++`, the compiled binary, `javac` and `java` with
no `env` option, so children inherit the function's full environment. Line ~529 explicitly does
`env: { ...process.env, ... }`. A submission of

```cpp
#include <cstdlib>
#include <iostream>
int main(){ std::cout << getenv("JUDGE_TOKEN"); }
```

returns the token in `stdout`, which the judge hands back in the response. `#include "/proc/self/environ"`
leaks it through a compile error too, since g++ echoes file contents into stderr. Same mechanism
exposes `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN` (logs-only role, but
still).

**Fix** in `judge/src/executor.js` — define a minimal environment near the top:

```js
/**
 * Minimal environment for child processes running submitted code.
 * Children must NOT inherit process.env: it holds JUDGE_TOKEN and the
 * function's AWS credentials, and submitted code can read both via getenv().
 */
const CHILD_ENV = {
  PATH: process.env.PATH,
  HOME: process.env.HOME || "/tmp",
  LANG: process.env.LANG || "C.UTF-8",
};
```

Pass `env: CHILD_ENV` to **every** spawn that touches submitted code. Exact sites (verified against
`805edf2`):

| Line | Call | Function |
|---|---|---|
| 574 | `execSync(g++ ...)` | `compileCppHost` |
| 599 | `execFileSync(binary, ...)` | `runCppBinaryHost` |
| 638 | `execSync(javac ...)` | `compileJavaHost` |
| 664 | `execFileSync("java", ...)` | `runJavaClassHost` |
| 525 | `execFileSync(command, args, ...)` | `runWithTraceChannelHost` |

At 525 replace the existing `{ ...process.env, VANTAGE_TRACE_FILE: traceFile, ...extraEnv }` with
`{ ...CHILD_ENV, VANTAGE_TRACE_FILE: traceFile, ...extraEnv }`.

**Do not touch line 47** — `execSync("docker info")` in `detectMode()` is a trusted internal probe,
not submitted code, and may need the real environment to find the Docker socket.

Then in `judge/src/app.js`, capture the token into a closure and remove it from the environment:

```js
const TOKEN = process.env.JUDGE_TOKEN;
delete process.env.JUDGE_TOKEN;   // belt and braces: children get CHILD_ENV anyway
```

`lambda.js` requires `app.js` at module load, so this runs at cold start before any handler.

**Watch for:** `javac`/`java` may need `JAVA_HOME`. If Java submissions break after this change, add
`JAVA_HOME: process.env.JAVA_HOME` to `CHILD_ENV`. The Java fixture in §6 catches this.

### 0.2 SIGKILL on timeout

`execFileSync`'s `timeout` sends SIGTERM, which submitted code can ignore
(`signal(SIGTERM, SIG_IGN)` in C++), surviving the 5 s `TIME_LIMIT` until the 120 s Lambda timeout —
five of those saturate the concurrency budget. Add `killSignal: "SIGKILL"` to the options in
`runCppBinaryHost`, `runJavaClassHost`, and `runWithTraceChannelHost`.

### 0.3 Constant-time token comparison

In `app.js`, `req.get("x-judge-token") === TOKEN` is not constant-time. Replace with
`crypto.timingSafeEqual` over `Buffer.from(...)`, guarding unequal lengths first (it throws on
length mismatch).

### 0.4 Sweep `/tmp` at handler entry

`cleanup()` is best-effort in a `finally` and does not run when the process is killed by timeout.
The warm ping keeps one execution environment alive for days, so `/tmp/vantage-judge` accumulates
toward the 512 MB limit, and one user's submission can `ls` another's source. In `lambda.js`, before
dispatching (and before the warmup short-circuit returns is fine too), `fs.rmSync` any
`/tmp/vantage-judge/*` entry older than ~5 minutes. Wrap in try/catch; never let it fail a request.

### 0.5 `deploy.sh` git fallback

`TAG="$(git rev-parse --short HEAD)"` under `set -euo pipefail` kills the script when there is no git
history — exactly the disaster-recovery case (restoring from a zip). Fall back to a timestamp:

```bash
TAG="$(git rev-parse --short HEAD 2>/dev/null || echo "notag-$(date +%Y%m%d%H%M%S)")"
```

### 0.6 Concurrency reservation on a fresh account

`ReservedConcurrentExecutions: 5` in `template.yaml` can **fail stack creation** on a new AWS
account. AWS requires ≥10 unreserved concurrent executions to remain; established accounts sit at
1000, but new/unvetted accounts can be far lower. If `deploy.sh` fails with a message about
decreasing unreserved concurrency, either request a limit increase or comment the property out for
the first deploy and restore it after. (The ≥10 rule is certain; what a brand-new account is
provisioned with today is not — AWS has changed it.)

### 0.7 Optional, availability only

No memory cap on C++ (`-Xmx256m` is Java heap only) — a `new` loop exhausts the function's 2 GB and
OOM-kills the invocation. Mitigate with `ulimit -v` via a shell wrapper if you care. Egress is open
by default; restricting it means a VPC with no NAT, which breaks nothing (the judge calls no external
service) but adds subnets and security groups to `template.yaml`. Not now.

---

## 4. Phase 1 — Catalog container

**Do not reuse `createApp()` for the catalog.** There is an eager require chain that pulls in the
native modules:

```
app.js → routes/submission.js:5 → tracer.js:37 → trace/structuralPass.js:27-29 → tree-sitter
```

So a catalog container built on `createApp()` loads tree-sitter at startup and crashes on the missing
native addon, even though it never serves a trace request.

Write a dedicated **`judge/src/catalog.js`** entrypoint instead — ~15 lines: express, cors,
`routes/problems.js`, `/api/health`, `app.listen`. `routes/problems.js` requires only `express` and
`../problemStore`, and `problemStore.js` requires only `fs`/`path` (it calls `loadProblems()` at
module load), so nothing native is reachable. Do not import `executor.js`, `tracer.js`, `workerPool.js`,
or `routes/submission.js`.

Then `judge/Dockerfile.catalog`: `node:20-slim`, `npm ci --omit=dev`, copy `src/`,
`CMD ["node", "src/catalog.js"]`. No `gcc-c++`, no JDK. Note `npm ci` still compiles the tree-sitter
addons because they are prod dependencies in `package.json` — either accept that build cost, use the
two-stage pattern from `Dockerfile.lambda` so build tools do not ship, or (cleanest) prune the three
`tree-sitter*` deps in the catalog image since `catalog.js` never loads them.

Run it as **non-root** — `node:20-slim` defaults to root. Add `USER node`.

Restrict CORS: `src/app.js` currently does `app.use(cors())`, which sends
`Access-Control-Allow-Origin: *`. Take an allowed origin from an env var. Spring's `WebConfig`
restricts origins for its own routes; the Node containers do not inherit that.

**Strip the reference solution.** `routes/problems.js:25` correctly destructures `testCases` out
(only `testCaseCount` and the first two samples are returned — there is **no** hidden-test-case
leak), but 145 of the 157 problems carry a top-level `solution` field that lands in `publicData` and
goes to the browser. Pre-existing, not a regression, but strip it in this pass. Not a breach — a
spoiler.

Add to `D:\PROJECTS\deployment\docker-compose.yml`: the catalog service, no published port (Spring
and nginx reach it on the compose network), `restart: unless-stopped`. Add an nginx location block if
the browser calls the catalog directly (acceptable — the data is public once `solution` is stripped),
with a modest rate limit. **Never expose the executor through nginx.**

Note: only **157** problems load, not 158 — one file under `src/problems/` is skipped for lacking an
`id` field. Worth finding, out of scope here.

---

## 5. Phase 2 — Spring front door

New controller proxying to the executor. **`Map`/`String` pass-through only, no new records.**

- `POST /api/judge/run` → executor `/api/run`
- `POST /api/judge/trace` → executor `/api/trace`
- `POST /api/judge/submit` → fetch test cases from the catalog container, then call executor
  `/api/submit` with `{language, code, testCases}`

Reuse the existing `judgeRestTemplate` (connect 5 s, read 125 s) and `judgeHeaders()` from
`BattleService` — or lift both into a shared `JudgeClient`. `BattleService.callJudge` keeps working
unchanged; it just points at the executor.

**Executor submit contract changes** from `{problemId, language, code}` to
`{language, code, testCases}`. Update `judge/src/routes/submission.js` accordingly — `executor.js`
itself needs no change.

Mandatory config, each of which fails silently if missed:

- The `/api/judge/**` routes **must** be inside Spring's authenticated matcher. Miss this and you
  have built an open proxy to an unsandboxed executor — strictly worse than today.
- A semaphore capping concurrent judge calls. The 125 s read timeout means each in-flight submission
  holds a servlet thread for up to two minutes; this protects both the thread pool and the 5-slot
  Lambda budget.
- Enforce the 64 KB code limit (`MAX_CODE_SIZE` in `routes/submission.js`) in Spring *before* paying
  for an invoke. `MAX_INPUT_SIZE` is 1 MB.

Frontend: point `reactapp/src/services/judgeApi.js` at Spring, send the existing JWT, and **delete
`REACT_APP_JUDGE_TOKEN`** — it was compiled into the public bundle, so it was never a real secret.
This is what makes the token genuine: only Spring holds it afterwards. Keep the catalog calls
(`fetchProblems`, `fetchProblem`) pointed at the catalog container.

Env vars for the EC2 `.env`: `JUDGE_BASE_URL` (the Function URL), `JUDGE_TOKEN` (contents of
`judge/.judge-token`), and the catalog URL. `judge.base-url` and `judge.token` bind from those; there
is no properties file, so config comes from the environment.

**One native build is required to confirm** the proxy works in the GraalVM native image, even with
pass-through. Build on the ARM box; do not trust the JVM run alone.

---

## 6. Verification harness

Rebuild and run the image locally — the RIE is in the base image:

```bash
docker build --platform linux/amd64 -f Dockerfile.lambda -t vantage-judge:test .
docker run -d --name judge-rie-test -p 9500:8080 -e JUDGE_TOKEN=localtest vantage-judge:test
curl -s -XPOST "http://localhost:9500/2015-03-31/functions/function/invocations" -d @<fixture>
```

Write these fixtures with the Write tool (heredocs trip the worktree guard). Function URL v2 event
shape, `x-judge-token: localtest` on everything except health:

| Fixture | `rawPath` / body | Expected |
|---|---|---|
| warmup | `{"warmup": true}` (bare, not an HTTP event) | `{"warmed":true}` |
| health | GET `/api/health`, **no token** | 200, `mode: host` |
| no-token | POST `/api/run`, token header omitted | **401** |
| cpp | POST `/api/run`, `{"language":"cpp","code":"#include<iostream>\nint main(){int a,b;std::cin>>a>>b;std::cout<<a+b;}","input":"3 4"}` | `Success`, stdout `7` |
| java | POST `/api/run`, `{"language":"java","code":"import java.util.*;\npublic class Main{public static void main(String[] a){Scanner s=new Scanner(System.in);System.out.print(s.nextInt()*s.nextInt());}}","input":"6 7"}` | `Success`, stdout `42` |
| trace | POST `/api/trace`, any cpp snippet | `blockTree` present (proves tree-sitter survived the build stage) |
| submit | POST `/api/submit`, new contract with explicit `testCases` | `Accepted`, all cases pass |
| **exploit** | POST `/api/run`, cpp: `#include<cstdlib>\n#include<iostream>\nint main(){const char*t=getenv("JUDGE_TOKEN");std::cout<<(t?t:"ABSENT");}` | **`ABSENT`** — must not print `localtest` |

The exploit fixture is the acceptance test for 0.1. Run it *before* the fix to see `localtest`, then
after to see `ABSENT`. Also try `#include "/proc/self/environ"` and confirm the compile error does not
contain the token.

Body is a JSON **string** inside the event (`"body": "{\"language\":...}"`), `isBase64Encoded: false`.
A working example event is in `judge/LAMBDA_DEPLOYMENT_GUIDE.md` §Local testing.

Then: `docker rm -f judge-rie-test`.

---

## 7. Task list

**Phase 0 — security (before anything is exposed)**
- [ ] 0.1 `CHILD_ENV` in `executor.js`, all 5 spawn sites; `delete process.env.JUDGE_TOKEN` in `app.js`
- [ ] 0.2 `killSignal: "SIGKILL"` on the three run paths
- [ ] 0.3 `crypto.timingSafeEqual` in `app.js`
- [ ] 0.4 `/tmp/vantage-judge` sweep in `lambda.js`
- [ ] 0.5 `deploy.sh` timestamp fallback for missing git
- [ ] Rebuild; run all 8 fixtures including the exploit. Commit.

**Phase 1 — catalog container**
- [ ] `src/catalog.js` — dedicated entrypoint, NOT `createApp()` (see §4 require chain)
- [ ] `Dockerfile.catalog`, non-root, no toolchains
- [ ] Strip `solution` from `routes/problems.js`
- [ ] CORS origin from env
- [ ] compose service + nginx location + rate limit; measure RSS on the 2 GB host (expect ~60 MB)
- [ ] Commit.

**Phase 2 — Spring front door**
- [ ] Proxy controller, `Map` pass-through, JWT-protected matcher
- [ ] Semaphore + 64 KB pre-check
- [ ] Executor submit contract → `{language, code, testCases}`
- [ ] Frontend → Spring; delete `REACT_APP_JUDGE_TOKEN`
- [ ] Native build on the ARM box; verify login, a battle submission, and a trace
- [ ] Commit.

**Phase 3 — delete**
- [ ] From the Lambda image: `problems/`, `problemStore.js`, `routes/problems.js`
- [ ] `workerPool.js`, `sandboxes/`, the `/var/run/docker.sock` mount, all `MODE` branching, `/api/pool`
- [ ] `judge/Dockerfile` and `docker-compose.yml` (the old EC2 pool) once Lambda is proven
- [ ] Commit.

**Deploy**
- [ ] `cd judge && ./deploy.sh` (creates ECR repo + lifecycle policy, generates `.judge-token`,
      builds, pushes, deploys the stack, prints the URL and hits health)
- [ ] Put the printed URL + token into the EC2 `.env`; restart Spring
- [ ] `git push -u origin worktree-judge-lambda`

`deploy.sh` needs: `aws` CLI configured (SSO token was expired — re-auth), Docker running, and the
IAM policies listed in `LAMBDA_DEPLOYMENT_GUIDE.md` §Phase 1. Pin the region explicitly
(`AWS_REGION=... ./deploy.sh`); the default is `ap-south-1`.

---

## 8. Facts worth not rediscovering

- Base image is **`public.ecr.aws/lambda/nodejs:20`**. `public.ecr.aws/lambda/nodejs20.x` does not
  exist (`nodejs20.x` is the zip-runtime identifier) — the original guide used it and could never
  have built.
- Java needs **`java-21-amazon-corretto-devel`**. `-headless` is the JRE: it has `java` but no
  `javac`, and fails at runtime with `javac: command not found`, not at build time.
- The image is **~1.59 GB** and will not shrink meaningfully — `g++` plus a JDK is the bulk; the
  ~1 MB of problems is noise. ECR free tier is 500 MB *per account*, so the keep-last-3 lifecycle
  policy in `deploy.sh` matters.
- Deploys are tagged with the git SHA, **never `:latest`** — CloudFormation diffs the template, not
  the registry, so a fixed URI makes every deploy a silent no-op that reports success.
- tree-sitter (`tree-sitter`, `-cpp`, `-java`) has **no prebuilds** — it compiles via node-gyp and
  needs `gcc-c++ make python3` at `npm ci` time. Hence `Dockerfile.lambda`'s build stage.
- Timeout ordering, which must stay ordered or a slow submission surfaces as a generic I/O error
  instead of a `Time Limit Exceeded` verdict: per-case 5 s (`TIME_LIMIT`) < compile 30 s
  (`COMPILE_TIMEOUT`) < Lambda 120 s (`template.yaml`) < Spring read 125 s (`WebConfig`). Worst
  realistic case is ~95 s (30 + 13×5).
- Warm ping keeps **one** execution environment warm. A second concurrent submission still cold-starts
  a ~1.59 GB image (several seconds). Provisioned concurrency would fix it and is not free tier.
- Cost at ~5 requests/month: pings dominate. 5-min interval = 8,640 invocations (~0.9% of the 1 M free
  requests) and ~175 GB-seconds (~0.04% of 400,000). ECR is the only non-zero line, a few cents.
- Account migration is `aws configure` + `./deploy.sh` with no file edits — `deploy.sh` resolves the
  account at runtime and `template.yaml` creates the execution role rather than referencing an ARN.
  Only the Function URL necessarily changes (AWS-generated), so `JUDGE_BASE_URL` needs updating.
  `delete-stack` does **not** remove the ECR repo; delete it by hand when decommissioning.

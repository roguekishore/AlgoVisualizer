# Lambda Deployment Guide: Judge Service

One Lambda container image serving both C++ and Java, behind a Function URL, kept
warm by an EventBridge ping. Deploys with `./deploy.sh` — the AWS CLI, Docker and
git are the only tools needed (no SAM CLI).

## Why ECR

[Lambda container images must come from ECR](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html)
— it cannot pull from Docker Hub. `deploy.sh` creates the repository on first run.

## Why one function, not two per language

The judge picks its toolchain per request from the `language` field in the request
body. Nothing in `src/` reads an environment variable to decide, and both callers
(`BattleService.java`, `reactapp/src/services/judgeApi.js`) hold a single base URL.
A cpp/java split would need routing that doesn't exist, so the image carries both
`g++` and a JDK and answers everything.

---

## Phase 1 — One-time AWS setup

Create an IAM user (`judge-deployer`) with these managed policies, and generate
access keys for it:

- `AmazonEC2ContainerRegistryFullAccess` — create the repo, push images
- `AWSLambda_FullAccess`
- `AWSCloudFormationFullAccess`
- `IAMFullAccess` — the stack creates the Lambda execution role
- `AmazonEventBridgeFullAccess` — the warm-ping rule
- `CloudWatchLogsFullAccess` — the stack creates the log group

Then:

```bash
aws configure     # key, secret, region (ap-south-1), json
```

Verify with `aws sts get-caller-identity`.

---

## Phase 2 — Deploy

```bash
cd judge
./deploy.sh
```

That is the whole deployment. It is idempotent — re-run it for every subsequent
deploy. On each run it:

1. creates the ECR repo if absent, and applies a **keep-last-3-images** lifecycle policy
2. generates `.judge-token` (a 32-byte random shared secret) if absent — gitignored, keep it
3. builds and pushes the image tagged with the current **git short SHA**
4. deploys `template.yaml` via `aws cloudformation deploy`
5. prints the Function URL and hits `/api/health`

Overridable via environment: `AWS_REGION`, `STACK_NAME`, `REPO_NAME`,
`FUNCTION_NAME`, `WARM_PING_MINUTES`.

> **The image tag is the git SHA, never `:latest`.** CloudFormation diffs the
> template, not the registry — a fixed `:latest` URI means the stack sees no
> change and keeps running the old image while reporting success. Commit before
> deploying; an uncommitted tree gets a `-dirty-<epoch>` suffix.

---

## Phase 3 — Wire up the callers

`deploy.sh` prints both values at the end.

**Spring** (`springapp`) — via environment variables:

```bash
JUDGE_BASE_URL=https://<id>.lambda-url.ap-south-1.on.aws
JUDGE_TOKEN=<contents of judge/.judge-token>
```

These bind to `judge.base-url` and `judge.token`. Defaults are
`http://localhost:9000` and empty, so local dev needs no config.

**React** (`reactapp/.env`):

```
REACT_APP_JUDGE_URL=https://<id>.lambda-url.ap-south-1.on.aws
REACT_APP_JUDGE_TOKEN=<contents of judge/.judge-token>
```

---

## Warm polling

EventBridge sends `{"warmup": true}` every 5 minutes. `src/lambda.js` answers that
payload directly and never enters Express, so a ping bills a few milliseconds
instead of running a full request through the router.

Tune with `WARM_PING_MINUTES=3 ./deploy.sh`.

**This keeps exactly one execution environment warm.** Two simultaneous
submissions — two players in a battle — still cold-start the second one. Cold
start on a ~1 GB image is a few seconds. Provisioned concurrency would fix it and
is *not* free-tier, so it is deliberately not used here.

---

## Cost

At ~5 requests/month the pings are the entire bill, not the traffic. At 2 GB with
a 5-minute interval: 8,640 invocations/month (~0.9% of the 1M free requests) and
~175 GB-seconds (~0.04% of the 400,000 free GB-seconds). Even 1-minute polling
stays inside the free tier.

| Resource | Cost |
|---|---|
| Lambda requests + compute | free (see above) |
| EventBridge | free |
| CloudWatch Logs | free at this volume (14-day retention set by the stack) |
| ECR storage | **~$0.02–0.05/month** |
| **Total** | **a few cents/month** |

ECR is the one line that is not zero: the image is ~1 GB with both toolchains, the
free allowance is 500 MB **per account**, and overage is ~$0.10/GB/month. The
lifecycle policy caps it at 3 images.

The always-free Lambda tier is account-wide and shared with any other functions.
Verify the current allowances for your own account — AWS has changed free-tier
structure for newer accounts.

---

## Security: read this before exposing the URL

Lambda cannot run the Docker worker pool, so the image forces `MODE=host`. In that
mode `executor.js` runs `g++` and the compiled binary **in the function's own
process, as root** — no container, no 256 MB cap, no `sandbox` user. Submitted code
can read the function's environment (including its AWS credentials), read the
problem set, and open outbound connections.

What bounds the damage:

- the execution role carries **only** `AWSLambdaBasicExecutionRole` (CloudWatch Logs) — those credentials can do nothing else
- `ReservedConcurrentExecutions: 5` caps runaway compute cost
- Firecracker isolates the function from other tenants and from your other infrastructure
- `JUDGE_TOKEN` gates `/api/*` (except `/api/health`) on an `x-judge-token` header

**The token is not a real secret for the browser.** `REACT_APP_JUDGE_TOKEN` is
compiled into the public JS bundle, so anyone can extract it from the deployed
frontend. It stops casual discovery of an open compile-and-run endpoint; it does
not stop a determined abuser.

The durable fix is to proxy `/api/submit`, `/api/run` and `/api/trace` through the
Spring backend so only a server holds the token, and let the browser talk to Spring
only. That is a frontend change beyond this deployment.

Do not put anything sensitive in this function's environment variables.

---

## Timeouts

Three limits must stay ordered, or a slow-but-legitimate submission surfaces as a
generic I/O error instead of a `Time Limit Exceeded` verdict:

| Limit | Value | Where |
|---|---|---|
| per-test-case | 5 s | `TIME_LIMIT`, `src/executor.js` |
| compile | 30 s | `COMPILE_TIMEOUT`, `src/executor.js` |
| Lambda | 120 s | `Timeout`, `template.yaml` |
| Spring read | 125 s | `judgeRestTemplate`, `WebConfig.java` |

Worst realistic case is a 13-test-case problem failing every case: 30 + 13×5 ≈ 95 s.
The Spring read timeout must be the largest — it was 30 s and would have aborted
first.

---

## Rollback

```bash
aws ecr list-images --repository-name vantage-judge --region ap-south-1
aws cloudformation deploy --stack-name vantage-judge --template-file template.yaml \
  --capabilities CAPABILITY_IAM --region ap-south-1 \
  --parameter-overrides ImageUri=<account>.dkr.ecr.ap-south-1.amazonaws.com/vantage-judge:<old-sha> \
                        JudgeToken=$(cat .judge-token)
```

Or `git checkout <old-commit> && ./deploy.sh`.

---

## Local testing

The image ships the Lambda Runtime Interface Emulator:

```bash
docker build --platform linux/amd64 -f Dockerfile.lambda -t vantage-judge:test .
docker run --rm -p 9000:8080 -e JUDGE_TOKEN=local vantage-judge:test

curl -s -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" \
  -d '{"warmup": true}'
```

Unchanged for normal development: `npm run dev` (host mode) and
`npm run start:docker` (worker pool) still work — `src/index.js` and
`src/lambda.js` share the same app via `createApp()` in `src/app.js`.

---

## Files

```
judge/
  src/app.js              ← Express app, no listener (shared by both entrypoints)
  src/lambda.js           ← Lambda handler + warm-ping short-circuit
  src/index.js            ← local server (unchanged behaviour)
  Dockerfile.lambda       ← two-stage image, both toolchains
  .dockerignore
  template.yaml           ← function, role, log group, URL, warm ping
  deploy.sh               ← one-command deploy
  .judge-token            ← generated secret, gitignored
```

`Dockerfile`, `docker-compose.yml` and `sandboxes/` are untouched — the EC2
worker-pool deployment still works as before.

---

## Base image note

The base image is `public.ecr.aws/lambda/nodejs:20`. `public.ecr.aws/lambda/nodejs20.x`
does **not** exist — `nodejs20.x` is the runtime identifier for zip-packaged
functions, not an image tag. An earlier revision of this guide used it and could
never have built.

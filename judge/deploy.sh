#!/usr/bin/env bash
#
# One-command deploy for the Vantage judge Lambda.
#
#   ./deploy.sh
#
# Idempotent and safe to re-run: creates the ECR repo and lifecycle policy on
# first run, then builds, pushes, and updates the CloudFormation stack.
# Requires only the aws CLI, Docker, and git - no SAM CLI.
#
set -euo pipefail

AWS_PROFILE="${AWS_PROFILE:-vantage}"
export AWS_PROFILE

REGION="${AWS_REGION:-ap-south-1}"
STACK_NAME="${STACK_NAME:-vantage-judge}"
REPO_NAME="${REPO_NAME:-vantage-judge}"
FUNCTION_NAME="${FUNCTION_NAME:-vantage-judge}"
WARM_PING_MINUTES="${WARM_PING_MINUTES:-5}"
TOKEN_FILE="${TOKEN_FILE:-.judge-token}"

cd "$(dirname "$0")"

for tool in aws docker git; do
  command -v "$tool" >/dev/null 2>&1 || { echo "ERROR: $tool is not installed."; exit 1; }
done

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

# Immutable tag from the commit. CloudFormation compares the ImageUri string,
# so a moving :latest tag would make every deploy a silent no-op.
TAG="$(git rev-parse --short HEAD 2>/dev/null || echo "notag-$(date +%Y%m%d%H%M%S)")"
if ! git diff --quiet HEAD -- . 2>/dev/null; then
  TAG="${TAG}-dirty-$(date +%s)"
  echo "NOTE: uncommitted changes in judge/ - tagging as ${TAG}"
fi
IMAGE_URI="${REGISTRY}/${REPO_NAME}:${TAG}"

# ── Shared secret ──
# Generated once and kept locally (gitignored). The stack needs it on every
# deploy because CloudFormation cannot read back a NoEcho parameter.
if [ ! -f "$TOKEN_FILE" ]; then
  echo "Generating a new judge token -> ${TOKEN_FILE} (keep this file, do not commit it)"
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32 > "$TOKEN_FILE"
  else
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" > "$TOKEN_FILE"
  fi
fi
JUDGE_TOKEN="$(tr -d '[:space:]' < "$TOKEN_FILE")"
[ -n "$JUDGE_TOKEN" ] || { echo "ERROR: ${TOKEN_FILE} is empty."; exit 1; }

echo "==> Account ${ACCOUNT_ID} | region ${REGION} | tag ${TAG}"

# ── 1. ECR repository (idempotent) ──
if ! aws ecr describe-repositories --repository-names "$REPO_NAME" --region "$REGION" >/dev/null 2>&1; then
  echo "==> Creating ECR repository ${REPO_NAME}"
  aws ecr create-repository \
    --repository-name "$REPO_NAME" \
    --image-scanning-configuration scanOnPush=true \
    --region "$REGION" >/dev/null
fi

# Keep only the last 3 images. This image is ~1 GB and the ECR free tier is
# 500 MB/month for the whole account, so unbounded tags would slowly cost money.
echo "==> Applying ECR lifecycle policy (keep last 3 images)"
aws ecr put-lifecycle-policy \
  --repository-name "$REPO_NAME" \
  --region "$REGION" \
  --lifecycle-policy-text '{"rules":[{"rulePriority":1,"description":"Keep last 3 images","selection":{"tagStatus":"any","countType":"imageCountMoreThan","countNumber":3},"action":{"type":"expire"}}]}' >/dev/null

# ── 2. Build and push ──
echo "==> Logging in to ECR"
aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY"

echo "==> Building image (this takes a few minutes on a cold cache)"
docker build --platform linux/amd64 --provenance=false -f Dockerfile.lambda -t "$IMAGE_URI" .

echo "==> Pushing ${IMAGE_URI}"
docker push "$IMAGE_URI"

# ── 3. Deploy the stack ──
echo "==> Deploying CloudFormation stack ${STACK_NAME}"
aws cloudformation deploy \
  --stack-name "$STACK_NAME" \
  --template-file template.yaml \
  --capabilities CAPABILITY_IAM \
  --region "$REGION" \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
      "ImageUri=${IMAGE_URI}" \
      "JudgeToken=${JUDGE_TOKEN}" \
      "FunctionName=${FUNCTION_NAME}" \
      "WarmPingMinutes=${WARM_PING_MINUTES}"

# ── 4. Report and verify ──
JUDGE_URL="$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='JudgeUrl'].OutputValue" \
  --output text)"

echo
echo "==> Deployed."
echo "    URL:   ${JUDGE_URL}"
echo "    Image: ${IMAGE_URI}"
echo
echo "==> Health check"
curl -fsS "${JUDGE_URL}api/health" && echo || echo "    (health check failed - check CloudWatch logs)"
echo
echo "Set these in the Spring app:"
echo "    judge.base-url=${JUDGE_URL%/}"
echo "    judge.token=${JUDGE_TOKEN}"

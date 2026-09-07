#!/bin/bash
# Detached native build + smoke test + push for vantage.
# Run with: nohup ./build-native.sh > /tmp/vantage-build.log 2>&1 &
# Then poll /tmp/vantage-build.log for the "=== ALL DONE ===" sentinel.
set -o pipefail
cd /home/ec2-user/vantage/springapp || exit 1

IMG=roguekishore/vantage:graal

echo "=== DISK BEFORE ==="
df -h / | tail -1

# --chmod on COPY requires BuildKit; don't rely on the daemon default.
export DOCKER_BUILDKIT=1

docker build -f Dockerfile.native -t "$IMG" .
BUILD_EXIT=$?
echo "=== BUILD EXIT=$BUILD_EXIT ==="
if [ "$BUILD_EXIT" -ne 0 ]; then
  echo "=== ABORT: build failed, not pushing ==="
  echo "=== ALL DONE ==="
  exit 1
fi

# No DB reachable from the build box, so a JDBC "Communications link failure"
# is the expected pass condition: it proves we got past Boot's native-image
# version check and reached datasource init.
echo "=== SMOKE TEST (expect JDBC failure, NOT NativeImageRequirements) ==="
timeout 120 docker run --rm --entrypoint ./app "$IMG" -Xmx160m > /tmp/vantage-smoke.log 2>&1
echo "smoke exit=$?"
grep -iE 'NativeImageRequirements|Started .*Application|Communications link failure|Application run failed|UnsupportedFeature|UnknownClass' \
  /tmp/vantage-smoke.log | head -20

if grep -qi 'NativeImageRequirements' /tmp/vantage-smoke.log; then
  echo "=== ABORT: NativeImageRequirements not met, NOT pushing ==="
  echo "=== ALL DONE ==="
  exit 1
fi
echo "=== SMOKE OK (past version check) ==="

echo "=== PUSH ==="
docker push "$IMG"
echo "PUSH EXIT=$?"

echo "=== IMAGE ==="
docker images "$IMG" --format "{{.ID}} {{.Size}}"
echo "=== TOP LAYERS ==="
docker history "$IMG" --no-trunc --format "{{.Size}}" | head -6
echo "=== DISK AFTER ==="
df -h / | tail -1
echo "=== ALL DONE ==="

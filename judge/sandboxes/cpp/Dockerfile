FROM gcc:14-bookworm

# Minimal image — g++ pre-installed, stays alive as a long-lived worker
RUN apt-get update && apt-get install -y --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Create a non-root user for running submissions
RUN useradd -m -s /bin/bash sandbox

# Working directory for each submission (files written via docker cp / exec)
RUN mkdir -p /workspace && chown sandbox:sandbox /workspace
WORKDIR /workspace

USER sandbox

# Keep the container alive — the judge server sends work via `docker exec`
CMD ["sleep", "infinity"]

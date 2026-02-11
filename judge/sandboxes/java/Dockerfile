FROM eclipse-temurin:21-jdk-jammy

# Create a non-root user for running submissions
RUN useradd -m -s /bin/bash sandbox

# Working directory for each submission
RUN mkdir -p /workspace && chown sandbox:sandbox /workspace
WORKDIR /workspace

USER sandbox

# Keep the container alive — the judge server sends work via `docker exec`
CMD ["sleep", "infinity"]

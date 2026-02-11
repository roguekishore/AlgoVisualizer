FROM node:20-slim

# Install Docker CLI so the judge can manage worker pool containers.
# The Docker *daemon* runs on the host — the judge talks to it via the Docker socket.
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl gnupg && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable" > /etc/apt/sources.list.d/docker.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends docker-ce-cli && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy source code & sandbox Dockerfiles (built on first pool init)
COPY src/ ./src/
COPY sandboxes/ ./sandboxes/

# Expose port
EXPOSE 9000

# Configuration
ENV PORT=9000
ENV MODE=docker
ENV WORKER_POOL_SIZE=3

CMD ["node", "src/index.js"]

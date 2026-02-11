# Online Judge Service

A production-ready code execution service for C++ and Java, designed for LeetCode-style programming contests.

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start in host mode (no Docker needed)
MODE=host npm start
```

### Production Deployment
```bash
# Deploy with Docker
docker-compose up -d
```

## 📁 Project Structure

```
judge/
├── src/                    # Core application code
│   ├── index.js           # Express server and main entry point
│   ├── executor.js        # Code execution engine (host + Docker modes)
│   ├── workerPool.js      # Docker worker pool manager
│   ├── problemStore.js    # Problem loading and management
│   ├── routes/            # API route handlers
│   └── problems/          # Problem definitions and test cases
├── sandboxes/             # Docker sandbox configurations
│   ├── cpp/               # C++ execution environment
│   └── java/              # Java execution environment
├── package.json           # Node.js dependencies and scripts
├── Dockerfile            # Judge service container
├── docker-compose.yml    # Production orchestration
└── README.md             # This file
```

## 🔧 Architecture

### Execution Modes
- **Host Mode** (`MODE=host`): Direct g++/javac execution for local development
- **Docker Mode** (`MODE=docker`): Sandboxed execution with warm worker pools for production

### Specialized Worker Pool System
```
Judge Service (Node.js/Express) 
├── Docker Socket Access
├── Worker Pool Manager (workerPool.js)
└── Creates & Manages:
    ├── cpp-worker-1 (gcc:14-bookworm + sleep infinity)
    ├── cpp-worker-2 (gcc:14-bookworm + sleep infinity) 
    ├── cpp-worker-3 (gcc:14-bookworm + sleep infinity)
    ├── java-worker-1 (eclipse-temurin:21-jdk-jammy + sleep infinity)
    ├── java-worker-2 (eclipse-temurin:21-jdk-jammy + sleep infinity)
    └── java-worker-3 (eclipse-temurin:21-jdk-jammy + sleep infinity)
```

**Benefits of Specialized Workers:**
- **Memory Efficient**: C++ workers (~300MB) vs Java workers (~500MB)
- **Optimized Images**: Only required toolchain per worker
- **Language Isolation**: Compile errors don't cross-contaminate
- **Resource Control**: Different memory limits per language if needed

**Worker Lifecycle:**
1. **Startup**: Judge service builds sandbox images and starts 6 workers
2. **Execution**: `acquire(language)` → `docker exec` → `release(worker)`
3. **Health**: Dead workers automatically restarted
4. **Cleanup**: Graceful shutdown on service stop

## 🌐 API Endpoints

### Health Check
```http
GET /api/health
```
Response: `{ "status": "ok", "mode": "docker", "timestamp": 1234567890 }`

### Get All Problems
```http
GET /api/problems
```

### Get Single Problem
```http
GET /api/problems/{id}
```

### Submit Code (Full Judge)
```http
POST /api/submit
Content-Type: application/json

{
  "problemId": "two-sum",
  "language": "cpp",
  "code": "#include <bits/stdc++.h>..."
}
```

### Run Code (Custom Input)
```http
POST /api/run
Content-Type: application/json

{
  "language": "java", 
  "code": "public class Solution {...}",
  "input": "5\n1 2 3 4 5\n"
}
```

## 🐳 Docker Deployment

### Local Build & Push
```bash
cd judge
npm run docker:build    # Multi-platform build  
npm run docker:push     # Push to Docker Hub
```

### EC2 Deployment  
```bash
# 1. Update system and install Docker
sudo yum update -y
sudo yum install -y docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# 2. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Logout and back in (or refresh Instance Connect)
exit
# ↑ refresh browser, reconnect to Instance Connect

# 4. Create deployment directory
mkdir ~/judge-deploy
cd ~/judge-deploy

# 5. Create docker-compose.yml file
cat > docker-compose.yml << 'EOF'
version: "3.8"
services:
  judge:
    image: roguekishore/judge:latest
    container_name: algovisualizer-judge
    restart: unless-stopped
    ports:
      - "9000:9000"
    environment:
      - MODE=docker
      - WORKER_POOL_SIZE=3
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
EOF

# 6. Pull and start the service
docker-compose pull
docker-compose up -d

# 7. Check status
docker-compose ps
curl http://localhost:9000/api/health
curl http://localhost:9000/api/pool
```

**That's it!** The judge service automatically:
- Builds sandbox images on startup
- Creates and manages worker containers  
- Handles the entire worker pool lifecycle

## ⚡ Performance

- **Compilation**: Once per submission (shared across test cases)
- **Execution**: ~1-5ms per test case (after compilation)
- **Total Time**: ~100-200ms for 8 test cases including network overhead
- **Memory**: 256MB per worker container
- **Concurrency**: 6 parallel workers (3 C++ + 3 Java)

## 🔒 Security

- All code runs in isolated Docker containers
- Memory and CPU limits enforced
- 5-second time limit per execution
- No network access from user code
- Temporary files automatically cleaned

## 📊 Monitoring

### Worker Pool Status
```http
GET /api/pool
```
Shows worker health, queue status, and performance metrics.

### Logs
```bash
docker logs -f judge-service
```

## 🛠️ Development

### Adding New Problems
1. Create problem file in `src/problems/`
2. Include test cases and boilerplate code
3. Restart service to reload

### Environment Variables
- `MODE`: "host" or "docker" (auto-detected if not set)
- `PORT`: Server port (default: 9000)

### Local Testing
```bash
# Test compilation and execution
curl -X POST http://localhost:9000/api/run \
  -H "Content-Type: application/json" \
  -d '{"language":"cpp","code":"...","input":"..."}'
```

## 🚨 Troubleshooting

### Common Issues

#### "Port 9000 busy"
```bash
PORT=8080 docker-compose up -d
```

#### "Workers not starting"  
```bash
# Check judge service logs (it builds sandbox images on startup)
docker logs judge-service

# Workers are created automatically - check status
curl http://localhost:9000/api/pool
```

#### "Compilation fails"
- Verify C++17 syntax (gcc 14)
- Verify Java 21 syntax  
- Check response from `/api/submit` for detailed errors

### Debug Commands
```bash
# Worker pool status
curl http://localhost:9000/api/pool

# Service logs (includes sandbox build process)
docker logs -f judge-service

# Check running workers (created dynamically)
docker ps | grep worker
```

---

**Built for production deployment on AWS EC2 with Docker Hub integration.**

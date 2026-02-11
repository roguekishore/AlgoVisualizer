# Industry-Grade Judge Architecture Recommendations

## Current vs. Recommended Architecture

### Current Architecture (Issues)
```
┌─────────────────────────────────────────┐
│             Judge Service               │
│  ┌─────────────────────────────────────┐│
│  │  Problem Store (in-memory)          ││  ❌ Too much responsibility
│  │  ├── JS files with testcases       ││  ❌ Memory overhead  
│  │  ├── Problem metadata              ││  ❌ Limited scalability
│  │  └── Testcase validation           ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │  Code Execution Engine             ││  ✅ Good (keep this)
│  │  ├── Docker worker pools           ││
│  │  ├── Compilation & execution       ││
│  │  └── Resource management           ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### Recommended Architecture (Industry Standard)
```
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│   SpringBoot Backend │    │   Judge Service      │    │  Testcase Storage    │
│                      │    │   (Stateless)        │    │                      │
│  ┌─────────────────┐ │    │ ┌──────────────────┐ │    │ ┌──────────────────┐ │
│  │ Problem API     │ │◄───┤ │ Execution Engine │ │◄───┤ │ File System      │ │
│  │ ├── Metadata    │ │    │ │ ├── Worker Pools │ │    │ │ ├── Input files  │ │
│  │ ├── Testcases   │ │    │ │ ├── Compilation  │ │    │ │ ├── Output files │ │
│  │ └── Constraints │ │    │ │ └── Validation   │ │    │ │ └── Streaming    │ │
│  └─────────────────┘ │    │ └──────────────────┘ │    │ └──────────────────┘ │
│  ┌─────────────────┐ │    └──────────────────────┘    └──────────────────────┘
│  │ Submission API  │ │              │
│  │ ├── Queue jobs  │ │              │
│  │ ├── Track state │ │              │
│  │ └── Score calc  │ │              ▼
│  └─────────────────┘ │    ┌──────────────────────┐
│  ┌─────────────────┐ │    │   Message Queue      │
│  │ Database        │ │    │  (Redis/RabbitMQ)    │
│  │ ├── Problems    │ │◄───┤ ┌──────────────────┐ │
│  │ ├── Submissions │ │    │ │ Judge Jobs       │ │
│  │ └── Results     │ │    │ │ ├── Priority     │ │
│  └─────────────────┘ │    │ │ ├── Retry logic  │ │
└──────────────────────┘    │ │ └── Rate limiting│ │
                            │ └──────────────────┘ │
                            └──────────────────────┘
```

## Implementation Plan for SpringBoot Integration

### Phase 1: Database Migration (Immediate)

#### 1. Database Schema (PostgreSQL recommended)
```sql
-- Core Tables
CREATE TABLE problems (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    statement TEXT NOT NULL,
    time_limit_ms INTEGER DEFAULT 2000,
    memory_limit_mb INTEGER DEFAULT 256,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE problem_testcases (
    id SERIAL PRIMARY KEY,
    problem_id VARCHAR(50) REFERENCES problems(id),
    input_file_path VARCHAR(255) NOT NULL,
    output_file_path VARCHAR(255) NOT NULL,
    is_sample BOOLEAN DEFAULT FALSE,
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id VARCHAR(50) REFERENCES problems(id),
    language VARCHAR(10) NOT NULL,
    code TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'QUEUED',
    score INTEGER DEFAULT 0,
    total_time_ms INTEGER DEFAULT 0,
    max_memory_mb INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE testcase_results (
    id SERIAL PRIMARY KEY,
    submission_id UUID REFERENCES submissions(id),
    testcase_id INTEGER REFERENCES problem_testcases(id),
    status VARCHAR(20) NOT NULL, -- PASS, FAIL, TLE, MLE, RE
    execution_time_ms INTEGER,
    memory_used_mb INTEGER,
    output TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. File Structure Migration
```bash
# Move from JS to file-based storage
/testcases/
  ├── two-sum/
  │   ├── input/
  │   │   ├── 01_sample.txt     # "4\n2 7 11 15\n9"
  │   │   ├── 02_sample.txt     # "3\n3 2 4\n6"
  │   │   ├── 03_hidden.txt     # Hidden testcase
  │   │   └── 04_edge.txt       # Edge cases
  │   └── output/
  │       ├── 01_sample.txt     # "0 1"
  │       ├── 02_sample.txt     # "1 2"
  │       ├── 03_hidden.txt     # Hidden output
  │       └── 04_edge.txt       # Edge outputs
```

### Phase 2: Service Separation

#### 1. SpringBoot Backend APIs
```java
@RestController
@RequestMapping("/api/v1/problems")
public class ProblemController {
    
    @GetMapping("/{problemId}")
    public ProblemDto getProblem(@PathVariable String problemId) {
        // Return problem with sample testcases only
    }
    
    @GetMapping("/{problemId}/testcases")
    public TestcaseMetadata[] getTestcaseMetadata(@PathVariable String problemId) {
        // Return only paths and metadata, not content
    }
}

@RestController  
@RequestMapping("/api/v1/judge")
public class JudgeController {
    
    @PostMapping("/submit")
    public SubmissionDto submitCode(@RequestBody SubmissionRequest request) {
        // Queue submission for judging
        // Return submission ID immediately
    }
    
    @GetMapping("/submission/{submissionId}")
    public SubmissionResultDto getResult(@PathVariable UUID submissionId) {
        // Return current status and results
    }
}
```

#### 2. Judge Service API Contract
```javascript
// Your judge service should only receive:
POST /api/judge/execute
{
  "submissionId": "uuid",
  "language": "cpp",
  "code": "...",
  "problemId": "two-sum",
  "testcasePaths": [
    {"input": "/testcases/two-sum/input/01.txt", "output": "/testcases/two-sum/output/01.txt"},
    {"input": "/testcases/two-sum/input/02.txt", "output": "/testcases/two-sum/output/02.txt"}
  ],
  "constraints": {
    "timeLimit": 2000,
    "memoryLimit": 256
  }
}
```

### Phase 3: Performance Optimizations

#### 1. Testcase Streaming (Large testcases)
```javascript
// Instead of loading all testcases in memory
async function runAgainstTestCasesStream(language, code, testcasePaths) {
  const worker = await pool.acquire(language);
  
  try {
    // Compile once
    const filename = await writeAndCompile(worker, language, code);
    
    const results = [];
    for (const testcase of testcasePaths) {
      // Stream input file directly to program
      const result = await runSingleTestcaseStream(worker, filename, testcase);
      results.push(result);
      
      // Early termination on first failure (optional)
      if (result.status !== 'PASS') break;
    }
    
    return results;
  } finally {
    pool.release(worker);
  }
}
```

#### 2. Caching Strategy
```javascript
// Redis caching for frequently accessed data
const redis = require('redis');
const client = redis.createClient();

async function getProblemMetadata(problemId) {
  const cached = await client.get(`problem:${problemId}:metadata`);
  if (cached) return JSON.parse(cached);
  
  // Fetch from SpringBoot API
  const problem = await fetch(`http://backend:8080/api/v1/problems/${problemId}`);
  await client.setEx(`problem:${problemId}:metadata`, 300, JSON.stringify(problem));
  return problem;
}
```

## Recommended Migration Steps

### Step 1: Keep Current System, Add Database Layer
1. Create SpringBoot backend with database schema
2. Migrate problem data from JS files to database
3. Create testcase files from embedded data
4. Keep judge service unchanged initially

### Step 2: Update Judge Service API
1. Modify judge to accept testcase file paths instead of embedded data
2. Add streaming support for large testcases  
3. Remove problem storage logic from judge

### Step 3: Add Message Queue (Production)
1. Use Redis/RabbitMQ for submission queuing
2. Add retry logic and rate limiting
3. Support multiple judge instances

## Benefits of This Architecture

### Scalability
- **Horizontal scaling**: Multiple judge instances
- **Resource efficiency**: Judge only handles execution
- **Large testcases**: File-based streaming

### Security  
- **Hidden testcases**: Not exposed in API responses
- **Isolation**: Problems separate from execution engine
- **Audit trail**: Full submission history

### Maintenance
- **Testcase management**: Easy to add/modify without code changes
- **Version control**: Testcases in git
- **Monitoring**: Separate metrics for each service

### Performance
- **Caching**: Frequently accessed data cached
- **Batch processing**: Queue multiple submissions
- **Resource pooling**: Optimized worker management

## Industry Examples

This architecture is used by:
- **Codeforces**: Separate problem polygon + judge clusters
- **LeetCode**: Problem service + execution environment
- **HackerRank**: Challenge platform + assessment engine
- **AtCoder**: Problem management + online judge

The key principle: **Single Responsibility** - each service does one thing well.
# Migration Implementation Guide

## Phase 1: Immediate Changes (Keep Current System Working)

### 1. Database Schema Setup (SpringBoot)

#### Application Properties
```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/algovisualizer
    username: judge
    password: ${DB_PASSWORD:judgepass}
  jpa:
    hibernate:
      ddl-auto: create-drop # Use 'update' in production
    show-sql: true
    database-platform: org.hibernate.dialect.PostgreSQLDialect

judge:
  service:
    url: http://localhost:9000
  testcase:
    base-path: /var/testcases
```

#### Entity Classes
```java
@Entity
@Table(name = "problems")
public class Problem {
    @Id
    private String id;
    private String title;
    private String difficulty;
    private String category;
    @Column(columnDefinition = "TEXT")
    private String statement;
    private Integer timeLimitMs = 2000;
    private Integer memoryLimitMb = 256;
    
    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProblemTestcase> testcases = new ArrayList<>();
    
    // constructors, getters, setters
}

@Entity
@Table(name = "problem_testcases")
public class ProblemTestcase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id")
    private Problem problem;
    
    private String inputFilePath;
    private String outputFilePath;
    private Boolean isSample = false;
    private Integer weight = 1;
    
    // constructors, getters, setters
}

@Entity
@Table(name = "submissions")
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id")
    private Problem problem;
    
    private String language;
    @Column(columnDefinition = "TEXT")
    private String code;
    
    @Enumerated(EnumType.STRING)
    private SubmissionStatus status = SubmissionStatus.QUEUED;
    
    private Integer score = 0;
    private Integer totalTimeMs = 0;
    private Integer maxMemoryMb = 0;
    
    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TestcaseResult> results = new ArrayList<>();
    
    // constructors, getters, setters
}

public enum SubmissionStatus {
    QUEUED, RUNNING, PASSED, FAILED, COMPILATION_ERROR, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED
}

@Entity
@Table(name = "testcase_results")
public class TestcaseResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id")
    private Submission submission;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "testcase_id")
    private ProblemTestcase testcase;
    
    @Enumerated(EnumType.STRING)
    private TestcaseStatus status;
    
    private Integer executionTimeMs;
    private Integer memoryUsedMb;
    @Column(columnDefinition = "TEXT")
    private String output;
    
    // constructors, getters, setters
}

public enum TestcaseStatus {
    PASS, FAIL, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED, RUNTIME_ERROR
}
```

### 2. SpringBoot Service Layer

#### Problem Service
```java
@Service
@Transactional(readOnly = true)
public class ProblemService {
    
    @Autowired
    private ProblemRepository problemRepository;
    
    public ProblemDto getProblemForUser(String problemId) {
        Problem problem = problemRepository.findById(problemId)
            .orElseThrow(() -> new EntityNotFoundException("Problem not found: " + problemId));
            
        // Return only public data (sample testcases)
        return ProblemDto.builder()
            .id(problem.getId())
            .title(problem.getTitle())
            .difficulty(problem.getDifficulty())
            .category(problem.getCategory())
            .statement(problem.getStatement())
            .sampleTestcases(problem.getTestcases().stream()
                .filter(ProblemTestcase::getIsSample)
                .limit(2)
                .map(this::convertToDto)
                .collect(Collectors.toList()))
            .build();
    }
    
    public ProblemJudgeDto getProblemForJudge(String problemId) {
        Problem problem = problemRepository.findById(problemId)
            .orElseThrow(() -> new EntityNotFoundException("Problem not found: " + problemId));
            
        // Return all testcase metadata for judge
        return ProblemJudgeDto.builder()
            .id(problem.getId())
            .timeLimitMs(problem.getTimeLimitMs())
            .memoryLimitMb(problem.getMemoryLimitMb())
            .testcases(problem.getTestcases().stream()
                .map(tc -> TestcaseMetadataDto.builder()
                    .id(tc.getId())
                    .inputPath(tc.getInputFilePath())
                    .outputPath(tc.getOutputFilePath())
                    .weight(tc.getWeight())
                    .build())
                .collect(Collectors.toList()))
            .build();
    }
}

@Service
@Transactional
public class SubmissionService {
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    @Autowired
    private JudgeService judgeService;
    
    public SubmissionDto submitCode(SubmissionRequest request) {
        Submission submission = new Submission();
        submission.setProblem(problemRepository.getReferenceById(request.getProblemId()));
        submission.setLanguage(request.getLanguage());
        submission.setCode(request.getCode());
        submission.setStatus(SubmissionStatus.QUEUED);
        
        submission = submissionRepository.save(submission);
        
        // Queue for judging (async)
        judgeService.queueSubmission(submission.getId());
        
        return convertToDto(submission);
    }
    
    public SubmissionResultDto getSubmissionResult(UUID submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new EntityNotFoundException("Submission not found"));
            
        return SubmissionResultDto.builder()
            .id(submission.getId())
            .status(submission.getStatus())
            .score(submission.getScore())
            .totalTime(submission.getTotalTimeMs())
            .maxMemory(submission.getMaxMemoryMb())
            .results(submission.getResults().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList()))
            .build();
    }
}
```

### 3. Migration Script (Data Transfer)

#### Create Testcase Files from Current JS
```javascript
// migrate-to-files.js
const fs = require('fs');
const path = require('path');
const problemStore = require('./src/problemStore');

const TESTCASE_BASE_DIR = '/var/testcases'; // Configure this path

async function migrateProblemsToFiles() {
    const problems = problemStore.getAllProblems();
    
    for (const problemSummary of problems) {
        const problem = problemStore.getProblem(problemSummary.id);
        console.log(`Migrating ${problem.id}...`);
        
        // Create directory structure
        const problemDir = path.join(TESTCASE_BASE_DIR, problem.id);
        const inputDir = path.join(problemDir, 'input');
        const outputDir = path.join(problemDir, 'output');
        
        fs.mkdirSync(inputDir, { recursive: true });
        fs.mkdirSync(outputDir, { recursive: true });
        
        // Write testcase files
        problem.testCases.forEach((testcase, index) => {
            const tcNumber = (index + 1).toString().padStart(2, '0');
            const isSample = index < 2; // First 2 are samples
            
            const inputFile = path.join(inputDir, `${tcNumber}${isSample ? '_sample' : ''}.txt`);
            const outputFile = path.join(outputDir, `${tcNumber}${isSample ? '_sample' : ''}.txt`);
            
            fs.writeFileSync(inputFile, testcase.input);
            fs.writeFileSync(outputFile, testcase.expected);
        });
        
        console.log(`  ✅ Created ${problem.testCases.length} testcase files`);
        
        // Generate SQL insert statements
        generateProblemSQL(problem);
    }
}

function generateProblemSQL(problem) {
    // Generate SQL for database insertion
    console.log(`-- Problem: ${problem.id}`);
    console.log(`INSERT INTO problems (id, title, difficulty, category, statement, time_limit_ms, memory_limit_mb) VALUES`);
    console.log(`('${problem.id}', '${problem.title}', '${problem.difficulty}', '${problem.category}', '${problem.description.replace(/'/g, "''")}', 2000, 256);`);
    
    problem.testCases.forEach((testcase, index) => {
        const tcNumber = (index + 1).toString().padStart(2, '0');
        const isSample = index < 2;
        const inputPath = `/var/testcases/${problem.id}/input/${tcNumber}${isSample ? '_sample' : ''}.txt`;
        const outputPath = `/var/testcases/${problem.id}/output/${tcNumber}${isSample ? '_sample' : ''}.txt`;
        
        console.log(`INSERT INTO problem_testcases (problem_id, input_file_path, output_file_path, is_sample, weight) VALUES`);
        console.log(`('${problem.id}', '${inputPath}', '${outputPath}', ${isSample}, 1);`);
    });
    console.log('');
}

migrateProblemsToFiles().catch(console.error);
```

## Phase 2: Update Judge Service

### 1. Modified Judge API
```javascript
// New route for SpringBoot integration
router.post("/execute", async (req, res) => {
  const { submissionId, language, code, problemId, testcasePaths, constraints } = req.body;

  if (!submissionId || !language || !code || !testcasePaths) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await runAgainstTestcaseFiles(language, code, testcasePaths, constraints);
    
    // Report back to SpringBoot
    await reportSubmissionResult(submissionId, result);
    
    return res.json({ success: true, submissionId });
  } catch (err) {
    console.error("Execution error:", err);
    await reportSubmissionError(submissionId, err.message);
    return res.status(500).json({ error: "Execution failed" });
  }
});

// New execution function using file-based testcases
async function runAgainstTestcaseFiles(language, code, testcasePaths, constraints = {}) {
  const timeLimit = constraints.timeLimit || TIME_LIMIT;
  const memoryLimit = constraints.memoryLimit || MEMORY_LIMIT_MB;
  
  const worker = await pool.acquire(language);
  try {
    // Compile code
    const filename = language === "cpp" ? "solution.cpp" : getJavaFilename(code);
    pool.writeToWorker(worker, filename, code);
    
    const compileResult = compileInWorker(worker, language, filename);
    if (!compileResult.success) {
      return {
        status: "Compilation Error",
        error: compileResult.error,
        results: [],
        totalPassed: 0,
        totalTests: testcasePaths.length,
        time: 0,
      };
    }
    
    // Run against file-based testcases
    const results = [];
    let totalTime = 0;
    
    for (let i = 0; i < testcasePaths.length; i++) {
      const testcase = testcasePaths[i];
      const result = await runSingleTestcaseFromFile(
        worker, language, filename, testcase.input, testcase.output, timeLimit, memoryLimit
      );
      
      results.push(result);
      totalTime += result.time;
      
      // Early termination on wrong answer (optional optimization)
      if (result.status !== "PASS") {
        // Fill remaining with "Not Executed"
        for (let j = i + 1; j < testcasePaths.length; j++) {
          results.push({ status: "Not Executed", time: 0 });
        }
        break;
      }
    }
    
    const totalPassed = results.filter(r => r.status === "PASS").length;
    
    return {
      status: totalPassed === testcasePaths.length ? "Accepted" : "Wrong Answer",
      results,
      totalPassed,
      totalTests: testcasePaths.length,
      time: totalTime,
    };
    
  } finally {
    pool.release(worker);
  }
}

// Stream testcase files for memory efficiency
async function runSingleTestcaseFromFile(worker, language, filename, inputPath, outputPath, timeLimit, memoryLimit) {
  const runCommand = language === "cpp" 
    ? "/workspace/solution"
    : `java -Xmx${memoryLimit}m -cp /workspace ${filename.replace(".java", "")}`;
    
  // Copy input file to worker
  pool.execInWorker(worker, `cat > /workspace/input.txt`, { input: fs.readFileSync(inputPath, 'utf8') });
  
  const start = Date.now();
  const result = pool.execInWorker(worker, 
    `timeout ${Math.ceil(timeLimit/1000)} ${runCommand} < /workspace/input.txt > /workspace/output.txt 2>/workspace/stderr.txt`,
    { timeout: timeLimit + 1000 }
  );
  const time = Date.now() - start;
  
  if (result.killed) {
    return { status: "Time Limit Exceeded", time };
  }
  
  if (result.exitCode !== 0) {
    const stderr = pool.execInWorker(worker, "cat /workspace/stderr.txt").stdout;
    return { status: "Runtime Error", time, error: stderr };
  }
  
  // Compare output
  const actualOutput = pool.execInWorker(worker, "cat /workspace/output.txt").stdout.trim();
  const expectedOutput = fs.readFileSync(outputPath, 'utf8').trim();
  
  const isCorrect = actualOutput === expectedOutput;
  
  return {
    status: isCorrect ? "PASS" : "FAIL",
    time,
    actualOutput: isCorrect ? null : actualOutput, // Only include if wrong
    expectedOutput: isCorrect ? null : expectedOutput
  };
}

// Report results back to SpringBoot
async function reportSubmissionResult(submissionId, result) {
  try {
    await fetch('http://springboot-backend:8080/api/v1/judge/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId,
        status: result.status,
        totalPassed: result.totalPassed,
        totalTests: result.totalTests,
        time: result.time,
        results: result.results
      })
    });
  } catch (err) {
    console.error('Failed to report result:', err);
  }
}
```

### 2. SpringBoot Judge Integration

```java
@Service
public class JudgeService {
    
    @Autowired
    private ProblemService problemService;
    
    @Autowired
    private SubmissionService submissionService;
    
    @Value("${judge.service.url}")
    private String judgeServiceUrl;
    
    @Async("judgeExecutor")
    public void queueSubmission(UUID submissionId) {
        try {
            Submission submission = submissionRepository.findById(submissionId).orElseThrow();
            submission.setStatus(SubmissionStatus.RUNNING);
            submissionRepository.save(submission);
            
            // Get problem metadata
            ProblemJudgeDto problem = problemService.getProblemForJudge(submission.getProblem().getId());
            
            // Send to judge service
            JudgeRequest request = JudgeRequest.builder()
                .submissionId(submissionId)
                .language(submission.getLanguage())
                .code(submission.getCode())
                .problemId(problem.getId())
                .testcasePaths(problem.getTestcases())
                .constraints(JudgeConstraints.builder()
                    .timeLimit(problem.getTimeLimitMs())
                    .memoryLimit(problem.getMemoryLimitMb())
                    .build())
                .build();
                
            restTemplate.postForObject(judgeServiceUrl + "/api/execute", request, Void.class);
            
        } catch (Exception e) {
            // Handle failure
            updateSubmissionStatus(submissionId, SubmissionStatus.FAILED);
            log.error("Judge execution failed for submission {}", submissionId, e);
        }
    }
    
    @PostMapping("/api/v1/judge/result")
    public ResponseEntity<Void> receiveJudgeResult(@RequestBody JudgeResultDto result) {
        // Process judge result
        Submission submission = submissionRepository.findById(result.getSubmissionId()).orElseThrow();
        
        submission.setStatus(mapStatus(result.getStatus()));
        submission.setScore(calculateScore(result.getTotalPassed(), result.getTotalTests()));
        submission.setTotalTimeMs(result.getTime());
        
        // Save detailed results
        for (int i = 0; i < result.getResults().size(); i++) {
            TestcaseResultDto tcResult = result.getResults().get(i);
            
            TestcaseResult dbResult = new TestcaseResult();
            dbResult.setSubmission(submission);
            dbResult.setTestcase(getTestcaseById(submission.getProblem().getId(), i));
            dbResult.setStatus(mapTestcaseStatus(tcResult.getStatus()));
            dbResult.setExecutionTimeMs(tcResult.getTime());
            dbResult.setOutput(tcResult.getActualOutput());
            
            submission.getResults().add(dbResult);
        }
        
        submissionRepository.save(submission);
        
        return ResponseEntity.ok().build();
    }
}

@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean("judgeExecutor")
    public TaskExecutor judgeExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("Judge-");
        executor.initialize();
        return executor;
    }
}
```

## Benefits of This Approach

### Immediate Benefits
1. **Database persistence**: No more in-memory problem storage
2. **File-based testcases**: Support for larger datasets
3. **Service separation**: Clear boundaries and responsibilities

### Long-term Benefits
1. **Scalability**: Multiple judge instances possible
2. **Monitoring**: Full audit trail of submissions
3. **Security**: Hidden testcases not exposed
4. **Maintenance**: Easy to add new problems without code changes

### Migration Safety
1. **Gradual migration**: Keep both systems running during transition
2. **Backward compatibility**: Old judge API still works
3. **Data integrity**: All existing data preserved
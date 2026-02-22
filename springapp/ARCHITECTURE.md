# Spring Boot Backend — Architecture

## Overview

The backend follows a **feature-based (modular) package structure** where each business domain is a self-contained module. All related files — entities, repositories, services, controllers, DTOs, and enums — live directly inside the module package with **no sub-folders**.

This design makes it easy to add new modules (e.g., `ranking`, `battle`, `gamification`, `contest`, `leetcode`, `ai`) without touching existing code.

---

## Package Layout

```
com.backend.springapp
│
├── SpringappApplication.java          # Boot entry-point (component-scans all sub-packages)
│
├── common/                            # Cross-cutting / shared infrastructure
│   ├── WebConfig.java                 # CORS configuration
│   └── DataInitializer.java           # Database seeder (stages + 164 problems)
│
├── problem/                           # Everything related to Problems & Stages
│   ├── Problem.java                   # @Entity — problems table
│   ├── ProblemStage.java              # @Entity — problem ↔ stage join table
│   ├── Stage.java                     # @Entity — stages table
│   ├── Tag.java                       # Enum — BASIC, EASY, MEDIUM, HARD
│   ├── ProblemRepository.java         # JPA repository with custom queries
│   ├── ProblemStageRepository.java    # JPA repository for join table
│   ├── StageRepository.java           # JPA repository for stages
│   ├── ProblemService.java            # Business logic — CRUD, filters, search
│   ├── ProblemController.java         # REST /api/problems/**
│   ├── StageController.java           # REST /api/stages
│   ├── ProblemRequestDTO.java         # Inbound DTO for create/update
│   └── ProblemResponseDTO.java        # Outbound DTO (includes userStatus)
│
├── user/                              # Everything related to Users & Progress
│   ├── User.java                      # @Entity — users table
│   ├── UserProgress.java              # @Entity — userprogress table
│   ├── Status.java                    # Enum — SOLVED, ATTEMPTED
│   ├── UserProgressRepository.java    # JPA repository with custom queries
│   ├── UserProgressService.java       # Business logic — attempts, solves, stats
│   ├── UserProgressController.java    # REST /api/progress/**
│   └── UserProgressResponseDTO.java   # Outbound DTO for progress
│
└── (future modules go here)
    ├── ranking/
    ├── battle/
    ├── gamification/
    ├── contest/
    ├── leetcode/
    └── ai/
```

---

## Module Rules

| Rule | Detail |
|------|--------|
| **Flat structure** | No sub-folders inside a module — entities, repos, services, controllers, DTOs all sit at the same level. |
| **Self-contained** | Each module owns its own entities, repositories, services, controllers, request/response DTOs, and enums. |
| **Cross-module imports are OK** | A module may import classes from another module (e.g., `ProblemService` imports `UserProgressRepository`). |
| **Shared concerns → `common/`** | Configs, global exception handlers, security filters, or utilities go in `common/`. |
| **Component scanning** | `@SpringBootApplication` on `SpringappApplication` scans everything under `com.backend.springapp.*` automatically. |

---

## Cross-Module Dependencies

```
problem  ──depends on──▶  user   (ProblemService uses UserProgressRepository)
common   ──depends on──▶  problem (DataInitializer seeds Problem/Stage data)
```

---

## Adding a New Module

1. Create a new package under `com.backend.springapp.<module_name>/`
2. Place your entity, repository, service, controller, DTOs, and enums **directly** in that package (no sub-folders)
3. Spring Boot will auto-detect `@Entity`, `@Repository`, `@Service`, `@RestController` via component scanning
4. If the module needs classes from another module, simply import them (e.g., `import com.backend.springapp.problem.Problem;`)
5. Update this document with the new module's description

---

## API Endpoints (unchanged)

| Method | Path | Module | Description |
|--------|------|--------|-------------|
| `GET` | `/api/problems` | problem | Paginated problems with optional filters |
| `GET` | `/api/problems/{id}` | problem | Single problem by ID |
| `POST` | `/api/problems` | problem | Create a problem |
| `PUT` | `/api/problems/{id}` | problem | Update a problem |
| `DELETE` | `/api/problems/{id}` | problem | Delete a problem |
| `GET` | `/api/problems/search` | problem | Search by title keyword |
| `GET` | `/api/stages` | problem | List all stage names |
| `GET` | `/api/progress` | user | All progress for a user |
| `POST` | `/api/progress/{pid}/attempt` | user | Mark problem as attempted |
| `POST` | `/api/progress/{pid}/solve` | user | Mark problem as solved |
| `GET` | `/api/progress/stats` | user | User statistics |

> **No API endpoints were changed during the restructuring.** Only internal package locations moved.

---

## Tech Stack

- **Java 17** + **Spring Boot 4.0.2**
- **Spring Data JPA** (Hibernate) → MySQL
- **Lombok** — boilerplate reduction
- **Jakarta Validation** — request DTO validation
- **Spring DevTools** — hot reload in development

---

## IDE Tips

### IntelliJ IDEA
- After the restructure, do **File → Invalidate Caches / Restart** if imports show red
- Use **Ctrl+Shift+F** (Find in Files) to search `com.backend.springapp.entity` — there should be **zero** results
- Use **Refactor → Move Class** (F6) if you need to move more classes in the future

### VS Code (with Java Extension Pack)
- Run **Java: Clean Java Language Server Workspace** from the command palette
- The Java Language Server will re-index automatically after the file moves
- If red squiggles persist, restart VS Code

### Eclipse
- Right-click project → **Maven → Update Project** (Alt+F5)
- Use **Ctrl+Shift+O** on any file to auto-organize imports

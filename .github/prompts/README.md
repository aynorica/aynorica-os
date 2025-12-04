# Aynorica Prompt Library

> **24 reusable prompt templates** extracted from vault skills for consistent, high-quality code generation.

## Quick Reference

| Category | Prompts | Purpose |
|----------|---------|---------|
| [Architecture](#architecture) | 2 | ADRs, trade-off analysis |
| [Backend](#backend-nestjs) | 4 | NestJS modules, services, controllers, tests |
| [TypeScript](#typescript) | 2 | ESM migration, package setup |
| [Mesh](#microservices-mesh) | 1 | Communication patterns |
| [Resilience](#resilience) | 3 | Circuit breaker, retry, idempotency |
| [CLI](#cli-development) | 1 | Commander.js setup |
| [Git](#git-workflow) | 1 | Branching strategies |
| [DevOps](#devops) | 1 | PM2 ecosystem |
| [Monorepo](#monorepo) | 1 | Turborepo setup |
| [AI/RAG](#airag) | 2 | MCP client, RAG patterns |
| [Analysis](#analysis) | 1 | Task prioritization |
| [Meta](#meta) | 1 | Skill generation |
| [Vault Workflows](#vault-workflows) | 4 | Classifier, converter, structurer, orchestrator |

---

## Architecture

### `architecture/trade-off-analysis.prompt.md`
Framework for evaluating architectural options with explicit costs and benefits. Includes trade-off matrices and common decision pairs (scalability vs simplicity, consistency vs availability).

**Use for:** Technology selection, architecture decisions, ADR preparation

### `architecture/adr-template.prompt.md`
Architecture Decision Record template following Nygard format. Captures context, decision, consequences, and status.

**Use for:** Documenting significant architectural decisions

---

## Backend (NestJS)

### `backend/nestjs-module.prompt.md`
Generate a well-structured NestJS feature module with proper encapsulation and dependency injection.

**Generates:** Module, controller, service, DTOs, entities

### `backend/nestjs-controller.prompt.md`
REST controller with CRUD operations, proper decorators, validation, and error handling.

**Features:** OpenAPI decorators, class-validator, guards

### `backend/nestjs-service.prompt.md`
Business logic service with repository pattern, transactions, and error handling.

**Features:** TypeORM integration, caching patterns

### `backend/nestjs-testing.prompt.md`
Testing patterns for NestJS applications including unit tests and e2e tests.

**Covers:** Jest setup, mocking strategies, test utilities

---

## TypeScript

### `typescript/esm-migration.prompt.md`
Guide for migrating Node.js projects to native ESM with TypeScript.

**Covers:** tsconfig, package.json type:module, import extensions, __dirname polyfill

### `typescript/package-setup.prompt.md`
Initialize a TypeScript package with correct configuration for the monorepo.

**Includes:** tsconfig, build scripts, exports field

---

## Microservices (Mesh)

### `mesh/communication-patterns.prompt.md`
Patterns for inter-service communication in distributed systems.

**Patterns:** Pub/Sub, Request-Reply, Saga (choreography/orchestration), Competing Consumers

---

## Resilience

### `resilience/circuit-breaker.prompt.md`
Circuit breaker pattern implementation for handling cascading failures.

**States:** Closed, Open, Half-Open with configurable thresholds

### `resilience/retry-backoff.prompt.md`
Retry strategies with exponential backoff and jitter.

**Features:** Configurable attempts, backoff algorithms, timeout handling

### `resilience/idempotency.prompt.md`
Idempotency patterns for safe message/request retries.

**Covers:** Idempotency keys, deduplication, at-least-once delivery

---

## CLI Development

### `cli/commander-setup.prompt.md`
Commander.js CLI setup with subcommands, options, and interactive prompts.

**Includes:** Inquirer integration, ora spinners, chalk styling

---

## Git Workflow

### `git/workflow.prompt.md`
Git branching strategies and conventional commit patterns.

**Covers:** GitFlow, Trunk-based, commit message format, PR workflow

---

## DevOps

### `devops/pm2-ecosystem.prompt.md`
PM2 ecosystem configuration for process management.

**Includes:** Cluster mode, env variables, log rotation, restart policies

---

## Monorepo

### `monorepo/turborepo-setup.prompt.md`
Turborepo configuration for pnpm workspaces.

**Covers:** turbo.json, pipeline configuration, caching, remote caching

---

## AI/RAG

### `ai/mcp-client.prompt.md`
Model Context Protocol client implementation patterns.

**Covers:** Tool calling, resource management, MCP server integration

### `ai/rag-patterns.prompt.md`
Retrieval-Augmented Generation patterns for knowledge systems.

**Covers:** Embedding generation, vector search, hybrid search, chunking

---

## Analysis

### `analysis/task-prioritization.prompt.md`
Framework for prioritizing tasks using Eisenhower matrix and ICE scoring.

**Includes:** Priority algorithms, deadline enforcement, focus protocols

---

## Meta

### `meta/skill-generation.prompt.md`
Workflow for generating new skill documents for the vault.

**Steps:** Research, template application, RAG indexing, cross-linking

---

## Vault Workflows

These are CODE/ENGINE workflow prompts for vault operations:

### `classifier.prompt.md`
Classify raw inputs into type (input, project, resource) and determine target area.

### `converter.prompt.md`
Convert raw files (PDFs, images, text) into structured Markdown with proper frontmatter.

### `structurer.prompt.md`
Structure unorganized notes into proper vault format with correct linking.

### `orchestrator.prompt.md`
High-level orchestration for complex multi-step vault operations.

---

## Usage

Prompts are referenced by the agent's function definitions in `.github/instructions/functions.instructions.md`. When a trigger word is detected, the agent consults the relevant prompt for patterns.

### Example Reference

```markdown
## 8. Software Architecture Guidance (🏛️ Architect Mode)
> ⚠️ **Prompt**: `.github/prompts/architecture/trade-off-analysis.prompt.md`
```

---

## File Structure

```
.github/prompts/
├── README.md                          ← You are here
├── classifier.prompt.md               ← Vault workflow
├── converter.prompt.md                ← Vault workflow
├── structurer.prompt.md               ← Vault workflow
├── orchestrator.prompt.md             ← Vault workflow
├── ai/
│   ├── mcp-client.prompt.md
│   └── rag-patterns.prompt.md
├── analysis/
│   └── task-prioritization.prompt.md
├── architecture/
│   ├── adr-template.prompt.md
│   └── trade-off-analysis.prompt.md
├── backend/
│   ├── nestjs-controller.prompt.md
│   ├── nestjs-module.prompt.md
│   ├── nestjs-service.prompt.md
│   └── nestjs-testing.prompt.md
├── cli/
│   └── commander-setup.prompt.md
├── database/                          ← Reserved
├── devops/
│   └── pm2-ecosystem.prompt.md
├── git/
│   └── workflow.prompt.md
├── mesh/
│   └── communication-patterns.prompt.md
├── meta/
│   └── skill-generation.prompt.md
├── monorepo/
│   └── turborepo-setup.prompt.md
├── resilience/
│   ├── circuit-breaker.prompt.md
│   ├── idempotency.prompt.md
│   └── retry-backoff.prompt.md
├── security/                          ← Reserved
└── typescript/
    ├── esm-migration.prompt.md
    └── package-setup.prompt.md
```

---

## Related

- `.github/instructions/` — 14 instruction files for agent context
- `.github/agents/aynorica.agent.md` — Main agent definition
- `Atlas/30 Resources/` — Source skills (vault-indexed)

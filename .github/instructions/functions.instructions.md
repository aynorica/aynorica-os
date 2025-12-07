---
applyTo: "**"
---

# Primary Functions

**14 core capabilities** — detailed mappings in `.github/project/mental-model-map.md`

## Domain Trigger Table

| Domain | Trigger Words | Core Law |
|--------|---------------|----------|
| **Architecture** | architecture, design, microservices, scaling, trade-offs, ADR | Everything is a trade-off. Never recommend without context. |
| **Security** | pentest, vulnerability, OWASP, hacking, bug bounty, threat model | Security is a process. Defense in depth, least privilege, assume breach. |
| **Backend/NestJS** | NestJS, API, controller, service, module, provider, guard | Dependency injection > globals. Type-safe interfaces. |
| **Frontend/Next.js** | nextjs, app router, react, server component, client component | Server-first. Client components only when necessary. |
| **Database/Prisma** | prisma, orm, schema, migration, transaction, relation | Schema is contract. Evolve via migrations. Thin data layer. |
| **Testing/Jest** | jest, test, unit test, mock, spy, coverage | One behavior per test. Fast, deterministic, observable. |
| **Git** | git, commit, branch, merge, rebase, PR, workflow | Conventional commits. Small, atomic changes. |
| **TypeScript** | typescript, ts, type error, tsconfig, ESM, module | Strict mode always. Explicit types > inference. |
| **CLI** | CLI, command line, commander, inquirer, prompt | Commander.js. Clear subcommands. Spinners for async. |
| **npm/Publishing** | publish, npm, deploy package, release | Semantic versioning. Test thoroughly. Document clearly. |
| **Task Management** | task, todo, priority, deadline, stuck, procrastinating | One thing matters most. Externalize everything. Ship incomplete. |
| **Memory/Issues** | remember, issue, track, blocked, ready work, discovered | Externalize to GitHub Issues. Track dependencies. |
| **Psychology** | psychology, shadow, projection, unconscious, archetype | Confront shadow. Integration > suppression. (Base knowledge) |
| **Microservices** | microservices, message queue, circuit breaker, idempotency | Design for failure. Retries + backoff. (Base knowledge) |

**Loading**: See `mental-model-map.md` → "Pre-Response Protocol" for when to load domain prompts.

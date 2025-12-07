# Capability Index

14 domains with trigger words. Load matching prompts on detection.

## Domain → Prompt Mapping

| Domain       | Triggers                                        | Prompt Path               |
| ------------ | ----------------------------------------------- | ------------------------- |
| Architecture | architecture, design, trade-off, ADR, scaling   | `prompts/architecture/**` |
| Backend      | NestJS, controller, service, module, API, guard | `prompts/backend/**`      |
| Frontend     | next.js, react, component, app router           | `prompts/frontend/**`     |
| Database     | prisma, schema, migration, ORM, query           | `prompts/database/**`     |
| Testing      | jest, test, mock, coverage, unit                | `prompts/testing/**`      |
| TypeScript   | typescript, type error, tsconfig, ESM           | `prompts/typescript/**`   |
| Git          | git, commit, branch, PR, merge                  | `prompts/git/**`          |
| Security     | security, OWASP, vulnerability, threat          | `prompts/security/**`     |
| npm          | publish, package, version, release              | `prompts/npm/**`          |
| Analysis     | prioritize, task, productivity, focus           | `prompts/analysis/**`     |
| CLI\*        | CLI, commander, command line                    | `prompts/cli/**`          |
| DevOps\*     | PM2, deploy, ecosystem                          | `prompts/devops/**`       |
| Monorepo\*   | turborepo, workspace, packages                  | `prompts/monorepo/**`     |
| System       | adapt, stack detection, detect framework        | `prompts/system/**`       |

\*Rare domains — require explicit "load X guide" to trigger

## Network Commands

| Command           | Action                       | Protocol                         |
| ----------------- | ---------------------------- | -------------------------------- |
| `ay:sync`         | Push brain state to GitHub   | `persistent-memory.instructions` |
| `ay:remember [x]` | Create GitHub Issue          | `persistent-memory.instructions` |
| `ay:ready`        | Query unblocked work         | `persistent-memory.instructions` |
| `ay:deploy`       | Create child node            | `workflows/deploy-protocol.md`   |
| `ay:leave`        | Extract learnings, create PR | `workflows/leave-protocol.md`    |
| `ay:merge`        | Accept child learnings       | `workflows/merge-protocol.md`    |
| `ay:checkpoint`   | Full state dump + sync       | `persistent-memory.instructions` |

## Session State

Always check `project/session-state.md` for active mission context.

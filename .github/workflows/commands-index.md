# Workflow Command Index

Quick reference for network commands. Load full protocols only when executing commands.

---

## Command Reference

| Command               | What It Does                                     | Full Protocol                                 |
| --------------------- | ------------------------------------------------ | --------------------------------------------- |
| `ay:deploy`           | Create child node from current parent            | `workflows/deploy-protocol.md` (164 lines)    |
| `ay:leave`            | Extract learnings, create harvest PR             | `workflows/leave-protocol.md` (296 lines)     |
| `ay:merge [node]`     | Accept child's learnings, synthesize into parent | `workflows/merge-protocol.md` (537 lines)     |
| `ay:propagate`        | Push updates to all children (rebase)            | `workflows/propagate-protocol.md` (667 lines) |
| `ay:scan [node]`      | Lightweight knowledge discovery (~2K tokens)     | `workflows/scan-protocol.md` (368 lines)      |
| `ay:sync`             | Push brain state to GitHub                       | `network-protocol.instructions.md`            |
| `ay:network`          | Show node directory                              | `network-protocol.instructions.md`            |
| `ay:load [node]`      | Load full context of another node                | `network-protocol.instructions.md`            |
| `ay:unload [node]`    | Drop node from context                           | `network-protocol.instructions.md`            |
| `ay:context`          | Show currently loaded nodes                      | `network-protocol.instructions.md`            |
| `ay:remember [thing]` | Create GitHub Issue                              | `persistent-memory.instructions.md`           |
| `ay:ready`            | Query ready work                                 | `persistent-memory.instructions.md`           |
| `ay:checkpoint`       | Full state dump + sync                           | `persistent-memory.instructions.md`           |
| `ay:status`           | Show session state                               | `persistent-memory.instructions.md`           |

---

## Loading Strategy

**Before command execution:**

1. User types `ay:{command}`
2. Load corresponding full protocol from table above
3. Execute command following protocol
4. Unload protocol after completion (free tokens)

**Memory commands** (`ay:sync`, `ay:remember`, etc.) — implementations in `network-protocol.instructions.md` and `persistent-memory.instructions.md` (already loaded)

---

## Token Savings

| Protocol  | Lines     | Est. Tokens | Loading Strategy                      |
| --------- | --------- | ----------- | ------------------------------------- |
| deploy    | 164       | ~574        | On `ay:deploy` trigger                |
| leave     | 296       | ~1,036      | On `ay:leave` trigger                 |
| merge     | 537       | ~1,880      | On `ay:merge` trigger                 |
| propagate | 667       | ~2,334      | On `ay:propagate` trigger             |
| scan      | 368       | ~1,288      | On `ay:scan` trigger                  |
| **Total** | **2,032** | **~7,112**  | **Lazy-loaded (not in base context)** |

**Benefit:** ~7,000 tokens freed from default load, available on-demand.

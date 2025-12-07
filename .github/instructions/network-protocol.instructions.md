---
applyTo: "**"
---

# Network Protocol Instructions

> **Purpose**: Operational rules for Aynorica node network lifecycle, sync, and command execution.

---

## Core Rules

1. **Prime is authoritative** — `aynorica-registry.json` on `main` is the single source of truth
2. **Intellectual merges only** — Child → Parent is synthesis, NOT git merge
3. **Explicit commands** — All network operations require `ay:` prefix (unambiguous triggers)
4. **Sync before network ops** — Always `ay:sync` current state before `ay:deploy`, `ay:leave`, or `ay:merge`
5. **Lazy loading by default** — Load full node context only on explicit `ay:load` or when within visibility window

---

## Command Reference

All `ay:` commands are detailed in `.github/workflows/commands-index.md`.

| Command                   | Purpose                                                  | Protocol File                 |
| ------------------------- | -------------------------------------------------------- | ----------------------------- |
| `ay:deploy`               | Create child node, link to external project             | `deploy-protocol.md`          |
| `ay:leave`                | Extract learnings, create harvest PR                     | `leave-protocol.md`           |
| `ay:merge [node]`         | Accept child's learnings, synthesize, delete child       | `merge-protocol.md`           |
| `ay:propagate`            | Push parent updates to all children                      | `propagate-protocol.md`       |
| `ay:scan [node]`          | Preview node capabilities without loading                | `scan-protocol.md`            |
| `ay:sync`                 | Push brain state to GitHub                               | `persistent-memory.instructions` |
| `ay:network`              | Show node directory                                      | (inline)                      |
| `ay:load [node]`          | Load full node context                                   | (inline)                      |
| `ay:unload [node]`        | Drop node from context                                   | (inline)                      |
| `ay:context`              | Show active context                                      | (inline)                      |
| `ay:remember [thing]`     | Create GitHub Issue                                      | `persistent-memory.instructions` |
| `ay:ready`                | Query unblocked work                                     | `persistent-memory.instructions` |
| `ay:checkpoint`           | Full state dump + sync                                   | `persistent-memory.instructions` |
| `ay:status`               | Show session state                                       | `persistent-memory.instructions` |

**Command Execution Pattern**:
1. Parse command + args → 2. Validate preconditions → 3. Confirm with user → 4. Execute → 5. Update registry (if topology changed) → 6. Sync to GitHub → 7. Report completion

**Error Handling**: State failure point, show unchanged state, suggest remediation, never partially apply.

---

## Visibility Window

**Auto-loaded**: Current node (full) + ±2 levels (manifests only) + All others (directory entries)  
**Override**: `ay:load` / `ay:unload`  
**Recalc trigger**: Node switch, topology change, explicit request

---

## Registry Updates

**Trigger events**: Deploy, leave, merge, child list/status changes  
**Pattern**: Modify registry → Commit "chore: {change}" → Push → Propagate (if Prime)

---

## Conflict Resolution (Propagate/Rebase)

1. Stop → 2. Show conflicts → 3. Ask [manual/abort/skip] → 4. Resolve or skip → 5. Continue

---

## Integration Points

| File                             | Integration                   |
| -------------------------------- | ----------------------------- |
| `persistent-memory.instructions` | Memory commands (`ay:sync`, etc.) |
| `handoff.instructions`           | Departure report format       |
| `mental-model-map.md`            | Self-awareness + prompt loading |
| `network-model-map.md`           | Topology visualization        |

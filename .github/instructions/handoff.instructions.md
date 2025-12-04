---
applyTo: "**/*handoff*"
---

# Handoff Document Protocol

Use this format when creating session handoff documents.

## Required Structure

```markdown
# [Topic] - Handoff Report

## 🎯 Summary
[2-3 sentence overview of what was accomplished]

## 📊 Metrics
| Metric | Value |
|--------|-------|
| Time Spent | X hours |
| Files Created | N |
| Files Modified | N |
| Tests Passing | X/Y |

## ✅ Completed
- [ ] Task 1 with details
- [ ] Task 2 with details

## 🔄 In Progress
- [ ] Task with current state

## ❌ Not Started
- [ ] Task with reason

## 🚨 Blockers
- Blocker 1: Description and mitigation

## 📋 Next Session Priority
1. **HIGH**: [specific action]
2. **MEDIUM**: [specific action]
3. **LOW**: [specific action]

## 🗂️ Files Changed
| File | Change Type | Purpose |
|------|-------------|---------|
| `/path/to/file` | Created/Modified | Description |

## 📝 Decisions Made
| Decision | Rationale | Reversible? |
|----------|-----------|-------------|
| Chose X over Y | Because Z | Yes/No |

## 🔗 Related Resources
- [[Project Link]]
- [[Skill Link]]
```

## Naming Convention

```
YYYY-MM-DD_[Type]_[Topic].md

Types:
- Handoff (session continuation)
- Architecture (design decisions)
- Session-Summary (work log)
- Plan (proposed work)
```

## Location

- Active work: `Inbox/Aynorica/`
- After 7 days: Move to `Archive/Aynorica Logs/`

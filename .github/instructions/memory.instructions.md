---
applyTo: "**"
---

# Memory Architecture (CRITICAL)

**You have long-term memory.** The RAG system is your memory retrieval interface.

## The Two-Layer Memory Model

| Layer | Purpose | Location |
|-------|---------|----------|
| **Source of Truth** | Human-readable knowledge | Vault `.md` files (Atlas/30 Resources/) |
| **Memory Index** | Semantic search layer | PostgreSQL + pgvector (RAG) |

## Core Laws

1. **Vault-First**: Every piece of knowledge MUST exist as a `.md` file following vault protocols (templates, frontmatter, folder structure)
2. **RAG is Index, Not Storage**: RAG indexes vault files — it's a search layer, not the canonical data
3. **Query Before Acting**: On complex tasks, query your memory FIRST to retrieve relevant skills
4. **No Orphan Knowledge**: If it's worth knowing, it's worth a vault file

## Memory Flow

```
New Knowledge → Create .md file (vault protocol) → Index to RAG → Query RAG to find → Read .md for full context
```

## When to Query Memory

- **ALWAYS** at the start of complex technical tasks
- **ALWAYS** when trigger keywords appear (architecture, security, patterns, etc.)
- **ALWAYS** when you feel uncertain about best practices
- **NEVER** for simple conversational requests

---

## Skill Retrieval Protocol (Your Long-Term Memory Interface)

> **Full Documentation**: `Atlas/30 Resources/RAG and Semantic Search Skill.md`

⚠️ **THIS IS YOUR PRIMARY MEMORY SYSTEM. USE IT PROACTIVELY.**

### Query Your Memory When:
- Starting ANY complex technical task (architecture, security, deployment, patterns)
- Trigger keywords appear in user request
- You feel uncertain about best practices
- You need decision frameworks or trade-off analysis

### Quick Reference:
- **Hybrid Search**: `POST http://localhost:3001/skills/embeddings/hybrid-search` with `{"query": "...", "limit": 5}`
- **Vector Search**: `POST http://localhost:3001/skills/embeddings/search`
- **Keyword Search**: `POST http://localhost:3001/skills/embeddings/keyword-search`

### After Retrieval:
1. **Read full skill file** (previews are fragments)
2. **Apply patterns** from the skill
3. **Reference source** in your response (`[[Skill Name]]`)

**Remember:** RAG results point to vault files. The `.md` file is the truth.

---

## Skill Development Protocol

> **Full Workflow**: `Atlas/30 Resources/Skill Generation Workflow Skill.md`

**Trigger Phrases**: "add a skill", "generate skill", "create skill", "new skill about X"

### Quick Summary:
1. **Research** — Fetch 3-5 authoritative sources via `fetch_webpage`
2. **Create** — Read `tpl_Skill.md` template, create file in `Atlas/30 Resources/`
3. **Index** — Run `POST /skills/reload` then `POST /skills/<id>/index`
4. **Cross-link** — Update related skills, announce to user

### Critical Rules:
- ⚠️ **Vault-First** — The `.md` file is the source of truth, RAG just indexes it
- ⚠️ **Never skip research** — Always gather external knowledge first
- ⚠️ **Always read template** — `read_file("System/Templates/tpl_Skill.md")`
- ⚠️ **Always register with RAG** — Skills must be indexed to be searchable

---
mode: agent
description: Protocol for creating new skills in the knowledge base
---

# Skill Generation Workflow

The canonical workflow for creating new skills in the Aynorica knowledge base.

## Trigger Phrases

When user says any of these, activate this workflow:
- "add a skill"
- "generate skill"
- "create skill"
- "new skill about X"
- "research and document X"

## Phase 1: Research (MANDATORY)

**Never skip research.**

### Step 1.1: Search the Internet

Use `fetch_webpage` to gather best practices from authoritative sources:

```
fetch_webpage([
  "https://official-docs.example.com/best-practices",
  "https://well-known-blog.com/topic-guide"
], "topic best practices")
```

**What to search for:**
- "[Topic] best practices 2024/2025"
- "[Topic] patterns and anti-patterns"
- Comparison articles, trade-off analyses
- Code examples from reputable sources

### Step 1.2: Check Existing Knowledge

Before creating, verify:
1. Does a related skill already exist?
2. Does the topic overlap with existing skills?
3. What skills should this depend on?

### Step 1.3: Synthesize Sources

- Combine insights from 3-5 authoritative sources
- Note conflicting advice and when each applies
- Prioritize practical, battle-tested patterns

## Phase 2: Create Skill File

### Step 2.1: Read the Template (BLOCKING)

**Always read the template first:**
```
read_file("System/Templates/tpl_Skill.md")
```

### Step 2.2: File Location and Naming

**Location:** `Atlas/30 Resources/[Topic] Skill.md`

**Naming Convention:** Descriptive name ending in "Skill"
- ✅ `Docker Containerization Skill.md`
- ✅ `Redis Caching Patterns Skill.md`
- ❌ `Docker.md`
- ❌ `Redis Notes.md`

### Step 2.3: Required Frontmatter

```yaml
---
type: resource
tags: [resource, skill, <domain-tag-1>, <domain-tag-2>]
related_area: [[Career]]  # or appropriate area
dependencies: [prerequisite-skill-id]
trigger_keywords: [keyword1, keyword2, keyword3]
priority: 50  # 0-100
enabled: true
version: 1.0.0
---
```

### Step 2.4: Required Sections

| Section | Purpose |
|---------|---------|
| 🗺️ Map of Content | Related skills, section links |
| Core Concepts | Definitions, terminology |
| Best Practices | Numbered, with code examples |
| Common Patterns | Problem → Solution → Trade-offs |
| Anti-Patterns | Bad → Why bad → Better |
| Quick Reference | Cheat sheet, decision matrix |
| 📚 Linked Inputs | Dataview query |
| 🔗 External References | Source URLs |

## Phase 3: Generate skill.json Sidecar

After creating the markdown file, generate the `.skill.json` sidecar.

### Why Both Formats?

| Format | Purpose |
|--------|---------|
| `.md` | Human-readable knowledge |
| `.skill.json` | Machine-readable metadata |

### Run Migration Script

```bash
npx tsx scripts/migrate-skills.ts
```

This will:
1. Scan `Atlas/30 Resources/` for `*Skill*.md` files
2. Extract frontmatter
3. Validate against JSON Schema
4. Write `*.skill.json` sidecar files

## Phase 4: Register with RAG

Index the skill for semantic search.

### Step 4.1: Reload Skills

```bash
curl -X POST http://localhost:3001/skills/reload
```

### Step 4.2: Index the New Skill

```bash
curl -X POST http://localhost:3001/skills/<skill-id>/index
```

### Step 4.3: Verify Indexing

```bash
curl http://localhost:3001/skills/embeddings/stats
```

## Phase 5: Cross-Link and Announce

### Step 5.1: Update Related Skills

Add `[[New Skill]]` links in related skill files in their "Related Skills" section.

### Step 5.2: Announce to User

```
✅ Skill Created: [Skill Name]
📍 Location: Atlas/30 Resources/[Filename]
🔢 Chunks indexed: X
🔗 Related to: [list of related skills]
```

## Quick Reference

### Command Cheat Sheet

| Step | Action | Command |
|------|--------|---------|
| Research | Fetch web | `fetch_webpage(urls, query)` |
| Check vault | Search existing | `grep_search("skill name")` |
| Template | Read template | `read_file("System/Templates/tpl_Skill.md")` |
| Create | Write file | `create_file(path, content)` |
| Generate JSON | Create sidecar | `npx tsx scripts/migrate-skills.ts` |
| Reload | Refresh list | `curl -X POST localhost:3001/skills/reload` |
| Index | Add to RAG | `curl -X POST localhost:3001/skills/<id>/index` |
| Verify | Check status | `curl localhost:3001/skills/embeddings/stats` |

### Skill ID Derivation

File name → kebab-case ID:
- `NestJS Development Skill.md` → `nestjs-development`
- `RAG and Semantic Search Skill.md` → `rag-and-semantic-search`

## Workflow Checklist

```
□ Phase 1: Research
  □ Searched 3-5 authoritative sources
  □ Checked vault for existing/related skills
  □ Identified dependencies
  
□ Phase 2: Create File
  □ Read tpl_Skill.md template
  □ Created file in Atlas/30 Resources/
  □ Included all required frontmatter fields
  □ Included all required sections

□ Phase 3: Generate skill.json
  □ Ran npx tsx scripts/migrate-skills.ts
  
□ Phase 4: Register with RAG
  □ Ran /skills/reload
  □ Ran /skills/<id>/index
  □ Verified with /embeddings/stats
  
□ Phase 5: Cross-Link
  □ Updated related skill files
  □ Announced to user with stats
```

## Anti-Patterns

| Anti-Pattern | Why Bad | Better |
|--------------|---------|--------|
| Skip research | Outdated/incorrect info | Always fetch 3-5 sources |
| Skip template | Inconsistent structure | Always read template first |
| Skip RAG registration | Can't find via search | Always reload + index |
| No cross-links | Orphan knowledge | Link to related skills |

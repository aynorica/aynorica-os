---
applyTo: "**"
---

# Schema Quick Reference

## Status Emojis (Strict)

| Emoji | Meaning | Used In |
|-------|---------|---------|
| 🟥 | To Read / Inbox | Inputs |
| 🟧 | In Progress | Inputs |
| 🟩 | Done | Inputs |
| 🏃 | Active | Projects |
| 💤 | On Hold | Projects |
| ✅ | Complete | Projects |

## Required Frontmatter by Type

| Type | Required Fields |
|------|-----------------|
| `input` | `created`, `status`, `type`, `url`, `rating`, `related_area`, `related_resource`, `tags: [input, processed/converter]` |
| `project` | `created`, `status`, `deadline`, `related_area`, `tags: [project]` |
| `area` | `type: area`, `tags: [area]` |
| `resource` | `type: resource`, `tags: [resource]`, `related_area` |

> **Note**: For `input` type, include `url:` and `rating:` fields even if empty. Always add `processed/converter` to tags.

## Directory Rules

| Folder | Contains |
|--------|----------|
| `Atlas/10 Projects` | Active projects (`type: project`) |
| `Atlas/20 Areas` | Areas of responsibility (`type: area`) |
| `Atlas/30 Resources` | Resources, MOCs, AND processed inputs |
| `Archive/` | Completed/old items |
| `System/Templates` | `tpl_*.md` templates |

## Directory Protocols

### `Inbox/Amir` (User Input Stream)
- **Purpose**: Landing zone for ALL raw inputs from Amir
- **Content**: Unstructured text, voice dumps, images, PDFs, random ideas
- **Action**: Process → Structure → Move to `Atlas`

### `Inbox/Aynorica` (Orchestrator Memory)
- **Purpose**: Your working memory and session logs
- **Content**: Session summaries, decision logs, generated diagrams
- **Format**: `YYYY-MM-DD_[Type]_[Topic].md`
- **Lifecycle**: 
  - New logs land here
  - After 7 days OR when actioned → Move to `Archive/Aynorica Logs`
  - Logs older than 90 days → Can be bulk-deleted

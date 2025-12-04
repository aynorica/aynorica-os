---
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runSubagent']
---

# Remember you are Aynorica and the user is Amir

# Sync Task — Full Vault Synchronization

## Overview
This task orchestrates a full sync of the Second Brain vault, ensuring all raw inputs are processed and filed correctly.

## Directory Reference
```
Inbox/
├── Amir/       # User raw inputs
└── Aynorica/   # Agent raw inputs (logs, snapshots)

Atlas/
├── 10 Projects/   # Active projects (type: project)
├── 20 Areas/      # Area dashboards (type: area)
└── 30 Resources/  # Resources & processed inputs (type: resource | input)
```

## Workflow

### Phase 1: CONVERTER (Raw → Markdown)
1. Read `/.github/prompts/converter.prompt.md` for instructions
2. Scan `/Inbox/Amir` and `/Inbox/Aynorica` for non-markdown files
3. Convert raw files to structured `.md` with proper frontmatter
4. Delete original raw files after successful processing

### Phase 2: STRUCTURER (Markdown → Atlas)
1. Read `/.github/prompts/structurer.prompt.md` for instructions
2. Scan `/Inbox/Amir` and `/Inbox/Aynorica` for processed `.md` files
3. Classify each file (Project, Input, Area, Resource)
4. Apply templates and ensure `related_area` links are valid
5. Move files to appropriate Atlas folder (`10 Projects`, `20 Areas`, `30 Resources`)

### Phase 3: Integrity Check
1. Verify no dead links exist in Atlas
2. Ensure all files have valid frontmatter
3. Check Dataview queries still work

### Phase 4: Git Commit
1. Run `git status` to review changes
2. Stage all changes: `git add -A`
3. Commit with message: `vault sync: <brief description of changes>`
4. Push if remote is configured

## Important
- Files inside `.github/` are system config — read them but process carefully
- Keep `Agents/` folder synced with `.github/prompts/` (mirror copies)
- Never create new root folders


---
mode: agent
description: Git workflow conventions and best practices for teams
---

# Git Workflow Guide

Best practices for branching, commits, and collaboration.

## Branching Strategies

### Trunk-Based Development (Recommended)

Best for CI/CD and DevOps practices.

```
main ─────●────●────●────●────●─────
          │         │
          └─ feat ──┘  (1-2 days max)
```

- Collaborate on single `main` branch
- Short-lived feature branches (max 1-2 days)
- Direct commits to trunk for small teams
- Used by Google, Facebook at scale

### GitHub Flow (Lightweight)

1. Create descriptive branch (`add-user-auth`)
2. Make atomic commits
3. Open Pull Request
4. Address review comments
5. Merge and delete branch

```bash
git checkout main && git pull
git checkout -b feat/new-feature
# work...
git push -u origin feat/new-feature
# create PR on GitHub
```

### GitFlow (Legacy)

Only for scheduled release cycles. Otherwise avoid.

## Conventional Commits

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | SemVer |
|------|-------------|--------|
| `feat:` | New feature | MINOR |
| `fix:` | Bug fix | PATCH |
| `docs:` | Documentation | — |
| `style:` | Formatting | — |
| `refactor:` | Restructure | — |
| `perf:` | Performance | — |
| `test:` | Add tests | — |
| `chore:` | Maintenance | — |
| `ci:` | CI/CD changes | — |
| `build:` | Build system | — |

### Breaking Changes

```
feat!: remove deprecated API endpoint

BREAKING CHANGE: /v1/users endpoint removed
```

### Commit Rules

| Rule | Example |
|------|---------|
| 50 chars max summary | `feat: add user auth` |
| Imperative mood | "Add" not "Added" |
| Blank line before body | ✅ |
| Wrap body at 72 chars | For readability |
| Explain **why** | Context matters |

## Branch Protection Rules

Essential for team repositories:

```yaml
# Recommended GitHub branch protection
- Require pull request reviews (1-2 reviewers)
- Require status checks to pass
- Require conversation resolution
- Require signed commits (optional)
- Require linear history (cleaner log)
```

## Essential Git Config

```ini
[user]
    name = Your Name
    email = your@email.com

[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    lg = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'
    unstage = reset HEAD --
    amend = commit --amend -C HEAD
    undo = reset HEAD~1

[pull]
    rebase = true

[init]
    defaultBranch = main
```

## Daily Workflow

```bash
# Start new feature
git checkout main && git pull
git checkout -b feat/new-feature

# Save progress (interactive staging)
git add -p
git commit -m "feat: add new feature"

# Keep branch updated
git fetch origin
git rebase origin/main

# Push and create PR
git push -u origin feat/new-feature
```

## Fixing Mistakes

```bash
# Undo last commit (keep changes)
git reset HEAD~1

# Amend last commit message
git commit --amend

# Revert a pushed commit
git revert <sha>

# Clean untracked files
git clean -fd

# Stash work in progress
git stash push -m "WIP: description"
git stash pop
```

## Investigation Commands

```bash
# Who changed a line
git blame <file>

# Search commit messages
git log --grep="keyword"

# Find bug introduction
git bisect start
git bisect bad HEAD
git bisect good <known-good>
```

## Repository Files

| File | Purpose |
|------|---------|
| `README.md` | Overview, setup, usage |
| `CONTRIBUTING.md` | How to contribute |
| `LICENSE` | Legal terms |
| `CHANGELOG.md` | Version history |
| `.gitignore` | Ignore patterns |
| `CODEOWNERS` | Auto reviewer assignment |

## Team Size Guidelines

| Practice | Solo/Small (1-5) | Larger (5+) |
|----------|------------------|-------------|
| Branching | Direct to trunk OK | Feature branches required |
| Review | Optional/async | Required (1-2 reviewers) |
| CI | Basic tests | Full suite + staging |
| Commits | Flexible style | Conventional enforced |

## Security Best Practices

1. **Never commit secrets** — Use `.env` files
2. **Enable secret scanning** on GitHub
3. **Sign commits** with GPG/SSH
4. **Enable 2FA** on accounts
5. **Use `.gitignore`** for sensitive files

## Anti-Patterns to Avoid

- ❌ Giant commits mixing multiple changes
- ❌ Vague commit messages ("fix stuff")
- ❌ Long-lived branches (>1 week)
- ❌ Force pushing shared branches
- ❌ Committing directly to main without review

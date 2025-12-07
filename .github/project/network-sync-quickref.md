# Aynorica Network Sync — Quick Reference

## Commands

```bash
ay:sync     # Push local .github/ changes to network
ay:pull     # Pull updates from Prime (rebase)
ay:network  # Show network status
ay:leave    # Generate departure report & sync
```

## Typical Workflows

### Morning Routine
```bash
ay:network              # Check if behind parent
ay:pull                 # Get Prime's updates (if any)
# Start working...
```

### After Making Changes
```bash
# Edit files in .github/
ay:sync                 # Push to network
```

### End of Day
```bash
ay:network              # Check sync status
ay:sync                 # Push any uncommitted work
```

### Leaving Project
```bash
ay:leave                # Full departure protocol
```

## Status Indicators

```
✅ Up to date           # No action needed
⚠️  X commits behind    # Run ay:pull
⬆️  X commits ahead     # Run ay:sync
📝 Uncommitted changes  # Commit, then ay:sync
```

## Conflict Resolution

If `ay:pull` shows conflicts:

```bash
# Core instructions → Take Prime's version
git checkout --theirs .github/instructions/*.md

# Project/methodologies → Keep your version
git checkout --ours .github/project/*.md
git checkout --ours .github/methodologies/*.md

# Continue rebase
git add .github/
git rebase --continue
```

## Troubleshooting

```bash
# SSH issues
ssh-add ~/.ssh/id_ed25519
ssh -T git@github.com

# Alias not working
source ~/.bashrc

# Behind parent error
ay:pull              # Pull first
ay:sync              # Then push
```

## File Locations

```
Scripts:   ~/.aynorica/scripts/
Config:    ~/.bashrc (aliases)
Docs:      .github/instructions/network-sync.instructions.md
           .github/project/NETWORK-SYNC-IMPLEMENTATION.md
```

## What Gets Synced

✅ `.github/instructions/` (core behavior)
✅ `.github/prompts/` (capabilities)
✅ `.github/project/` (session state)
✅ `.github/methodologies/` (hacker playbooks)

❌ `*/credentials/` (sensitive data)
❌ `*/sessions/` (local only)
❌ `.env` files (secrets)

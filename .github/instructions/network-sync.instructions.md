---
applyTo: "**"
---

# Network Sync Instructions (WSL Node)

> **Purpose**: Autonomous synchronization with Aynorica Network (Prime → Hacker branch)
> **Node**: aynorica-hacker (WSL Ubuntu 22.04)
> **Parent**: main (Prime)

---

## Auto-Sync Behavior

When running in WSL environment, automatically sync with network:

1. **On session start**: Check for parent updates, notify if behind
2. **On `ay:sync` command**: Stage, commit, push `.github/` changes
3. **On session end**: Auto-sync if changes detected in `.github/`

---

## Command Detection & Actions

| User Says | Action | Script |
|-----------|--------|--------|
| "sync", "push updates", "save state" | Push to network | `push-to-network.sh` |
| "pull updates", "get latest", "sync from Prime" | Pull from Prime | `pull-from-parent.sh` |
| "network status", "where am I", "show topology" | Show status | `check-network-status.sh` |

### Command Execution

When user triggers a command:

1. **Detect intent** — Match against trigger phrases above
2. **Run script** — Execute corresponding shell script via `run_in_terminal`
3. **Parse output** — Check for errors, conflicts, or completion
4. **Report status** — Concise summary to user

**Example Flow**:

```
User: "ay:sync"
→ Detect: Push to network
→ Run: bash ~/.aynorica/scripts/push-to-network.sh
→ Parse: Check exit code, capture stdout
→ Report: "Synced 3 files to aynorica-hacker branch"
```

---

## Conflict Resolution Rules

When conflicts occur during `ay:pull` (rebase):

| File Pattern | Strategy | Rationale |
|--------------|----------|-----------|
| `.github/instructions/*` | `--theirs` (Prime) | Core behavioral rules owned by Prime |
| `.github/project/*` | `--ours` (Local) | Project-specific state |
| `.github/methodologies/*` | `--ours` (Local) | Specialized hacker content |
| `.github/prompts/*` | `--theirs` (Prime) | Shared prompt library |

**Auto-Resolution Script** (if conflict detected):

```bash
# Favor Prime for instructions
git checkout --theirs .github/instructions/

# Keep local project state
git checkout --ours .github/project/

# Keep specialized methodologies
git checkout --ours .github/methodologies/

git add .github/
git rebase --continue
```

**Manual Resolution Required When**:

- Same file edited by both Prime and Hacker
- JSON structure conflicts (registry, config)
- User-specific content in shared files

---

## Session Hooks

### Session Start

```bash
# Check network status on session start
cd /home/amirdlz/aynorica-hacker
git fetch aynorica-network main --quiet 2>/dev/null

BEHIND=$(git rev-list --count HEAD..aynorica-network/main 2>/dev/null)
if [ "$BEHIND" -gt 0 ]; then
    echo "🔄 Aynorica: $BEHIND updates available from Prime. Pull with 'ay:pull'"
fi
```

**Aynorica Action**: If session starts and workspace is active, silently check status and notify if updates available.

### Session End

```bash
# Auto-sync if changes detected
if [ -n "$(git status --porcelain .github/)" ]; then
    echo "🧠 Brain state changes detected. Run 'ay:sync' to push to network."
fi
```

**Aynorica Action**: Before session closes, check for uncommitted changes and prompt sync.

---

## Troubleshooting Protocols

### Issue 1: SSH Permission Denied

**Detection**: `push-to-network.sh` fails with "Permission denied (publickey)"

**Resolution**:

```bash
# Check SSH key
ssh -T git@github.com

# If fails, start ssh-agent and add key
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519  # Or user's key path

# Verify
ssh -T git@github.com 2>&1 | grep "successfully authenticated"
```

**Aynorica Action**: Detect error, guide user through SSH setup.

### Issue 2: Merge Conflicts

**Detection**: `pull-from-parent.sh` exits with code 1, "CONFLICT" in output

**Resolution**:

```bash
# List conflicted files
git diff --name-only --diff-filter=U

# Apply strategy per file pattern
for file in $(git diff --name-only --diff-filter=U); do
    if [[ $file == .github/instructions/* ]]; then
        git checkout --theirs "$file"
    elif [[ $file == .github/project/* ]]; then
        git checkout --ours "$file"
    elif [[ $file == .github/methodologies/* ]]; then
        git checkout --ours "$file"
    else
        echo "Manual resolution needed: $file"
    fi
done

git add .github/
git rebase --continue
```

**Aynorica Action**: Parse conflict output, apply resolution rules, guide user for manual cases.

### Issue 3: Detached HEAD

**Detection**: `git branch --show-current` returns empty string

**Resolution**:

```bash
git checkout aynorica-hacker
git pull aynorica-network aynorica-hacker
```

**Aynorica Action**: Detect state, reattach HEAD to branch.

---

## Network Registry Integration

### Local Registry Update

When syncing, update local registry file:

```json
{
  "nodes": {
    "aynorica-hacker": {
      "lastSync": "2025-12-06T14:23:00Z",
      "status": "active",
      "parent": "main",
      "commitsBehind": 0,
      "commitsAhead": 2
    }
  }
}
```

**Update Trigger**: After successful `ay:sync` or `ay:pull`

**Implementation**: Parse script output, update registry, commit registry change.

---

## Installation Verification

After running `setup-network-sync.sh`, verify:

1. ✅ Remote `aynorica-network` configured
2. ✅ Scripts executable: `ls -la ~/.aynorica/scripts/*.sh`
3. ✅ Aliases in `.bashrc`: `grep ay:sync ~/.bashrc`
4. ✅ SSH connectivity: `ssh -T git@github.com`
5. ✅ Can fetch: `git fetch aynorica-network`

**Aynorica Action**: Run verification checks, report status.

---

## Security Considerations

1. **SSH Keys**: Never commit private keys. Store in `~/.ssh/`, chmod 600
2. **Sensitive Data**: Never sync non-`.github/` content to network
3. **Credentials**: Store in `shopify-recon/credentials/` (gitignored)
4. **Token Storage**: Use environment variables, not committed files

---

## Integration with Existing Protocols

| Protocol | Integration Point |
|----------|-------------------|
| `persistent-memory.instructions.md` | Session state syncs via network |
| `handoff.instructions.md` | Handoff reports pushed to network |
| `amir-profile.instructions.md` | Behavioral rules pulled from Prime |
| `functions.instructions.md` | Capability updates pulled from Prime |

---

## Session Learnings

- **2025-12-06**: WSL sync protocol implemented for autonomous network sync
- Scripts provide CLI interface: `ay:sync`, `ay:pull`, `ay:network`
- Conflict resolution favors Prime for core instructions, local for specialized content
- Auto-sync on session end ensures network stays updated

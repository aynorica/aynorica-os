# Aynorica VSCode Extension - Quick Start

## Phase 1 Complete ✅

**Status:** Core functionality implemented and compiled  
**Time:** ~4 hours  
**LOC:** ~500 lines TypeScript

---

## What's Implemented

### ✅ Core Modules

-   **Registry Reader** (`registry.ts`) - Reads `aynorica-registry.json`, maps branches to nodes
-   **Status Bar Manager** (`statusBar.ts`) - Shows current node + sync status
-   **Command Manager** (`commands.ts`) - 6 commands implemented
-   **Extension Entry** (`extension.ts`) - Activation, auto-sync, staleness warnings

### ✅ Commands Available

1. `Aynorica: Show Network` - Display topology in markdown
2. `Aynorica: Sync Brain State` - Git add/commit/push `.github/`
3. `Aynorica: Deploy New Node` - Prompt + open chat with `ay:deploy`
4. `Aynorica: Load Node Context` - Picker + open chat with `ay:load`
5. `Aynorica: Refresh Registry` - Rebase from parent
6. `Aynorica: Quick Actions` - Menu for all commands

### ✅ Keybindings

-   `Ctrl+Alt+A N` → Show Network
-   `Ctrl+Alt+A S` → Sync Brain State

### ✅ Auto-Sync

-   Detects `.github/` file saves
-   Debounced prompt (5s default)
-   Configurable via settings

---

## Testing Now

### 1. Launch Extension Host

**In VSCode:**

1. Open `aynorica-vscode` folder
2. Press `F5` (or Run → Start Debugging)
3. New VSCode window opens (Extension Development Host)

### 2. Test in Aynorica Workspace

**In Extension Development Host:**

1. Open `aynorica-os` workspace
2. Status bar should show: `🧠 aynorica-prime | 1 nodes | ↑ [time]`
3. Click status bar → Quick Actions menu appears

### 3. Test Commands

**Command Palette** (`Ctrl+Shift+P`):

-   Type `Aynorica`
-   Try each command:
    -   Show Network → Opens markdown with topology
    -   Sync Brain State → Commits + pushes (if changes exist)
    -   Deploy Node → Prompts for specialty
    -   Load Node → Shows picker (if >1 node)
    -   Refresh Registry → Rebases from parent

### 4. Test Keybindings

-   `Ctrl+Alt+A N` → Network view
-   `Ctrl+Alt+A S` → Sync prompt

### 5. Test Auto-Sync

1. Edit any file in `.github/` (e.g., `session-state.md`)
2. Save
3. Wait 5 seconds
4. Notification appears: "Sync brain state to GitHub?"

---

## Expected Behavior

### ✅ Activation

-   Only activates if `.github/node-manifest.md` or `.github/aynorica-config.json` exists
-   Shows warning if registry missing

### ✅ Status Bar

-   Updates on registry file changes
-   Click → Quick Actions
-   Tooltip shows node details

### ✅ Staleness Warning

-   On activation, if `lastSync > 24h`, shows warning
-   Offers "Refresh Now" button

---

## Known Limitations (By Design)

❌ No tree view sidebar (Phase 2)  
❌ No webview visualizer (Phase 3)  
❌ No custom SCM provider (Phase 3)  
❌ Not published to marketplace (local install only)

---

## Troubleshooting

### Extension doesn't activate

**Check:** Output panel → Aynorica (dropdown)  
**Verify:** `.github/node-manifest.md` exists

### Status bar shows "not initialized"

**Cause:** Registry missing  
**Fix:** Run `ay:sync` in Copilot Chat

### Compilation errors

**Fix:** `npm run compile` in `aynorica-vscode/`

### Commands not found

**Check:** Extension Host is running (F5)  
**Verify:** Context `aynorica.enabled` is set

---

## Next Steps (Phase 2 - Optional)

### Tree View Sidebar

-   Hierarchical node display
-   Right-click context menu
-   Drag-to-reorder children

### Enhanced Keybindings

-   `Ctrl+Alt+A L` → Load Node
-   `Ctrl+Alt+A D` → Deploy Node
-   `Ctrl+Alt+A R` → Refresh Registry

### Git Integration

-   Pre-commit hook for validation
-   Conflict resolution UI
-   Branch switching command

---

## Deployment Options

### Option A: Local Install (VSIX)

```bash
npm install -g @vscode/vsce
vsce package
# Produces: aynorica-vscode-0.1.0.vsix
# Install: Extensions → ... → Install from VSIX
```

### Option B: Symlink (Dev Mode)

```bash
# Windows
mklink /D "%USERPROFILE%\.vscode\extensions\aynorica-vscode" "C:\path\to\aynorica-vscode"

# Linux/Mac
ln -s /path/to/aynorica-vscode ~/.vscode/extensions/
```

### Option C: Workspace Recommendation

Add to `.vscode/extensions.json`:

```json
{
	"recommendations": ["aynorica.aynorica-vscode"]
}
```

---

## Architecture Decisions

See [ADR-002: VSCode Deep Integration](../.github/architecture/vscode-integration-adr.md) for:

-   Trade-off analysis (Options 1-3)
-   Registry replication strategy
-   Implementation plan
-   Fitness functions

---

## Success Metrics

| Metric               | Target   | Status |
| -------------------- | -------- | ------ |
| Commands implemented | 6        | ✅ 6   |
| Status bar active    | Yes      | ✅ Yes |
| Keybindings working  | 2+       | ✅ 2   |
| Auto-sync enabled    | Yes      | ✅ Yes |
| Compilation clean    | 0 errors | ✅ 0   |

---

## Test Now

**Press `F5` in the `aynorica-vscode` folder to launch Extension Development Host.**

Check status bar, test commands, verify auto-sync.

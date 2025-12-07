# Aynorica VSCode Extension

VSCode extension for managing the Aynorica node network directly from the editor.

## Features

### Status Bar Integration

-   Shows current node, network size, and last sync time
-   Click for quick access to common commands

### Commands

Access via Command Palette (`Ctrl+Shift+P`):

-   **Aynorica: Show Network** - Display network topology
-   **Aynorica: Sync Brain State** - Commit and push `.github/` changes
-   **Aynorica: Deploy New Node** - Create new child node (opens chat)
-   **Aynorica: Load Node Context** - Load another node's context (opens chat)
-   **Aynorica: Refresh Network Registry** - Rebase to update registry from parent

### Keybindings

-   `Ctrl+Alt+A N` - Show Network
-   `Ctrl+Alt+A S` - Sync Brain State

### Auto-Sync

Automatically prompts to sync when you save files in `.github/` (configurable).

## Installation

### Local Development

1. Install dependencies:

    ```bash
    cd aynorica-vscode
    npm install
    ```

2. Compile TypeScript:

    ```bash
    npm run compile
    ```

3. Press `F5` in VSCode to launch Extension Development Host

### Production Install

1. Package extension:

    ```bash
    npm install -g @vscode/vsce
    vsce package
    ```

2. Install `.vsix` file:
    - VSCode → Extensions → `...` → Install from VSIX

## Configuration

Settings available in VSCode settings:

```json
{
	"aynorica.autoSyncOnSave": true,
	"aynorica.syncDebounceMs": 5000,
	"aynorica.showStatusBar": true
}
```

## Requirements

-   VSCode 1.85.0 or higher
-   Git installed and accessible
-   Workspace must contain `.github/node-manifest.md` or `.github/aynorica-config.json`

## Architecture

See [ADR-002: VSCode Deep Integration](../.github/architecture/vscode-integration-adr.md) for design decisions and implementation details.

## Development

```bash
# Compile TypeScript
npm run compile

# Watch mode (auto-recompile)
npm run watch

# Lint
npm run lint
```

## Troubleshooting

**Extension doesn't activate:**

-   Ensure `.github/node-manifest.md` exists in workspace
-   Check Output panel → Aynorica for activation logs

**Status bar shows "not initialized":**

-   Registry file missing - run `ay:sync` in Copilot Chat

**Sync fails:**

-   Verify git is configured and you have push access
-   Check for uncommitted conflicts

## License

MIT

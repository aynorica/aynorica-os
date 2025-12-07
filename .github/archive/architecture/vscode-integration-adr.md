# ADR-002: VSCode Deep Integration for Aynorica Network

**Date:** 2025-12-07  
**Status:** Proposed  
**Supersedes:** N/A

---

## Context

Currently, Aynorica network commands (`ay:deploy`, `ay:sync`, etc.) require typing in GitHub Copilot Chat. There's no visual representation of network state, no keyboard shortcuts, and no native VSCode integration.

**Current Pain Points:**

1. Manual command typing in chat (no autocomplete, no shortcuts)
2. Network state invisible until explicitly queried
3. Git operations manual (add/commit/push for sync)
4. No indication of which node you're on
5. No quick access to common operations
6. Context loading requires chat messages

**Deployment Topology Reality:**

-   You work in **external projects** (local Windows, remote WSL, remote SSH)
-   Projects have `.github/` linked to `aynorica-prime` branch (symlink or sparse checkout)
-   Extension runs in project workspace, not in `aynorica-prime` repo
-   Registry must be accessible from any connection type

**Opportunity:** VSCode's extension API provides rich integration points — commands, views, status bar, keybindings, webviews, and SCM providers.

---

## Decision Drivers

| Driver                       | Weight | Rationale                                      |
| ---------------------------- | ------ | ---------------------------------------------- |
| **Development Speed**        | 5      | You need this working fast, not perfect        |
| **Cognitive Load Reduction** | 5      | Less typing, more visual feedback              |
| **Reversibility**            | 4      | Can fall back to chat commands                 |
| **Maintenance Burden**       | 3      | You must be able to maintain this solo         |
| **User Experience**          | 4      | Seamless integration beats powerful but clunky |

---

## Considered Options

### Option 1: Tasks + Keybindings Only (No Code)

**Implementation:**

-   `.vscode/tasks.json` with shell commands
-   `.vscode/keybindings.json` for shortcuts
-   `.vscode/settings.json` for status bar config

**Pros:**

-   ✅ Zero code, JSON only
-   ✅ Works immediately (30 min setup)
-   ✅ No build process
-   ✅ No maintenance burden

**Cons:**

-   ❌ No visual feedback (status bar, tree view)
-   ❌ No dynamic behavior (can't show current node)
-   ❌ Git operations still manual
-   ❌ No context injection into Copilot Chat

**Trade-offs Accepted:**

-   Static experience vs development speed

---

### Option 2: Minimal Extension (Status Bar + Commands)

**Implementation:**

-   TypeScript extension (~500 lines)
-   Status bar item showing current node
-   Command palette integration
-   Keybindings via `package.json`

**Pros:**

-   ✅ Visual feedback (status bar)
-   ✅ Native command palette
-   ✅ Dynamic behavior (reads registry)
-   ✅ ~1 day development
-   ✅ Maintainable (small codebase)

**Cons:**

-   ❌ Requires build process (TypeScript)
-   ❌ Extension packaging/publishing
-   ❌ No tree view yet
-   ❌ No webview visualizer

**Trade-offs Accepted:**

-   Feature richness vs faster delivery

---

### Option 3: Full-Featured Extension (All Integration Points)

**Implementation:**

-   TypeScript extension (~2000 lines)
-   Status bar + tree view + webview
-   Custom SCM provider
-   Chat context variables
-   LSP for instruction files

**Pros:**

-   ✅ Complete VSCode integration
-   ✅ Best user experience
-   ✅ Network visualizer (D3.js tree)
-   ✅ Validation for instruction files

**Cons:**

-   ❌ 1-2 weeks development
-   ❌ High maintenance burden
-   ❌ Complex debugging
-   ❌ Overkill for current network size (2 nodes)

**Trade-offs Accepted:**

-   Scope creep risk vs comprehensive solution

---

## Decision

**We choose Option 2: Minimal Extension (Status Bar + Commands)**

**Rationale:**

1. **Development Speed (5)**: 1 day vs 2 weeks for Option 3
2. **Cognitive Load (5)**: Status bar provides constant awareness, commands reduce typing
3. **Reversibility (4)**: Can always enhance with Option 3 features later
4. **Maintenance (3)**: ~500 lines is manageable solo
5. **UX (4)**: 80% of value with 20% of complexity

**Why not Option 1?**  
No visual feedback = cognitive load remains high. Status bar is critical.

**Why not Option 3?**  
YAGNI. You have 2 nodes. Build for today's scale, enhance when pain appears.

**Registry Deployment Strategy: Option B (Replication + Lazy Refresh)**

-   Each node's `.github/` contains full `aynorica-registry.json` (replicated from parent)
-   Extension reads local registry (no network dependency on startup)
-   `ay:sync` rebases → registry updates automatically
-   Refresh command available for manual update
-   Works offline, always current after rebase

---

## Implementation Plan

### Phase 1: Foundation (Day 1, 4 hours)

**Deliverables:**

1. Extension scaffold (`aynorica-vscode/`)
2. `package.json` with commands + activation events
3. Status bar item reading `aynorica-registry.json`
4. 5 core commands registered

**Files Created:**

```
aynorica-vscode/
├── package.json          (manifest)
├── tsconfig.json         (TypeScript config)
├── src/
│   ├── extension.ts      (entry point)
│   ├── statusBar.ts      (status bar manager)
│   ├── commands.ts       (command handlers)
│   └── registry.ts       (JSON reader)
└── .vscodeignore
```

**Commands Implemented:**

-   `aynorica.showNetwork` → Display registry as tree
-   `aynorica.syncBrainState` → `git add .github/ && git commit && git push`
-   `aynorica.deployNode` → Prompt for specialty, trigger chat message
-   `aynorica.loadNode` → Node picker → Load into chat context
-   `aynorica.refreshStatus` → Re-read registry

**Status Bar:**

```
🧠 aynorica-prime | 2 nodes | ↑ synced 5m ago
```

Click → Quick pick menu with commands

---

### Phase 2: Command Enhancements (Day 2, 3 hours)

**Deliverables:**

1. Tree view in sidebar
2. Right-click context menu
3. Keybindings via `package.json`

**Tree View Structure:**

```
AYNORICA NETWORK
├─ 📍 aynorica-prime (current)
│  └─ 🛡️ aynorica-hacker
└─ [+ Deploy New Node]
```

**Keybindings:**

```json
{
	"command": "aynorica.showNetwork",
	"key": "ctrl+alt+a n"
}
```

**Context Menu (Right-click node):**

-   Load Node Context
-   Scan Node
-   Merge Node (if child)
-   Switch to Node

---

### Phase 3: Git Integration (Day 3, 2 hours)

**Deliverables:**

1. Auto-sync on file save (debounced)
2. Sync notification with approval prompt
3. Branch switching command

**Implementation:**

```ts
vscode.workspace.onDidSaveTextDocument((doc) => {
	if (doc.uri.path.includes(".github/")) {
		debounce(() => promptSync(), 5000);
	}
});
```

**Sync Flow:**

1. User saves `.github/` file
2. 5 seconds later: Notification appears
3. "Sync brain state to GitHub? [Yes] [Not Now]"
4. On Yes: `git add .github/ && git commit -m "chore: sync brain state" && git push`

---

### Phase 4: Polish (Day 4, 2 hours)

**Deliverables:**

1. Error handling (no git, no network)
2. Loading indicators
3. Configuration options
4. README with usage guide

**Configuration (`settings.json`):**

```json
{
	"aynorica.autoSyncOnSave": true,
	"aynorica.syncDebounceMs": 5000,
	"aynorica.showStatusBar": true
}
```

---

## Architecture Design

### Extension Manifest (`package.json`)

```json
{
	"name": "aynorica-vscode",
	"displayName": "Aynorica Network Controller",
	"description": "Manage Aynorica node network from VSCode",
	"version": "0.1.0",
	"engines": {
		"vscode": "^1.85.0"
	},
	"categories": ["Other"],
	"activationEvents": [
		"workspaceContains:.github/node-manifest.md",
		"workspaceContains:.github/aynorica-config.json"
	],
	"main": "./dist/extension.js",
	"contributes": {
		"commands": [
			{
				"command": "aynorica.showNetwork",
				"title": "Show Network",
				"category": "Aynorica"
			},
			{
				"command": "aynorica.syncBrainState",
				"title": "Sync Brain State",
				"category": "Aynorica"
			},
			{
				"command": "aynorica.deployNode",
				"title": "Deploy New Node",
				"category": "Aynorica"
			},
			{
				"command": "aynorica.loadNode",
				"title": "Load Node Context",
				"category": "Aynorica"
			},
			{
				"command": "aynorica.refreshRegistry",
				"title": "Refresh Network Registry",
				"category": "Aynorica"
			}
		],
		"keybindings": [
			{
				"command": "aynorica.showNetwork",
				"key": "ctrl+alt+a n",
				"when": "aynorica.enabled"
			},
			{
				"command": "aynorica.syncBrainState",
				"key": "ctrl+alt+a s",
				"when": "aynorica.enabled"
			}
		],
		"views": {
			"explorer": [
				{
					"id": "aynoricaNetworkView",
					"name": "Aynorica Network"
				}
			]
		},
		"configuration": {
			"title": "Aynorica",
			"properties": {
				"aynorica.autoSyncOnSave": {
					"type": "boolean",
					"default": true,
					"description": "Automatically prompt to sync brain state when .github/ files are saved"
				},
				"aynorica.syncDebounceMs": {
					"type": "number",
					"default": 5000,
					"description": "Debounce time (ms) before showing sync prompt"
				}
			}
		}
	}
}
```

### Core Module: `registry.ts`

```ts
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export interface NodeEntry {
	branch: string;
	parent: string | null;
	children: string[];
	description: string;
	manifestPath: string;
	created: string;
	lastSync: string;
	status: string;
	projectPath: string | null;
}

export interface Registry {
	version: string;
	primeNode: string;
	nodes: Record<string, NodeEntry>;
	pendingMerges: any[];
}

export class RegistryReader {
	private registryPath: string;
	private watcher: vscode.FileSystemWatcher | undefined;

	constructor(workspaceRoot: string) {
		this.registryPath = path.join(
			workspaceRoot,
			".github",
			"aynorica-registry.json",
		);
	}

	read(): Registry | null {
		try {
			const content = fs.readFileSync(this.registryPath, "utf8");
			return JSON.parse(content);
		} catch (error) {
			return null;
		}
	}

	getCurrentNode(): string | null {
		// Read current git branch
		const { execSync } = require("child_process");
		try {
			const branch = execSync("git branch --show-current", {
				encoding: "utf8",
			}).trim();
			const registry = this.read();
			if (!registry) return null;

			// Map branch to node
			for (const [nodeId, node] of Object.entries(registry.nodes)) {
				if (node.branch === branch) {
					return nodeId;
				}
			}
			return null;
		} catch {
			return null;
		}
	}

	watch(callback: () => void): vscode.Disposable {
		this.watcher = vscode.workspace.createFileSystemWatcher(
			this.registryPath,
		);
		this.watcher.onDidChange(callback);
		this.watcher.onDidCreate(callback);
		return this.watcher;
	}
}
```

### Core Module: `statusBar.ts`

```ts
import * as vscode from "vscode";
import { RegistryReader } from "./registry";

export class StatusBarManager {
	private statusBarItem: vscode.StatusBarItem;
	private registryReader: RegistryReader;

	constructor(registryReader: RegistryReader) {
		this.registryReader = registryReader;
		this.statusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Left,
			100,
		);
		this.statusBarItem.command = "aynorica.quickActions";
	}

	update() {
		const registry = this.registryReader.read();
		const currentNode = this.registryReader.getCurrentNode();

		if (!registry || !currentNode) {
			this.statusBarItem.text = "🧠 Aynorica (not initialized)";
			this.statusBarItem.show();
			return;
		}

		const nodeCount = Object.keys(registry.nodes).length;
		const node = registry.nodes[currentNode];
		const lastSync = this.formatTimeSince(node.lastSync);

		this.statusBarItem.text = `🧠 ${currentNode} | ${nodeCount} nodes | ↑ ${lastSync}`;
		this.statusBarItem.tooltip = `Current: ${currentNode}\nChildren: ${node.children.length}\nClick for quick actions`;
		this.statusBarItem.show();
	}

	private formatTimeSince(isoDate: string): string {
		const now = new Date();
		const then = new Date(isoDate);
		const diffMs = now.getTime() - then.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 1) return "just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays}d ago`;
	}

	dispose() {
		this.statusBarItem.dispose();
	}
}
```

### Core Module: `commands.ts`

```ts
import * as vscode from "vscode";
import { RegistryReader } from "./registry";
import { execSync } from "child_process";

export class CommandManager {
	constructor(
		private context: vscode.ExtensionContext,
		private registryReader: RegistryReader,
	) {}

	register() {
		this.context.subscriptions.push(
			vscode.commands.registerCommand(
				"aynorica.showNetwork",
				this.showNetwork.bind(this),
			),
			vscode.commands.registerCommand(
				"aynorica.syncBrainState",
				this.syncBrainState.bind(this),
			),
			vscode.commands.registerCommand(
				"aynorica.deployNode",
				this.deployNode.bind(this),
			),
			vscode.commands.registerCommand(
				"aynorica.loadNode",
				this.loadNode.bind(this),
			),
			vscode.commands.registerCommand(
				"aynorica.quickActions",
				this.quickActions.bind(this),
			),
			vscode.commands.registerCommand(
				"aynorica.refreshRegistry",
				this.refreshRegistry.bind(this),
			),
		);
	}

	private async showNetwork() {
		const registry = this.registryReader.read();
		if (!registry) {
			vscode.window.showErrorMessage("Registry not found");
			return;
		}

		const tree = this.buildNetworkTree(registry);
		const doc = await vscode.workspace.openTextDocument({
			content: tree,
			language: "markdown",
		});
		vscode.window.showTextDocument(doc);
	}

	private buildNetworkTree(registry: any): string {
		let output = "# Aynorica Network\n\n";
		for (const [nodeId, node] of Object.entries(registry.nodes)) {
			const isCurrent = this.registryReader.getCurrentNode() === nodeId;
			const marker = isCurrent
				? "📍"
				: node.children.length > 0
				? "📦"
				: "📄";
			output += `${marker} **${nodeId}**${
				isCurrent ? " (current)" : ""
			}\n`;
			output += `  - Branch: ${node.branch}\n`;
			output += `  - Children: ${node.children.length}\n`;
			output += `  - ${node.description}\n\n`;
		}
		return output;
	}

	private async syncBrainState() {
		const answer = await vscode.window.showInformationMessage(
			"Sync brain state to GitHub?",
			"Yes",
			"No",
		);

		if (answer !== "Yes") return;

		try {
			execSync("git add .github/", { cwd: vscode.workspace.rootPath });
			execSync('git commit -m "chore: sync brain state"', {
				cwd: vscode.workspace.rootPath,
			});
			execSync("git push", { cwd: vscode.workspace.rootPath });
			vscode.window.showInformationMessage("✅ Brain state synced");
		} catch (error) {
			vscode.window.showErrorMessage(`Sync failed: ${error}`);
		}
	}

	private async deployNode() {
		const specialty = await vscode.window.showInputBox({
			prompt: "Node specialty (e.g., nestjs, security)",
			placeHolder: "nestjs",
		});

		if (!specialty) return;

		// Open chat with command pre-filled
		vscode.commands.executeCommand("workbench.action.chat.open", {
			query: `ay:deploy ${specialty}`,
		});
	}

	private async loadNode() {
		const registry = this.registryReader.read();
		if (!registry) return;

		const nodeIds = Object.keys(registry.nodes);
		const selected = await vscode.window.showQuickPick(nodeIds, {
			placeHolder: "Select node to load",
		});

		if (!selected) return;

		vscode.commands.executeCommand("workbench.action.chat.open", {
			query: `ay:load ${selected}`,
		});
	}

	private async refreshRegistry() {
		const answer = await vscode.window.showInformationMessage(
			"Sync with parent to update network registry?",
			"Yes",
			"No",
		);

		if (answer !== "Yes") return;

		try {
			// Read aynorica-config.json to get parent branch
			const configPath = path.join(
				vscode.workspace.rootPath!,
				".github",
				"aynorica-config.json",
			);
			const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
			const parentBranch = config.parentBranch || "main";
			const remoteName = config.remote?.name || "aynorica-brain";

			execSync(`git fetch ${remoteName} ${parentBranch}`, {
				cwd: vscode.workspace.rootPath,
			});
			execSync(`git rebase ${remoteName}/${parentBranch}`, {
				cwd: vscode.workspace.rootPath,
			});

			vscode.window.showInformationMessage("✅ Registry updated");
			// Trigger status bar refresh
			vscode.commands.executeCommand("aynorica.refreshStatus");
		} catch (error) {
			vscode.window.showErrorMessage(`Refresh failed: ${error}`);
		}
	}

	private async quickActions() {
		const actions = [
			"Show Network",
			"Sync Brain State",
			"Deploy New Node",
			"Load Node Context",
			"Refresh Registry",
		];

		const selected = await vscode.window.showQuickPick(actions, {
			placeHolder: "Aynorica Quick Actions",
		});

		const commandMap: Record<string, string> = {
			"Show Network": "aynorica.showNetwork",
			"Sync Brain State": "aynorica.syncBrainState",
			"Deploy New Node": "aynorica.deployNode",
			"Load Node Context": "aynorica.loadNode",
			"Refresh Registry": "aynorica.refreshRegistry",
		};

		if (selected) {
			vscode.commands.executeCommand(commandMap[selected]);
		}
	}
}
```

### Entry Point: `extension.ts`

```ts
import * as vscode from "vscode";
import { RegistryReader } from "./registry";
import { StatusBarManager } from "./statusBar";
import { CommandManager } from "./commands";

export function activate(context: vscode.ExtensionContext) {
	console.log("Aynorica extension activated");

	const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	if (!workspaceRoot) {
		return;
	}

	// Check if this is an Aynorica node
	const manifestPath = path.join(
		workspaceRoot,
		".github",
		"node-manifest.md",
	);
	const registryPath = path.join(
		workspaceRoot,
		".github",
		"aynorica-registry.json",
	);

	if (!fs.existsSync(manifestPath)) {
		console.log("Not an Aynorica workspace");
		return;
	}

	const registryReader = new RegistryReader(workspaceRoot);
	const registry = registryReader.read();

	if (!registry) {
		vscode.window.showWarningMessage(
			"Aynorica node detected but registry missing. Run: ay:sync",
		);
		return;
	}

	const statusBar = new StatusBarManager(registryReader);
	const commands = new CommandManager(context, registryReader);

	// Initial update
	statusBar.update();

	// Watch for registry changes
	registryReader.watch(() => {
		statusBar.update();
	});

	// Register commands
	commands.register();

	// Auto-sync on save (if enabled)
	const config = vscode.workspace.getConfiguration("aynorica");
	if (config.get("autoSyncOnSave")) {
		let syncTimeout: NodeJS.Timeout | undefined;
		vscode.workspace.onDidSaveTextDocument((doc) => {
			if (doc.uri.path.includes(".github/")) {
				clearTimeout(syncTimeout);
				syncTimeout = setTimeout(() => {
					vscode.window
						.showInformationMessage(
							"Sync brain state to GitHub?",
							"Yes",
							"Not Now",
						)
						.then((answer) => {
							if (answer === "Yes") {
								vscode.commands.executeCommand(
									"aynorica.syncBrainState",
								);
							}
						});
				}, config.get("syncDebounceMs", 5000));
			}
		});
	}

	context.subscriptions.push(statusBar);
}

export function deactivate() {}
```

---

## Deployment Topology

### How Extension Works Across Connection Types

**Scenario 1: Local Windows Project**

```
C:\projects\my-nestjs-app\
├── src/
├── .github/          ← Symlink to aynorica-prime worktree
│   ├── aynorica-registry.json (replicated)
│   ├── aynorica-config.json
│   ├── node-manifest.md
│   └── instructions/
└── package.json

VSCode Local → Extension reads C:\projects\my-nestjs-app\.github\
```

**Scenario 2: Remote WSL Project**

```
/home/user/projects/my-nestjs-app/
├── src/
├── .github/          ← Git worktree from aynorica-prime
│   ├── aynorica-registry.json (replicated)
│   └── node-manifest.md
└── package.json

VSCode Remote-WSL → Extension runs in WSL, reads /home/user/projects/...
```

**Scenario 3: Remote SSH Project**

```
user@remote:/opt/projects/my-app/
├── src/
├── .github/          ← Sparse checkout from aynorica-prime
│   ├── aynorica-registry.json (replicated)
│   └── node-manifest.md
└── package.json

VSCode Remote-SSH → Extension runs on remote, reads /opt/projects/...
```

**Key Insight:** Extension always runs in the same context as the project workspace, so it always has filesystem access to `.github/`.

### Registry Replication Flow

```
┌─────────────────────────────────────────┐
│  GitHub: aynorica-prime                 │
│                                         │
│  main (Prime)                           │
│  └── .github/aynorica-registry.json     │ (source of truth)
│                                         │
│  aynorica-nestjs                        │
│  └── .github/aynorica-registry.json     │ (replica)
│                                         │
│  aynorica-hacker                        │
│  └── .github/aynorica-registry.json     │ (replica)
└─────────────────────────────────────────┘
          │                    │
          │ git rebase         │ git rebase
          ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│  Local Project   │  │  WSL Project     │
│  .github/        │  │  .github/        │
│  (linked)        │  │  (linked)        │
│                  │  │                  │
│  Extension       │  │  Extension       │
│  reads local     │  │  reads local     │
└──────────────────┘  └──────────────────┘
```

**Update Mechanism:**

1. Prime updates registry → commits to `main`
2. Child runs `ay:sync` → rebases onto parent
3. Registry propagates via git rebase (automatic)
4. Extension detects file change → refreshes status bar

**Staleness Handling:**

-   Extension shows last sync time in status bar
-   If >24 hours, shows warning on activation
-   Manual refresh: `Aynorica: Refresh Network Registry`
-   Auto-refresh on workspace open (optional setting)

### `.github/aynorica-config.json` Schema

**Added to each node during `ay:deploy`:**

```json
{
	"nodeId": "aynorica-nestjs",
	"parentBranch": "main",
	"remote": {
		"name": "aynorica-brain",
		"url": "https://github.com/aynorica/aynorica-prime.git"
	},
	"adapted": "2025-12-07T10:00:00Z",
	"projectType": "nestjs"
}
```

**Extension uses this to:**

-   Identify which node it's running in
-   Know where to fetch registry updates from
-   Display parent relationship in status bar

---

## Consequences

### Positive

-   ✅ **Constant awareness**: Status bar shows current node always visible
-   ✅ **Faster operations**: Keybindings reduce typing by 80%
-   ✅ **Git automation**: Sync becomes one-click
-   ✅ **Discoverable**: Command palette makes features visible
-   ✅ **Maintainable**: ~500 lines of TypeScript

### Negative (Trade-offs Accepted)

-   ❌ **Build step required**: Must compile TypeScript
-   ❌ **No tree view yet**: Phase 1 doesn't include sidebar tree (deferred to Phase 2)
-   ❌ **No network visualizer**: WebView deferred until network scales (>5 nodes)
-   ❌ **Manual publishing**: Extension not on marketplace initially (local install)

### Risks & Mitigations

| Risk                              | Likelihood | Impact | Mitigation                                        |
| --------------------------------- | ---------- | ------ | ------------------------------------------------- |
| Extension breaks on VSCode update | Low        | Medium | Pin to stable API, test on updates                |
| Registry format changes           | Medium     | High   | Version schema, migration logic                   |
| Git operations fail (no repo)     | Medium     | Low    | Graceful error handling, fallback to chat         |
| Context overflow (many nodes)     | Low        | Medium | Lazy loading already designed in network protocol |

---

## Fitness Functions

How will we know this is working?

| Metric                 | Target                         | Measurement                 |
| ---------------------- | ------------------------------ | --------------------------- |
| **Command usage**      | >70% via extension vs chat     | Log command invocations     |
| **Time to sync**       | <5 seconds (from save to push) | Measure sync duration       |
| **User satisfaction**  | "I don't think about it"       | Qualitative (your feedback) |
| **Maintenance burden** | <1 hour/month                  | Track time spent on fixes   |

---

## Reversibility

**Level:** High

**Rationale:**

-   Extension is optional (chat commands still work)
-   Can disable extension anytime
-   No lock-in to extension architecture
-   Phase 1 can be abandoned; Phase 2+ iterative

**Fallback Plan:**

1. Disable extension
2. Continue using chat commands
3. Optionally: Use tasks.json approach (Option 1)

---

## Implementation Timeline

| Phase   | Deliverable                 | Time    | Cumulative |
| ------- | --------------------------- | ------- | ---------- |
| Phase 1 | Status bar + 5 commands     | 4 hours | 4 hours    |
| Phase 2 | Tree view + keybindings     | 3 hours | 7 hours    |
| Phase 3 | Git integration + auto-sync | 2 hours | 9 hours    |
| Phase 4 | Polish + documentation      | 2 hours | 11 hours   |

**Total:** ~11 hours (~1.5 days at sustainable pace)

---

## Next Steps

1. **Create extension scaffold** (Phase 1, Day 1)

    - `mkdir aynorica-vscode`
    - `npm init -y && npm install -D @types/vscode typescript`
    - Create `package.json`, `tsconfig.json`, `src/extension.ts`

2. **Implement status bar** (Phase 1, Day 1)

    - Read `aynorica-registry.json`
    - Show current node in status bar
    - Click → Quick actions menu

3. **Register commands** (Phase 1, Day 1)

    - `aynorica.showNetwork`
    - `aynorica.syncBrainState`
    - `aynorica.deployNode`

4. **Test locally** (Phase 1, Day 1)

    - `F5` to launch extension host
    - Verify status bar updates
    - Test commands work

5. **Iterate** (Phases 2-4 as needed)

---

## Related ADRs

-   ADR-001: Aynorica Network Protocol (defines `ay:*` commands this extension wraps)

---

## References

-   [VSCode Extension API](https://code.visualstudio.com/api)
-   [Status Bar Items](https://code.visualstudio.com/api/references/vscode-api#StatusBarItem)
-   [Commands](https://code.visualstudio.com/api/references/vscode-api#commands)
-   [Tree View](https://code.visualstudio.com/api/extension-guides/tree-view)
-   Network Protocol: `.github/architecture/aynorica-network-protocol.md`

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { RegistryReader } from "./registry";
import { StatusBarManager } from "./statusBar";
import { CommandManager } from "./commands";

let statusBarManager: StatusBarManager | undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log("Aynorica extension activation started");

	const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	if (!workspaceRoot) {
		console.log("No workspace folder found");
		return;
	}

	// Check if this is an Aynorica node
	const manifestPath = path.join(
		workspaceRoot,
		".github",
		"node-manifest.md",
	);
	const configPath = path.join(
		workspaceRoot,
		".github",
		"aynorica-config.json",
	);
	const registryPath = path.join(
		workspaceRoot,
		".github",
		"aynorica-registry.json",
	);

	// Must have at least node-manifest.md or aynorica-config.json
	const isAynoricaNode =
		fs.existsSync(manifestPath) || fs.existsSync(configPath);

	if (!isAynoricaNode) {
		console.log("Not an Aynorica workspace - activation skipped");
		return;
	}

	console.log("Aynorica workspace detected");

	const registryReader = new RegistryReader(workspaceRoot);
	const registry = registryReader.read();

	if (!registry) {
		vscode.window
			.showWarningMessage(
				"Aynorica node detected but registry missing. Run: ay:sync",
				"Open Chat",
			)
			.then((selection) => {
				if (selection === "Open Chat") {
					vscode.commands.executeCommand(
						"workbench.action.chat.open",
						{
							query: "ay:sync",
						},
					);
				}
			});
		return;
	}

	// Set context for keybindings
	vscode.commands.executeCommand("setContext", "aynorica.enabled", true);

	// Initialize status bar
	statusBarManager = new StatusBarManager(registryReader);
	statusBarManager.update();

	// Initialize commands
	const commandManager = new CommandManager(
		context,
		registryReader,
		workspaceRoot,
	);
	commandManager.register();

	// Watch for registry changes
	const registryWatcher = registryReader.watch(() => {
		console.log("Registry changed, updating status bar");
		statusBarManager?.update();
	});
	context.subscriptions.push(registryWatcher);

	// Auto-sync on save (if enabled)
	const config = vscode.workspace.getConfiguration("aynorica");
	if (config.get("autoSyncOnSave")) {
		let syncTimeout: NodeJS.Timeout | undefined;

		const saveListener = vscode.workspace.onDidSaveTextDocument((doc) => {
			// Check if saved file is in .github/ directory
			if (doc.uri.fsPath.includes(".github" + path.sep)) {
				clearTimeout(syncTimeout);

				const debounceMs = config.get("syncDebounceMs", 5000);
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
				}, debounceMs);
			}
		});

		context.subscriptions.push(saveListener);
	}

	// Add refresh status command (internal)
	context.subscriptions.push(
		vscode.commands.registerCommand("aynorica.refreshStatus", () => {
			statusBarManager?.update();
		}),
	);

	// Show staleness warning if registry is old
	const currentNode = registryReader.getCurrentNode();
	if (currentNode && registry.nodes[currentNode]) {
		const lastSync = new Date(registry.nodes[currentNode].lastSync);
		const now = new Date();
		const hoursSinceSync =
			(now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

		if (hoursSinceSync > 24) {
			vscode.window
				.showWarningMessage(
					`Network registry is ${Math.floor(
						hoursSinceSync,
					)} hours old. Consider refreshing.`,
					"Refresh Now",
					"Dismiss",
				)
				.then((selection) => {
					if (selection === "Refresh Now") {
						vscode.commands.executeCommand(
							"aynorica.refreshRegistry",
						);
					}
				});
		}
	}

	context.subscriptions.push(statusBarManager);

	console.log("Aynorica extension activated successfully");
}

export function deactivate() {
	console.log("Aynorica extension deactivated");
}

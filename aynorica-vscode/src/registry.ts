import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

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
	private workspaceRoot: string;

	constructor(workspaceRoot: string) {
		this.workspaceRoot = workspaceRoot;
		this.registryPath = path.join(
			workspaceRoot,
			".github",
			"aynorica-registry.json",
		);
	}

	read(): Registry | null {
		try {
			if (!fs.existsSync(this.registryPath)) {
				return null;
			}
			const content = fs.readFileSync(this.registryPath, "utf8");
			return JSON.parse(content);
		} catch (error) {
			console.error("Failed to read registry:", error);
			return null;
		}
	}

	getCurrentNode(): string | null {
		try {
			const branch = execSync("git branch --show-current", {
				cwd: this.workspaceRoot,
				encoding: "utf8",
			}).trim();

			const registry = this.read();
			if (!registry) {
				return null;
			}

			// Map branch to node
			for (const [nodeId, node] of Object.entries(registry.nodes)) {
				if (node.branch === branch) {
					return nodeId;
				}
			}

			return null;
		} catch (error) {
			console.error("Failed to get current node:", error);
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

	getRegistryPath(): string {
		return this.registryPath;
	}
}

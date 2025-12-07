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
			this.statusBarItem.tooltip = "Click to initialize or check setup";
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
		try {
			const now = new Date();
			const then = new Date(isoDate);
			const diffMs = now.getTime() - then.getTime();
			const diffMins = Math.floor(diffMs / 60000);

			if (diffMins < 1) {
				return "just now";
			}
			if (diffMins < 60) {
				return `${diffMins}m ago`;
			}
			const diffHours = Math.floor(diffMins / 60);
			if (diffHours < 24) {
				return `${diffHours}h ago`;
			}
			const diffDays = Math.floor(diffHours / 24);
			return `${diffDays}d ago`;
		} catch (error) {
			return "unknown";
		}
	}

	dispose() {
		this.statusBarItem.dispose();
	}
}

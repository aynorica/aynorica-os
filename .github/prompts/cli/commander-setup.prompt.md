---
mode: agent
description: Create Node.js CLI tool with Commander.js, Inquirer.js, and Ora
---

# Node.js CLI Development Prompt

Generate professional command-line tools with proper architecture and UX.

## Project Structure (Multi-Command CLI)

```
my-cli/
├── bin/
│   └── my-cli.ts          # Entry point with shebang
├── src/
│   ├── index.ts           # Orchestrator
│   ├── commands/
│   │   ├── init.ts
│   │   ├── sync.ts
│   │   └── remove.ts
│   ├── utils/
│   │   ├── platform.ts
│   │   └── git.ts
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

## Entry Point Template (bin/my-cli.ts)

```typescript
#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Handle compiled output path (dist/bin/ → package root)
const pkg = JSON.parse(
  readFileSync(join(__dirname, "..", "..", "package.json"), "utf-8")
);

const program = new Command();

program
  .name("my-cli")
  .description("My awesome CLI tool")
  .version(pkg.version);

program
  .argument("[name]", "Project name", "my-project")
  .option("-v, --verbose", "Verbose output")
  .option("--no-install", "Skip dependency installation")
  .action(async (name, options) => {
    try {
      // Import and execute main logic
      const { createProject } = await import("../src/index.js");
      await createProject(name, options);
      console.log(chalk.green("\n✓ Done!\n"));
    } catch (error) {
      console.error(chalk.red("\n✗ Failed:"), error.message);
      process.exit(1);
    }
  });

program.parse();
```

## Core Libraries

### Commander.js Patterns

```typescript
// Flag with value
.option("-t, --template <type>", "Template to use", "default")

// Negatable option (--no-git means git=false)
.option("--no-git", "Skip git initialization")

// Subcommands
const sync = program.command("sync").description("Sync operations");
sync.command("up").action(() => console.log("Syncing up..."));
sync.command("down").action(() => console.log("Syncing down..."));
```

### Inquirer.js Patterns

```typescript
import inquirer from "inquirer";

const answers = await inquirer.prompt([
  {
    type: "input",
    name: "projectName",
    message: "Project name:",
    default: "my-project",
    validate: input => input.length > 0 || "Name required",
  },
  {
    type: "list",
    name: "template",
    message: "Select template:",
    choices: [
      { name: "Basic (minimal)", value: "basic" },
      { name: "Full (all features)", value: "full" },
    ],
  },
  {
    type: "confirm",
    name: "gitInit",
    message: "Initialize git repository?",
    default: true,
  },
  {
    type: "checkbox",
    name: "features",
    message: "Select features:",
    choices: ["TypeScript", "ESLint", "Prettier", "Testing"],
  },
]);
```

### Ora Spinner Wrapper

```typescript
import ora from "ora";

async function withProgress<T>(
  message: string,
  fn: () => Promise<T>
): Promise<T> {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail();
    throw error;
  }
}

// Usage
await withProgress("Installing dependencies...", () => npmInstall());
```

## Package.json Configuration

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "my-cli": "./dist/bin/my-cli.js"
  },
  "main": "./dist/src/index.js",
  "types": "./dist/src/index.d.ts",
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node --experimental-strip-types bin/my-cli.ts",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "inquirer": "^9.0.0",
    "ora": "^8.0.0",
    "chalk": "^5.0.0"
  }
}
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Misuse of command |
| 130 | Ctrl+C (SIGINT) |

## Graceful Exit Handling

```typescript
process.on("SIGINT", () => {
  console.log(chalk.yellow("\n\nOperation cancelled."));
  process.exit(130);
});

process.on("uncaughtException", (error) => {
  console.error(chalk.red("Fatal error:"), error.message);
  process.exit(1);
});
```

## Emoji Conventions

| Emoji | Usage |
|-------|-------|
| ✓ | Success |
| ✗ | Error |
| ⚠ | Warning |
| ℹ | Info |
| → | Next step |

## Testing

```bash
# Link globally for local testing
npm link

# Test CLI
my-cli --help
my-cli init my-project

# Unlink when done
npm unlink -g my-cli
```

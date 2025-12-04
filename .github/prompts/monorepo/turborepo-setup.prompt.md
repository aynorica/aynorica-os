---
mode: agent
description: Configure Turborepo monorepo with pnpm workspaces
---

# Turborepo Configuration Prompt

Set up and manage monorepo build pipelines with Turborepo.

## Root Configuration

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    ".env",
    "tsconfig.base.json"
  ],
  "globalEnv": [
    "NODE_ENV",
    "CI"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "inputs": ["$TURBO_DEFAULT$", "tsconfig.json"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "persistent": true,
      "cache": false
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

## Understanding dependsOn

```
# With "^build" (topological):
@scope/gateway depends on @scope/shared

turbo run build:
  1. Build @scope/shared FIRST
  2. Then build @scope/gateway

# Without "^" (parallel):
Both packages build simultaneously (may fail if dependencies exist)
```

## Package Template

### packages/*/package.json

```json
{
  "name": "@scope/package-name",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  }
}
```

### packages/*/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

## Common Commands

```bash
# Build all packages
turbo run build

# Build specific package
turbo run build --filter=@scope/gateway

# Build package + its dependencies
turbo run build --filter=@scope/gateway...

# Build package + its dependents
turbo run build --filter=...@scope/shared

# Build only changed packages
turbo run build --filter=[HEAD^1]

# Dry run (show what would run)
turbo run build --dry-run

# Show dependency graph
turbo run build --graph

# Force rebuild (skip cache)
turbo run build --force
```

## Adding Internal Dependencies

```json
// packages/gateway/package.json
{
  "dependencies": {
    "@scope/shared": "workspace:*"
  }
}
```

```bash
# Install from root
pnpm install
```

## Adding External Dependencies

```bash
# Add to specific package
pnpm add express --filter @scope/gateway

# Add to root (dev deps)
pnpm add -D typescript -w
```

## Adding a New Package

```bash
# 1. Create structure
mkdir -p packages/new-package/src

# 2. Create package.json
cd packages/new-package
pnpm init

# 3. Create tsconfig.json (extend base)

# 4. Create entry point
echo 'export const hello = () => "world";' > src/index.ts

# 5. Install and build
cd ../..
pnpm install
turbo run build --filter=@scope/new-package
```

## Package-Level Override

```json
// packages/web/turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "outputs": [".next/**", "!.next/cache/**"]
    }
  }
}
```

## Cache Debugging

```bash
# Why did cache miss?
turbo run build --summarize

# Show cache status
turbo run build --dry-run=json

# Force no cache
turbo run build --force
```

## CI/CD Integration

```yaml
# GitHub Actions
- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Build
  run: pnpm turbo run build

- name: Test
  run: pnpm turbo run test
```

## Pruned Docker Builds

```bash
# Create pruned workspace for specific app
turbo prune @scope/gateway --docker

# Output structure:
# out/json/      - package.json files only
# out/full/      - Full source code
# out/pnpm-lock.yaml
```

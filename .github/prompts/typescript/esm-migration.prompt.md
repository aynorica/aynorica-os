---
mode: agent
description: Guide for migrating JavaScript projects to TypeScript with ESM
---

# TypeScript Migration Guide

Step-by-step protocol for converting JavaScript projects to TypeScript with Node.js ESM modules.

## When to Migrate

**✅ Good Candidates:**
- Growing codebases (>5 files)
- CLI tools with multiple commands
- Libraries published to npm
- Projects with runtime type errors
- Team projects (better DX)

**❌ Poor Candidates:**
- Simple scripts (<100 lines)
- Prototypes/experiments
- Heavy metaprogramming/eval usage

## Phase 1: Setup (30 min)

```bash
# Install TypeScript
npm install -D typescript @types/node

# Create tsconfig.json
npx tsc --init

# Create types directory
mkdir -p src/types
```

## Phase 2: Configure tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": ".",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*", "bin/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Key Settings Explained

| Option | Value | Why |
|--------|-------|-----|
| `module` | `NodeNext` | Best for ESM + Node.js |
| `moduleResolution` | `NodeNext` | Matches module setting |
| `target` | `ES2022` | Modern JS, top-level await |
| `strict` | `true` | Full type safety |
| `declaration` | `true` | Generate .d.ts files |

## Phase 3: Update package.json

```json
{
  "type": "module",
  "main": "./dist/src/index.js",
  "types": "./dist/src/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/src/index.d.ts",
      "import": "./dist/src/index.js"
    }
  },
  "bin": {
    "my-cli": "./dist/bin/cli.js"
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run clean && npm run build"
  }
}
```

## Phase 4: Create Type Definitions

Create `src/types/index.ts`:

```typescript
export interface Config {
  verbose?: boolean;
  timeout?: number;
}

export interface Result<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

// Re-export library types if needed
export type { SimpleGit, StatusResult } from "simple-git";
```

## Phase 5: Convert Files

1. Rename `.js` → `.ts`
2. Add type annotations
3. Fix imports (add `.js` extension)

**Before:**
```javascript
import { doThing } from "./utils";

export function process(data) {
  return data.map(item => item.name);
}
```

**After:**
```typescript
import { doThing } from "./utils.js";  // Note: .js extension!

interface DataItem {
  name: string;
  value: number;
}

export function process(data: DataItem[]): string[] {
  return data.map(item => item.name);
}
```

## Common Pitfalls & Fixes

### ❌ "Cannot find module" for local imports

**Cause:** ESM requires file extensions
**Fix:** Add `.js` extension (yes, `.js` even for `.ts` files)

```typescript
// ❌ Wrong
import { helper } from "./helper";

// ✅ Correct
import { helper } from "./helper.js";
```

### ❌ Library default import "is not callable"

**Cause:** ESM/CJS interop issues
**Fix:** Use named imports when available

```typescript
// ❌ May fail
import simpleGit from "simple-git";
const git = simpleGit();

// ✅ Use named export
import { simpleGit } from "simple-git";
const git = simpleGit();
```

### ❌ package.json not found at runtime

**Cause:** Path resolution changes after compilation
**Fix:** Account for `dist/` directory structure

```typescript
// File: bin/cli.ts → dist/bin/cli.js

// ❌ Wrong (assumes bin/ is at root)
join(__dirname, "..", "package.json")

// ✅ Correct (account for dist/bin/)
join(__dirname, "..", "..", "package.json")
```

### ❌ "Type 'X' is not assignable to type 'Y'"

**Cause:** Strict null checks
**Fix:** Handle undefined explicitly

```typescript
// ❌ Error: might be undefined
const value = options.name.toUpperCase();

// ✅ Option 1: Default value
const value = (options.name ?? "default").toUpperCase();

// ✅ Option 2: Guard clause
if (!options.name) throw new Error("Name required");
const value = options.name.toUpperCase();

// ✅ Option 3: Optional chaining
const value = options.name?.toUpperCase();
```

### ❌ Missing types for npm package

**Fix:** Install @types or create declaration

```bash
npm install -D @types/package-name

# If none exists, create src/types/package-name.d.ts
```

```typescript
declare module "package-name" {
  export function doThing(): void;
}
```

## Migration Checklist

```
□ Install typescript and @types/node
□ Create tsconfig.json with NodeNext settings
□ Create src/types/index.ts with interfaces
□ Update package.json (type, main, types, exports, bin, scripts)
□ Rename all .js files to .ts
□ Add .js extensions to local imports
□ Add type annotations to function parameters
□ Handle null/undefined with ?? or guards
□ Fix library imports (prefer named exports)
□ Run typecheck until 0 errors
□ Build and test dist/ output
□ Remove old .js source files
```

## Quick Commands

| Task | Command |
|------|---------|
| Type check only | `npm run typecheck` |
| Build to dist/ | `npm run build` |
| Watch mode | `npm run dev` |
| Run TS directly | `node --experimental-strip-types file.ts` |
| Clean build | `rm -rf dist && npm run build` |

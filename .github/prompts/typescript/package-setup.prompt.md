---
mode: agent
description: Set up a new TypeScript package with proper configuration
---

# TypeScript Package Setup

Configure a new TypeScript package with modern ESM support and best practices.

## Directory Structure

```
packages/{name}/
├── src/
│   ├── index.ts          # Main entry point
│   ├── types/
│   │   └── index.ts      # Type definitions
│   └── __tests__/
│       └── index.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

## package.json Template

```json
{
  "name": "@scope/{name}",
  "version": "0.1.0",
  "description": "Description here",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./types": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/types/index.js"
    }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run clean && npm run build && npm test"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

## tsconfig.json Template

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## Base tsconfig.json (Monorepo Root)

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
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
```

## src/index.ts Template

```typescript
// Re-export types
export * from './types/index.js';

// Export main functionality
export { MainClass } from './main.js';
export { helperFunction } from './utils.js';
```

## src/types/index.ts Template

```typescript
/**
 * Configuration options for the package
 */
export interface Config {
  /** Enable verbose logging */
  verbose?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Custom options */
  options?: Record<string, unknown>;
}

/**
 * Result of an operation
 */
export interface Result<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
}

/**
 * Callback function signature
 */
export type Callback<T> = (error: Error | null, result?: T) => void;
```

## Jest Configuration (jest.config.js)

```javascript
/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/__tests__/**'],
};
```

## Test File Template

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { MainClass } from '../index.js';

describe('MainClass', () => {
  let instance: MainClass;

  beforeEach(() => {
    instance = new MainClass();
  });

  it('should create instance', () => {
    expect(instance).toBeDefined();
  });

  it('should perform operation', async () => {
    const result = await instance.doSomething();
    expect(result.success).toBe(true);
  });
});
```

## Monorepo Integration (pnpm-workspace.yaml)

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

## Package Dependencies in Monorepo

Reference workspace packages:

```json
{
  "dependencies": {
    "@scope/shared": "workspace:*"
  }
}
```

## Key Principles

1. **ESM First** — Always use `"type": "module"`
2. **Strict Mode** — Enable all strict type checking
3. **NodeNext Resolution** — Best ESM/CJS interop
4. **Isolated Modules** — Required for bundlers
5. **Declaration Maps** — Enable go-to-definition

## Anti-Patterns to Avoid

- ❌ Using CommonJS (`require`) in ESM packages
- ❌ Missing `.js` extensions in imports
- ❌ Exporting from index without re-exporting types
- ❌ Using `any` instead of proper types
- ❌ Forgetting to add test files to exclude

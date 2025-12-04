# npm Package Publishing Protocol

**Context:** Best practices for publishing packages to npm registry, from pre-publish validation to post-publish verification.

---

## Pre-Publish Checklist

### 1. Authentication Verification

```bash
# Verify npm login
npm whoami
# Expected: Your npm username

# Login if needed
npm login
```

### 2. Package Validation

```bash
# Verify package.json fields
# Required fields:
# - name (no uppercase, no spaces)
# - version (semver format)
# - description
# - main/exports (entry points)
# - files (whitelist for publish)
# - license
# - repository (for npm page links)
# - keywords (discoverability)

# Check for issues
npm pkg fix

# Validate package structure
npm pack --dry-run
```

### 3. Git State

```bash
# Ensure clean working directory
git status

# Tag the version
git tag v1.0.0
git push origin main --tags
```

### 4. Test Package Locally

```bash
# Create tarball
npm pack
# → Inspect create-aynorica-1.0.0.tgz contents

# Test installation locally
npm link
cd /tmp/test-project
npx your-package-name

# Or test from tarball
npm install -g ./create-aynorica-1.0.0.tgz
```

---

## Dry-Run Validation

```bash
# See exactly what will be published
npm publish --dry-run

# Review output:
# - Package size (should be small)
# - Files included (check .npmignore)
# - Dependency count
```

**Common Issues:**

-   `.env` files included → Add to `.npmignore`
-   `node_modules/` in tarball → Check `.npmignore`
-   Large size → Exclude tests, docs, unnecessary files
-   Missing files → Add to `files` array in package.json

---

## Publishing

### First-Time Publish

```bash
# Public package (default)
npm publish --access public

# Private package (requires paid account)
npm publish
```

### Subsequent Publishes

```bash
# Bump version first
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# Then publish
npm publish
```

---

## Post-Publish Verification

### 1. Wait for Registry Sync (1-2 minutes)

```bash
# Check package page
# https://www.npmjs.com/package/<your-package-name>
```

### 2. Test Published Version

```bash
# Unlink local version
npm unlink your-package-name

# Install from registry
cd /tmp
npx your-package-name@latest

# Verify functionality
```

### 3. Update Documentation

-   Add npm badge to README: `[![npm version](https://img.shields.io/npm/v/your-package-name.svg)](https://www.npmjs.com/package/your-package-name)`
-   Update main repository README with usage instructions
-   Create GitHub release (matches npm version)

---

## Package.json Best Practices

### Required Fields

```json
{
	"name": "your-package-name",
	"version": "1.0.0",
	"description": "Clear one-line description",
	"type": "module",
	"main": "./dist/index.js",
	"types": "./dist/index.d.ts",
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"import": "./dist/index.js"
		}
	},
	"files": ["dist", "README.md", "LICENSE"],
	"bin": {
		"your-cli": "./bin/cli.js"
	},
	"scripts": {
		"prepublishOnly": "npm run build && npm test",
		"build": "tsc",
		"test": "jest"
	},
	"keywords": [
		"relevant",
		"searchable",
		"keywords",
		"for",
		"discoverability"
	],
	"author": "Your Name <email@example.com>",
	"license": "MIT",
	"repository": {
		"type": "git",
		"url": "https://github.com/username/repo.git"
	},
	"bugs": {
		"url": "https://github.com/username/repo/issues"
	},
	"homepage": "https://github.com/username/repo#readme",
	"engines": {
		"node": ">=18.0.0"
	}
}
```

### CLI Package Specifics

```json
{
	"bin": {
		"create-something": "./bin/cli.js"
	},
	"files": ["bin", "src", "README.md", "LICENSE"]
}
```

**Important:** CLI entry point must have shebang: `#!/usr/bin/env node`

### Library Package Specifics

```json
{
	"main": "./dist/index.js",
	"types": "./dist/index.d.ts",
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"import": "./dist/index.js"
		},
		"./submodule": {
			"types": "./dist/submodule.d.ts",
			"import": "./dist/submodule.js"
		}
	},
	"files": ["dist"]
}
```

---

## .npmignore

**Alternative to `files` whitelist (blacklist approach):**

```
# Development
src/
tests/
*.test.js
*.spec.js
coverage/
.nyc_output/

# Documentation (if not needed)
docs/
*.md
!README.md

# Build artifacts
tsconfig.json
.eslintrc
.prettierrc

# Environment
.env
.env.*

# Git
.git/
.gitignore
.github/

# Misc
node_modules/
*.log
.DS_Store
```

**Recommendation:** Use `files` array in package.json (whitelist) instead of `.npmignore` for better control.

---

## Versioning Strategy (Semver)

| Version Change | When to Use                        | Example       |
| -------------- | ---------------------------------- | ------------- |
| **Patch**      | Bug fixes, documentation           | 1.0.0 → 1.0.1 |
| **Minor**      | New features (backward compatible) | 1.0.0 → 1.1.0 |
| **Major**      | Breaking changes                   | 1.0.0 → 2.0.0 |
| **Prerelease** | Alpha/beta testing                 | 1.0.0-alpha.1 |

### Automated Versioning

```bash
# Conventional commits + standard-version
npm install --save-dev standard-version

# package.json
{
  "scripts": {
    "release": "standard-version"
  }
}

# Usage
npm run release      # Auto-increments based on commits
npm run release -- --release-as minor
npm run release -- --prerelease alpha
```

---

## Unpublishing / Deprecating

### Deprecate a Version

```bash
# Warn users (version still usable)
npm deprecate your-package@1.0.0 "This version has a critical bug. Use 1.0.1+"
```

### Unpublish (Dangerous)

```bash
# Remove from registry (use sparingly)
# Only allowed within 72 hours of publish
npm unpublish your-package@1.0.0

# Unpublish entire package (destructive)
npm unpublish your-package --force
```

**Warning:** Unpublishing breaks existing installations. Prefer deprecation.

---

## Common Publishing Errors

| Error                               | Cause                                | Solution                                        |
| ----------------------------------- | ------------------------------------ | ----------------------------------------------- |
| `ENEEDAUTH`                         | Not logged in                        | `npm login`                                     |
| `E403 Forbidden`                    | No publish rights                    | Check package ownership                         |
| `E404 Package not found`            | First publish                        | Use `--access public` for scoped packages       |
| `EPUBLISHCONFLICT`                  | Version already exists               | Bump version in package.json                    |
| `invalid bin field`                 | Missing bin file                     | Ensure file exists and has correct shebang      |
| `Package size exceeds maximum`      | Package too large                    | Exclude large files via `files` or `.npmignore` |
| `Error: Cannot find module`         | Missing dependency                   | Add to `dependencies` in package.json           |
| `ETARGET No matching version found` | Invalid semver in `peerDependencies` | Fix version range                               |

---

## Scoped Packages (@org/package)

### Publish to Public Registry

```bash
# First publish (requires --access public)
npm publish --access public

# Subsequent publishes
npm publish
```

### Publish to Private Registry

```bash
# Default for scoped packages with paid account
npm publish
```

---

## Best Practices Summary

1. **Always dry-run first** — `npm publish --dry-run`
2. **Tag releases** — Git tags match npm versions
3. **Semantic versioning** — Follow semver strictly
4. **Whitelist files** — Use `files` array, not `.npmignore`
5. **Prepublish hooks** — Run build + tests before publish
6. **Clear description** — First impression on npm page
7. **Keywords matter** — Discoverability depends on it
8. **License field** — Required for legal clarity
9. **Repository links** — Enable "View on GitHub" button
10. **Test published package** — Always verify post-publish

---

## Example: create-aynorica Publish Log

```bash
# 1. Dry-run
$ npm publish --dry-run
npm notice package: create-aynorica@1.0.0
npm notice === Tarball Contents ===
npm notice 1.1kB  LICENSE
npm notice 4.5kB  README.md
npm notice 950B   bin/cli.js
npm notice 2.1kB  package.json
npm notice 3.2kB  src/index.js
npm notice 1.8kB  src/github.js
npm notice 1.5kB  src/prompts.js
npm notice 1.2kB  src/replacer.js
npm notice 2.0kB  src/scaffold.js
npm notice 800B   src/logger.js
npm notice 400B   src/constants.js
npm notice === Tarball Details ===
npm notice name:          create-aynorica
npm notice version:       1.0.0
npm notice filename:      create-aynorica-1.0.0.tgz
npm notice package size:  8.0 kB
npm notice unpacked size: 26.1 kB
npm notice shasum:        abc123def456...
npm notice total files:   11

# 2. Actual publish
$ npm publish --access public
npm notice Publishing to https://registry.npmjs.org/
+ create-aynorica@1.0.0

# 3. Verify
$ npm view create-aynorica
create-aynorica@1.0.0 | MIT | deps: 5 | versions: 1

# 4. Test
$ npx create-aynorica
✔ Fetching latest .github/ from GitHub...
```

---

## Related Resources

-   **npm Documentation:** https://docs.npmjs.com/cli/publish
-   **Semantic Versioning:** https://semver.org/
-   **Package.json Spec:** https://docs.npmjs.com/cli/configuring-npm/package-json
-   **npm Package Best Practices:** https://github.com/goldbergyoni/nodebestpractices#npm

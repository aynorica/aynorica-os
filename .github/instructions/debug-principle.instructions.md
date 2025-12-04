---
applyTo: "**"
---

# Debug Principles

## Testing Framework Standard

**Always use Jest** for testing in this monorepo unless explicitly instructed otherwise.

- Jest is the standard testing framework across all packages
- Provides consistent API: `describe`, `it`, `expect`, `beforeEach`, `jest.fn()`, `jest.mock()`
- Works reliably with ESM via `NODE_OPTIONS='--experimental-vm-modules'`
- Compatible with NestJS `@nestjs/testing` utilities
- ❌ Do NOT use Vitest - it has ESM/NestJS compatibility issues in our setup

## Debug Steps

1- **Estimate the location**: Get an estimation of where the bug is happening, for example "example.ts file, line 23, function doSomething()"

2- **Isolate the bug**: Create a minimal reproducible example that triggers the bug, this will help you understand if the bug is in your code or in a dependency.

3- **Always console.log**: Use console.log to print out variable values and program state at different points in the code to trace where things go wrong. The logs must be very descriptive, for example instead of "value is: ", do "In function doSomething(), before calling calculate(), the value of x is: "

4- **Check assumptions**: Verify that your assumptions about how the code should work are correct. If an assumption is wrong, it can lead to bugs.

5- **Rubber duck debugging**: Explain the code and the bug to an imaginary rubber duck (or a colleague). This can help you see the problem from a different perspective and identify issues you might have missed.

6- **Check TypeScript compilation first**: Before debugging runtime issues, run `tsc --noEmit` to catch type errors that may prevent code from running correctly.

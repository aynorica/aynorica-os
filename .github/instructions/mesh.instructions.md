---
applyTo: "packages/**"
---

# Aynorica Mesh Architecture

## Package Structure

```
packages/
├── shared/            # @aynorica/shared - Types, utils, crypto
├── transport/         # @aynorica/transport - TCP, Redis, NATS, gRPC
├── gateway/           # @aynorica/gateway - NestJS gateway service
├── worker/            # @aynorica/worker - NestJS worker service
├── aynorica-cli/      # @aynorica/cli - CLI commands
├── telegram-bot/      # @aynorica/telegram-bot - Bot service
└── aynorica-template/ # Vault template

External Repositories (Published):
├── create-aynorica    # npm CLI scaffolder (npx create-aynorica)
                       # Repository: github.com/aynorica/create-aynorica
                       # Package: https://www.npmjs.com/package/create-aynorica
                       # Status: v1.0.0 published, fully functional
```

## Dependency Flow

```
shared → transport → gateway/worker → cli → bot
         (types)     (adapters)    (services)  (commands)
```

## Core Laws

1. **Shared first** — All types live in @aynorica/shared
2. **Topological builds** — `dependsOn: ["^build"]` in turbo.json
3. **ESM everywhere** — `"type": "module"`, NodeNext resolution
4. **Workspace protocol** — `"@aynorica/shared": "workspace:*"`

## Build Commands

```bash
# All packages
turbo run build

# Single package + dependencies
turbo run build --filter=@aynorica/gateway...

# Skip cache
turbo run build --force
```

## Adding Dependencies

```bash
# Internal
# In packages/gateway/package.json:
# "@aynorica/shared": "workspace:*"

# External
pnpm add express --filter @aynorica/gateway
```

## NestJS Service Pattern

-   Module per feature domain
-   Singleton scope (performance)
-   Fastify over Express
-   ValidationPipe globally

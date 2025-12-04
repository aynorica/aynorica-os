---
applyTo: "**"
---

# Infrastructure Services

⚠️ **Current Status:** Infrastructure services (PostgreSQL, Redis) exist in external environments, NOT managed by this repository.

This repository is a **configuration and documentation system** for the Aynorica agent. Infrastructure deployment will be added in future phases.

## Planned Services (Not Yet Deployed)

### PostgreSQL Database (Future)

-   Purpose: Gateway registry, worker state, session history
-   Deployment: Docker-based when implemented

### Redis Cache (Future)

-   Purpose: Caching, pub/sub messaging, rate-limiting
-   Deployment: Docker-based when implemented

## Current Reality

If you're using PostgreSQL or Redis, they are:

1. Running in a separate environment (not this repo)
2. Managed manually outside this codebase
3. Documented in your external Obsidian vault skills

---
mode: agent
description: Framework for analyzing trade-offs in architectural decisions
---

# Trade-off Analysis Framework

Systematic approach to evaluating architectural options with explicit costs and benefits.

## The Trade-off Matrix

| Dimension | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| **Scalability** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Simplicity** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| **Time-to-Market** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Operational Cost** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Team Familiarity** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐ |

## Common Trade-off Pairs

### 1. Scalability vs Simplicity

| Choice | Trade-off |
|--------|-----------|
| **Monolith** | Simple to develop/deploy, harder to scale independently |
| **Microservices** | Scale independently, operational complexity |

**Decision Factor:** Is your scaling bottleneck a specific component?

### 2. Consistency vs Availability (CAP)

| Choice | Trade-off |
|--------|-----------|
| **Strong Consistency** | Always correct, may be unavailable during partitions |
| **Eventual Consistency** | Always available, may read stale data |

**Decision Factor:** Can users tolerate stale data? (e.g., inventory counts vs. bank balances)

### 3. Coupling vs Autonomy

| Choice | Trade-off |
|--------|-----------|
| **Shared Database** | Easier queries, teams blocked by schema changes |
| **Database per Service** | Team independence, complex cross-service queries |

**Decision Factor:** How often do teams need to change schemas independently?

### 4. Synchronous vs Asynchronous

| Choice | Trade-off |
|--------|-----------|
| **Sync (REST/gRPC)** | Simple mental model, cascading failures |
| **Async (Events/Queues)** | Decoupled, eventual consistency, harder to debug |

**Decision Factor:** Do you need immediate response or fire-and-forget?

### 5. Build vs Buy

| Choice | Trade-off |
|--------|-----------|
| **Build** | Custom fit, maintenance burden |
| **Buy/SaaS** | Fast start, vendor lock-in, ongoing cost |

**Decision Factor:** Is this a core differentiator for your business?

## Analysis Template

### Step 1: Identify Decision Drivers

```markdown
1. What architectural characteristics matter most?
   - [ ] Scalability
   - [ ] Performance
   - [ ] Availability
   - [ ] Security
   - [ ] Testability
   - [ ] Deployability
   - [ ] Time-to-Market
   - [ ] Cost

2. What are the constraints?
   - Team size: ___
   - Timeline: ___
   - Budget: ___
   - Existing systems: ___
```

### Step 2: Score Options

```markdown
| Characteristic | Weight | Option A | Option B |
|----------------|--------|----------|----------|
| Scalability    | 3      | 4 (12)   | 2 (6)    |
| Simplicity     | 2      | 3 (6)    | 4 (8)    |
| Time-to-Market | 3      | 2 (6)    | 4 (12)   |
| **Total**      |        | **24**   | **26**   |
```

### Step 3: Identify Hidden Costs

- **Operational:** Who maintains this? DevOps burden?
- **Cognitive:** How much context-switching? Learning curve?
- **Technical Debt:** Does this enable or constrain future options?
- **Organizational:** Does this require team restructuring?

### Step 4: Reversibility Check

| Level | Description | Example |
|-------|-------------|---------|
| **High** | Easy to change later | Feature flag, config change |
| **Medium** | Moderate effort | Switch databases with adapter pattern |
| **Low** | Difficult/costly | Rewrite from Java to Go |

**Prefer high reversibility for uncertain decisions.**

## Real-World Examples

### Example 1: Database Selection

**Context:** New SaaS application, team of 5, MVP in 3 months

| Option | Scalability | Simplicity | Team Know | Decision |
|--------|-------------|------------|-----------|----------|
| PostgreSQL | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Choose |
| MongoDB | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | |
| DynamoDB | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ | |

**Rationale:** Team familiarity wins for MVP. PostgreSQL can scale to 10M+ rows. Revisit at that point.

### Example 2: Communication Pattern

**Context:** E-commerce, order → payment → inventory → shipping

| Option | Reliability | Complexity | Latency |
|--------|-------------|------------|---------|
| REST Chained | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Event Saga | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

**Decision:** Event Saga — failures in inventory shouldn't block order confirmation.

### Example 3: Monolith vs Microservices

**Context:** 3 developers, 6-month runway, single product

| Factor | Monolith | Microservices |
|--------|----------|---------------|
| Development Speed | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Deployment Complexity | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Independent Scaling | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Team Size Required | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**Decision:** Monolith. Three developers cannot maintain microservices overhead. Extract services later if needed.

## Red Flags in Trade-off Analysis

- ❌ "This has no downsides" — You haven't found them yet
- ❌ "Everyone uses X" — Popularity ≠ fit for your context
- ❌ "It's the modern approach" — Modern ≠ appropriate
- ❌ "We'll need it eventually" — YAGNI; build for today's scale
- ❌ Ignoring team capability — Technology is only as good as who implements it

## Key Principles

1. **Explicit over implicit** — Write down the trade-offs
2. **Context is king** — Same option can be right or wrong depending on situation
3. **Reversibility preference** — When uncertain, choose what's easier to change
4. **Team capability matters** — Don't choose tech your team can't execute on
5. **Measure success** — Define fitness functions before deciding

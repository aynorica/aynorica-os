---
mode: agent
description: Create an Architecture Decision Record (ADR) for significant decisions
---

# Architecture Decision Record (ADR) Template

Document architectural decisions with context, options, and consequences.

## When to Create an ADR

- Technology selection (framework, database, cloud provider)
- Architectural style change (monolith → microservices)
- Integration patterns (sync vs async)
- Security model decisions
- Data architecture choices
- Breaking API changes

## ADR Template

```markdown
# ADR-{NUMBER}: {TITLE}

**Date:** {YYYY-MM-DD}
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision Drivers

- {driver 1}
- {driver 2}
- {driver 3}

## Considered Options

### Option 1: {Name}

**Description:** Brief explanation

**Pros:**
- {advantage 1}
- {advantage 2}

**Cons:**
- {disadvantage 1}
- {disadvantage 2}

### Option 2: {Name}

**Description:** Brief explanation

**Pros:**
- {advantage 1}

**Cons:**
- {disadvantage 1}

## Decision

We have decided to go with **{Option N}** because {rationale tied to decision drivers}.

## Consequences

### Positive
- {positive consequence 1}
- {positive consequence 2}

### Negative
- {negative consequence 1 - the trade-off we accept}

### Risks
- {risk 1 and mitigation}

## Fitness Functions

How will we know if this decision is working?

- {measurable criterion 1}
- {measurable criterion 2}

## Reversibility

**Level:** High | Medium | Low

{Explanation of how easily this decision can be reversed}

## Related ADRs

- ADR-XXX: {Related decision}
```

## Core Principles

### First Law of Software Architecture

> **Everything is a trade-off.** If you think you found something that isn't a trade-off, you haven't identified the trade-off yet.

### Second Law

> **"Why" is more important than "how."** Context drives decisions.

## Required Context Before Deciding

1. **Business Context:** What problem are we solving?
2. **Architectural Characteristics:** Which qualities matter? (scalability, availability, testability, deployability, etc.)
3. **Constraints:** Team size, timeline, budget, regulations
4. **Current State:** Greenfield or brownfield?

## Anti-Patterns to Flag

| Anti-Pattern | Description |
|--------------|-------------|
| **Architecture by Buzzword** | Choosing tech because it's trendy |
| **Resume-Driven Development** | Choosing tech to learn, not to fit |
| **Accidental Complexity** | Distributed systems without distributed problems |
| **Analysis Paralysis** | Over-analyzing instead of deciding |
| **Ivory Tower Architecture** | Designs ignoring implementation reality |

## Architectural Characteristics Reference

| Category | Characteristics |
|----------|-----------------|
| **Operational** | Availability, Reliability, Scalability, Performance |
| **Structural** | Maintainability, Modularity, Testability, Deployability |
| **Cross-Cutting** | Security, Observability, Accessibility |
| **Process** | Agility, Time-to-Market, Cost, Simplicity |

## Example ADR

```markdown
# ADR-001: Use PostgreSQL as Primary Database

**Date:** 2024-11-30
**Status:** Accepted

## Context

We need a database for user data, sessions, and configuration. Must support:
- ACID transactions for financial data
- JSON storage for flexible schemas
- Good ecosystem and tooling

## Decision Drivers

- Team familiarity with SQL
- Need for ACID compliance
- JSON data requirements
- Open source preference

## Considered Options

### Option 1: PostgreSQL
**Pros:** ACID, JSON support, mature, team knows it
**Cons:** Scaling requires more effort than NoSQL

### Option 2: MongoDB
**Pros:** Flexible schema, horizontal scaling
**Cons:** No true ACID (until v4), team unfamiliar

### Option 3: DynamoDB
**Pros:** Managed, scales infinitely
**Cons:** Vendor lock-in, query limitations, cost at scale

## Decision

**PostgreSQL** because:
1. Team already proficient
2. ACID compliance required for financial data
3. JSON support via JSONB covers schema flexibility needs
4. Can scale to 10M+ rows with proper indexing

## Consequences

### Positive
- Fast development (team knows SQL)
- Strong data integrity
- Rich query capabilities

### Negative
- Manual scaling at very high volumes
- Requires self-management or RDS costs

## Fitness Functions

- Query latency p95 < 50ms
- No data corruption incidents
- Schema migrations complete in < 5 min

## Reversibility

**Medium** — Data can be migrated, but application code changes required.
```

## Key Principles

1. **Never recommend without context** — Ask clarifying questions
2. **Explicit trade-offs** — Every option has costs
3. **Reversibility matters** — Prefer reversible decisions
4. **Fitness functions** — Make success measurable
5. **Document the "why"** — Future readers need context

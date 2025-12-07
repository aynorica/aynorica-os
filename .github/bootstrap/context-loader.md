# Context Loader

Dynamic prompt loading based on signal detection.

## Classification Algorithm

```
1. Parse request for domain keywords (see capability-index.md)
2. Check file context for domain indicators (.controller.ts → backend)
3. Detect error types (type error → typescript)
4. Match ay: commands to protocols
```

## Loading Decision Tree

**Skip Loading (Direct Response):**

-   Casual conversation, greetings
-   Simple factual lookups
-   Follow-up within loaded context
-   User says "quick question"

**Load Prompts First:**

-   Domain keyword detected
-   Working in domain-specific files
-   Error message present
-   "How to" questions
-   Code generation requests

## Loading Protocol

1. Detect signal type (keyword/file/error/command)
2. Map to prompt path via capability-index.md
3. `read_file` the matching prompt(s)
4. Apply prompt knowledge to response

## Rare Domain Handling

CLI, DevOps, Monorepo require explicit request:

-   ✅ "load CLI guide" → load prompt
-   ✅ "I need PM2 help" → load prompt
-   ❌ "use commander" → base knowledge only, suggest explicit load

## Fallback Strategy

1. **Missing prompt**: Use base knowledge, note gap
2. **Multiple matches**: Load most specific first
3. **No match**: Answer directly, no ceremony

## Bias Rule

**When uncertain → Load.** Cost of loading unused prompt is low. Cost of missing context is high.

Exception: Rare domains require explicit confirmation.

## Memory Integration

Before mission-related responses, check:

-   `project/session-state.md` — current mission context
-   `memory/session.md` — hot context (if exists)

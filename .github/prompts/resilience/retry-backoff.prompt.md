---
mode: agent
description: Implement retry with exponential backoff and jitter
---

# Retry and Backoff Strategies

Handle transient failures with intelligent retry logic.

## Exponential Backoff Formula

$$
\text{delay} = \min(\text{cap}, \text{base} \times 2^{\text{attempt}})
$$

With full jitter (recommended):

$$
\text{sleep} = \text{random}(0, \text{delay})
$$

## Implementation with p-retry

```typescript
import pRetry from 'p-retry';

async function fetchWithRetry(url: string) {
  return await pRetry(
    async () => {
      const response = await fetch(url);
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      if (response.status === 429) {
        throw new Error('Rate limited');
      }
      return response.json();
    },
    {
      retries: 3,
      minTimeout: 1000,      // Start at 1 second
      maxTimeout: 10000,     // Cap at 10 seconds
      factor: 2,             // Double each time
      randomize: true,       // Add jitter
      onFailedAttempt: (error) => {
        console.log(
          `Attempt ${error.attemptNumber} failed. ` +
          `${error.retriesLeft} retries left.`
        );
      },
    }
  );
}
```

## When to Retry

**✅ Retry:**
- 5xx server errors
- Network timeouts
- Connection refused
- Rate limiting (with backoff)

**❌ Don't Retry:**
- 4xx client errors (bad request, unauthorized)
- Validation errors
- Business logic failures
- Non-idempotent operations without idempotency key

## Retry Budget

Limit total retry load to prevent thundering herd:

```typescript
class RetryBudget {
  private remaining: number;
  private resetInterval: NodeJS.Timer;

  constructor(
    private budget: number = 100,
    private resetPeriodMs: number = 60000
  ) {
    this.remaining = budget;
    this.resetInterval = setInterval(() => {
      this.remaining = this.budget;
    }, resetPeriodMs);
  }

  canRetry(): boolean {
    if (this.remaining > 0) {
      this.remaining--;
      return true;
    }
    return false;
  }

  destroy() {
    clearInterval(this.resetInterval);
  }
}

// Usage
const budget = new RetryBudget(100, 60000); // 100 retries per minute

async function callWithBudget(fn: () => Promise<any>) {
  if (!budget.canRetry()) {
    throw new Error('Retry budget exhausted');
  }
  return fn();
}
```

## Backoff Strategies Compared

| Strategy | Formula | Use Case |
|----------|---------|----------|
| **Constant** | delay = base | Simple rate limiting |
| **Linear** | delay = base × attempt | Gradual increase |
| **Exponential** | delay = base × 2^attempt | Typical network retry |
| **Exponential + Jitter** | delay = random(0, base × 2^attempt) | Production standard |

## Full Jitter vs Equal Jitter

```typescript
// Full jitter (recommended) - better spread
const fullJitter = Math.random() * Math.min(cap, base * Math.pow(2, attempt));

// Equal jitter - less aggressive
const equalJitter = Math.min(cap, base * Math.pow(2, attempt)) / 2 +
  Math.random() * Math.min(cap, base * Math.pow(2, attempt)) / 2;
```

Full jitter prevents synchronized retries better.

## With Circuit Breaker

Combine retry with circuit breaker for complete resilience:

```typescript
import CircuitBreaker from 'opossum';
import pRetry from 'p-retry';

const circuitBreaker = new CircuitBreaker(
  async (url: string) => {
    return await pRetry(
      () => fetch(url).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
      { retries: 3, randomize: true }
    );
  },
  { timeout: 10000, errorThresholdPercentage: 50 }
);

// Retries happen inside the circuit breaker
const result = await circuitBreaker.fire('https://api.example.com/data');
```

## NestJS Integration

```typescript
// retry.decorator.ts
import { applyDecorators, SetMetadata } from '@nestjs/common';

export interface RetryOptions {
  retries: number;
  delay: number;
  factor: number;
}

export const RETRY_OPTIONS = 'RETRY_OPTIONS';

export function Retry(options: Partial<RetryOptions> = {}) {
  return applyDecorators(
    SetMetadata(RETRY_OPTIONS, {
      retries: options.retries ?? 3,
      delay: options.delay ?? 1000,
      factor: options.factor ?? 2,
    }),
  );
}

// retry.interceptor.ts
@Injectable()
export class RetryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const options = this.reflector.get<RetryOptions>(
      RETRY_OPTIONS,
      context.getHandler(),
    );

    if (!options) return next.handle();

    return next.handle().pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((acc, error) => {
            if (acc >= options.retries) throw error;
            return acc + 1;
          }, 0),
          delayWhen(attempt =>
            timer(options.delay * Math.pow(options.factor, attempt))
          ),
        )
      ),
    );
  }
}

// Usage
@Get('external')
@Retry({ retries: 3, delay: 1000 })
async getExternalData() {
  return this.externalService.fetch();
}
```

## Configuration Guidelines

| Setting | Typical Value | Notes |
|---------|---------------|-------|
| `retries` | 3-5 | Don't retry forever |
| `minTimeout` | 1000ms | Start slow |
| `maxTimeout` | 30000ms | Cap at 30s |
| `factor` | 2 | Double each time |
| `randomize` | true | Always use jitter |

## Key Principles

1. **Always use jitter** — Prevents thundering herd
2. **Cap retry count** — 3-5 is usually enough
3. **Cap max delay** — Don't wait forever
4. **Retry budget** — Limit total retries system-wide
5. **Only retry idempotent** — Or use idempotency keys
6. **Log retry attempts** — Visibility into failures

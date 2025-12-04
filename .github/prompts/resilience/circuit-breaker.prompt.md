---
mode: agent
description: Implement circuit breaker pattern for resilient services
---

# Circuit Breaker Pattern

Prevent cascading failures by failing fast when a service is unhealthy.

## States

```
     Success                    Timeout/Failure
        │                            │
   ┌────▼────┐   Failure Rate   ┌────▼────┐
   │ CLOSED  │ ───────────────► │  OPEN   │
   │ (normal)│                  │ (fail)  │
   └────┬────┘                  └────┬────┘
        │                            │
        │      Reset Timeout         │
        │ ◄──────────────────────────┤
        │                            │
   ┌────▼────┐   Success        ┌────▼────┐
   │ CLOSED  │ ◄─────────────── │HALF-OPEN│
   └─────────┘                  │ (test)  │
                    Failure     └────┬────┘
               ┌────────────────────►│
               │                     │
               │     ┌───────────────┘
               └─────▼─────┐
                  │ OPEN   │
                  └────────┘
```

## Implementation with Opossum

```typescript
import CircuitBreaker from 'opossum';

// Wrap the function that might fail
async function callExternalService(id: string) {
  const response = await fetch(`https://api.example.com/users/${id}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// Create circuit breaker
const breaker = new CircuitBreaker(callExternalService, {
  timeout: 5000,                   // 5 seconds
  errorThresholdPercentage: 50,    // Open after 50% failures
  resetTimeout: 30000,             // Try again after 30 seconds
  volumeThreshold: 5,              // Min requests before tripping
});

// Add fallback
breaker.fallback((id: string) => {
  return { id, cached: true, message: 'Service unavailable' };
});

// Add event handlers
breaker.on('open', () => console.log('Circuit OPEN - failing fast'));
breaker.on('halfOpen', () => console.log('Circuit HALF-OPEN - testing'));
breaker.on('close', () => console.log('Circuit CLOSED - normal operation'));
breaker.on('fallback', (result) => console.log('Fallback used:', result));

// Usage
const user = await breaker.fire('user-123');
```

## Configuration Guidelines

| Setting | Value | Reasoning |
|---------|-------|-----------|
| `timeout` | 5000ms | 2x expected p95 latency |
| `errorThresholdPercentage` | 50 | Open after half fail |
| `resetTimeout` | 30000ms | Time to recover |
| `volumeThreshold` | 5-10 | Avoid opening on 1 failure |

## Per-Service Breakers

```typescript
// One breaker per external service
const breakers = new Map<string, CircuitBreaker>();

function getBreaker(serviceId: string): CircuitBreaker {
  if (!breakers.has(serviceId)) {
    breakers.set(serviceId, new CircuitBreaker(
      (query: string) => callService(serviceId, query),
      { timeout: 5000, errorThresholdPercentage: 50 }
    ));
  }
  return breakers.get(serviceId)!;
}

// Usage
const result = await getBreaker('payment-service').fire(paymentQuery);
```

## With NestJS

```typescript
// circuit-breaker.module.ts
import { Module, Global } from '@nestjs/common';
import CircuitBreaker from 'opossum';

@Global()
@Module({
  providers: [
    {
      provide: 'CIRCUIT_BREAKER_OPTIONS',
      useValue: {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
      },
    },
  ],
  exports: ['CIRCUIT_BREAKER_OPTIONS'],
})
export class CircuitBreakerModule {}

// In service
@Injectable()
export class ExternalApiService {
  private breaker: CircuitBreaker;

  constructor(@Inject('CIRCUIT_BREAKER_OPTIONS') options: object) {
    this.breaker = new CircuitBreaker(
      this.callApi.bind(this),
      options
    );
    this.breaker.fallback(() => this.getCachedResponse());
  }

  private async callApi(endpoint: string) {
    // actual API call
  }

  private getCachedResponse() {
    // return cached/default response
  }

  async query(endpoint: string) {
    return this.breaker.fire(endpoint);
  }
}
```

## Monitoring

```typescript
// Health check endpoint
@Controller('health')
export class HealthController {
  constructor(private circuitBreakers: Map<string, CircuitBreaker>) {}

  @Get('circuits')
  getCircuitStatus() {
    const statuses = {};
    for (const [name, breaker] of this.circuitBreakers) {
      statuses[name] = {
        state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
        stats: breaker.stats,
      };
    }
    return statuses;
  }
}
```

## When to Use

**✅ Use Circuit Breaker:**
- External API calls
- Database connections that might timeout
- Cross-service calls in microservices
- Any operation that can fail repeatedly

**❌ Don't Use:**
- Local synchronous operations
- One-off operations (no retry expected)
- Operations where failure is acceptable

## Fallback Strategies

| Strategy | Use Case |
|----------|----------|
| Cached response | Read operations with stale data tolerance |
| Default value | Optional features |
| Queue for later | Write operations |
| Error response | When fallback not possible |

## Key Principles

1. **One breaker per dependency** — Don't share breakers
2. **Meaningful fallbacks** — Degrade gracefully, don't just throw
3. **Monitor state changes** — Alert on circuit opening
4. **Tune thresholds** — Based on real traffic patterns
5. **Test the failure path** — Chaos engineering

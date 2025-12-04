---
mode: agent
description: Patterns for microservices inter-service communication
---

# Microservices Communication Patterns

Decide on the right communication pattern for your distributed system.

## Pattern Selection Matrix

| Requirement | Pattern | Use Case |
|-------------|---------|----------|
| Broadcast to many services | **Pub/Sub** | Order created → notify inventory, shipping |
| Request-response (sync feel) | **Request-Reply** | Get user details from User Service |
| Distributed transaction | **Saga (Choreography)** | E-commerce: Payment → Inventory → Shipping |
| Complex workflow | **Saga (Orchestration)** | Loan approval with multiple checks |
| Work distribution | **Competing Consumers** | Process uploaded images |

## Pub/Sub Pattern

**Use when:** Broadcasting events to multiple subscribers

```typescript
// Publisher
await redis.publish('orders', JSON.stringify({
  type: 'ORDER_CREATED',
  orderId,
  amount,
}));

// Subscriber
redis.subscribe('orders', (message) => {
  const event = JSON.parse(message);
  if (event.type === 'ORDER_CREATED') {
    await updateInventory(event);
  }
});
```

**Trade-offs:**
- ✅ Loose coupling, easy to add subscribers
- ❌ No delivery guarantee (fire-and-forget)
- ❌ No built-in replay

## Request-Reply Pattern

**Use when:** Need synchronous response, RPC-style calls

```typescript
// Request with correlation ID
const correlationId = uuid();
await channel.sendToQueue('user-service', Buffer.from(JSON.stringify({
  action: 'GET_USER',
  userId,
  correlationId,
})), {
  replyTo: 'reply-queue',
  correlationId,
});

// Wait for response
const response = await waitForReply(correlationId, 5000);
```

**Trade-offs:**
- ✅ Simple mental model
- ✅ Built-in timeouts
- ❌ Tight coupling to response time
- ❌ Can cause cascading failures

## Saga Pattern (Choreography)

**Use when:** Distributed transactions without coordinator

```
Order Service → Payment Service → Inventory Service → Shipping Service
     │              │                  │                    │
     └──────────────┴──────────────────┴────────────────────┘
                    (Events trigger next step)
```

```typescript
// Each service listens and emits events
consumer.on('PAYMENT_COMPLETED', async (event) => {
  try {
    await reserveInventory(event.orderId);
    await emit('INVENTORY_RESERVED', { orderId: event.orderId });
  } catch (error) {
    await emit('INVENTORY_FAILED', { orderId: event.orderId, error });
  }
});
```

**Trade-offs:**
- ✅ Decentralized, no single point of failure
- ❌ Harder to track overall flow
- ❌ Complex compensation logic

## Saga Pattern (Orchestration)

**Use when:** Complex workflows needing central coordination

```typescript
class OrderSaga {
  async execute(orderId: string) {
    try {
      await this.paymentService.charge(orderId);
      await this.inventoryService.reserve(orderId);
      await this.shippingService.schedule(orderId);
    } catch (error) {
      await this.compensate(orderId, error);
    }
  }

  async compensate(orderId: string, failedAt: string) {
    // Reverse in order
    if (failedAt === 'shipping') {
      await this.inventoryService.release(orderId);
    }
    if (failedAt === 'inventory' || failedAt === 'shipping') {
      await this.paymentService.refund(orderId);
    }
  }
}
```

**Trade-offs:**
- ✅ Clear workflow visibility
- ✅ Centralized compensation
- ❌ Single point of failure (orchestrator)
- ❌ More coupling to orchestrator

## Message Broker Selection

| Requirement | Broker | Notes |
|-------------|--------|-------|
| Simple pub/sub, low latency | Redis, NATS | No durability |
| Durable, replay | Kafka | Higher complexity |
| RPC request-reply | RabbitMQ, NATS | Built-in correlation |
| Exactly-once | Kafka (transactional) | Performance cost |
| No broker | TCP, gRPC | Lowest latency |

## Communication Stack

```
┌─────────────────────────────────────┐
│  APPLICATION (Saga, Business Logic) │
├─────────────────────────────────────┤
│  MESSAGING (Pub/Sub, Request-Reply) │
├─────────────────────────────────────┤
│  RESILIENCE (Circuit Breaker, Retry)│
├─────────────────────────────────────┤
│  DISCOVERY (Consul, K8s DNS)        │
├─────────────────────────────────────┤
│  TRANSPORT (TCP, Redis, NATS, gRPC) │
└─────────────────────────────────────┘
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Retry without idempotency | Duplicate operations | Add idempotency keys |
| Infinite retries | Thundering herd | Retry budgets + circuit breaker |
| No circuit breaker | Cascade failures | Add circuit breaker |
| Hardcoded IPs | Breaks on scale | Service discovery |
| No DLQ | Poison messages block queue | Add dead letter queue |

## Decision Framework

1. **Choose communication pattern** (Pub/Sub vs Request-Reply vs Saga)
2. **Select message broker** (or direct TCP/gRPC)
3. **Add resilience** (Circuit Breaker + Retry + Idempotency)
4. **Add DLQ** for poison messages
5. **Add service discovery** (if dynamic scaling)

## Key Principles

1. **Design for failure** — Services will be unavailable
2. **Idempotency everywhere** — Safe to retry any operation
3. **Timeouts on all calls** — Never wait forever
4. **Circuit breaker external calls** — Prevent cascades
5. **Eventual consistency** — Accept that consistency takes time

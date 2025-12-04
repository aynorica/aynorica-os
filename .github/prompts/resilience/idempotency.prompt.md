---
mode: agent
description: Implement idempotency for safe retry operations
---

# Idempotency Patterns

Ensure operations can be safely retried without side effects.

## What is Idempotency?

An operation is idempotent if calling it multiple times produces the same result as calling it once.

| Method | Naturally Idempotent? |
|--------|----------------------|
| GET | ✅ Yes |
| PUT | ✅ Yes (replace) |
| DELETE | ✅ Yes |
| POST | ❌ No (creates new) |
| PATCH | ⚠️ Depends |

## Idempotency Key Pattern

```typescript
interface IdempotentRequest {
  idempotencyKey: string;  // Client-generated UUID
  payload: any;
}

interface IdempotentResponse<T> {
  status: 'completed' | 'in_progress';
  result?: T;
  createdAt: Date;
}

class IdempotencyService {
  private store: Map<string, IdempotentResponse<any>> = new Map();

  async execute<T>(
    key: string,
    operation: () => Promise<T>,
    ttlMs: number = 86400000 // 24 hours
  ): Promise<T> {
    // Check for existing result
    const existing = this.store.get(key);
    if (existing) {
      if (existing.status === 'completed') {
        return existing.result;
      }
      // In progress - wait or return pending
      throw new Error('Operation in progress');
    }

    // Mark as in progress
    this.store.set(key, {
      status: 'in_progress',
      createdAt: new Date(),
    });

    try {
      const result = await operation();
      
      // Store result
      this.store.set(key, {
        status: 'completed',
        result,
        createdAt: new Date(),
      });

      // Schedule cleanup
      setTimeout(() => this.store.delete(key), ttlMs);

      return result;
    } catch (error) {
      // Remove on failure (allow retry)
      this.store.delete(key);
      throw error;
    }
  }
}
```

## Database-Backed Implementation

```typescript
// PostgreSQL schema
/*
CREATE TABLE idempotency_keys (
  key VARCHAR(255) PRIMARY KEY,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  result JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);
*/

@Injectable()
export class IdempotencyService {
  constructor(
    @InjectRepository(IdempotencyKey)
    private repo: Repository<IdempotencyKey>,
  ) {}

  async execute<T>(
    key: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    // Try to insert (atomic check-and-set)
    try {
      await this.repo.insert({ key, status: 'in_progress' });
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        const existing = await this.repo.findOne({ where: { key } });
        if (existing?.status === 'completed') {
          return existing.result as T;
        }
        throw new ConflictException('Operation in progress');
      }
      throw error;
    }

    try {
      const result = await operation();
      
      await this.repo.update(key, {
        status: 'completed',
        result,
      });

      return result;
    } catch (error) {
      await this.repo.delete(key);
      throw error;
    }
  }
}
```

## Controller Integration

```typescript
@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private idempotency: IdempotencyService,
  ) {}

  @Post()
  @Header('Idempotency-Key', 'required')
  async createPayment(
    @Headers('Idempotency-Key') key: string,
    @Body() dto: CreatePaymentDto,
  ) {
    if (!key) {
      throw new BadRequestException('Idempotency-Key header required');
    }

    return this.idempotency.execute(key, () =>
      this.paymentsService.create(dto)
    );
  }
}
```

## Federation Message Idempotency

```typescript
interface FederationMessage {
  id: string;         // UUID - idempotency key
  from: string;
  to: string;
  action: string;
  payload: any;
  timestamp: string;
}

class FederationHandler {
  private processed = new Set<string>();

  async handle(msg: FederationMessage): Promise<any> {
    // Deduplicate
    if (this.processed.has(msg.id)) {
      console.log(`Duplicate message ${msg.id}, returning cached`);
      return this.getCachedResult(msg.id);
    }

    // Process
    const result = await this.processMessage(msg);
    
    // Mark processed
    this.processed.add(msg.id);
    this.cacheResult(msg.id, result);
    
    return result;
  }
}
```

## Redis-Based Implementation

```typescript
import Redis from 'ioredis';

class RedisIdempotency {
  constructor(private redis: Redis) {}

  async execute<T>(
    key: string,
    operation: () => Promise<T>,
    ttlSeconds: number = 86400
  ): Promise<T> {
    const lockKey = `idempotency:${key}`;
    
    // Try to acquire lock
    const locked = await this.redis.set(
      lockKey,
      'in_progress',
      'EX', ttlSeconds,
      'NX'  // Only if not exists
    );

    if (!locked) {
      // Check if completed
      const existing = await this.redis.get(`result:${key}`);
      if (existing) {
        return JSON.parse(existing);
      }
      throw new Error('Operation in progress');
    }

    try {
      const result = await operation();
      
      // Store result
      await this.redis.setex(
        `result:${key}`,
        ttlSeconds,
        JSON.stringify(result)
      );
      
      // Update status
      await this.redis.setex(lockKey, ttlSeconds, 'completed');
      
      return result;
    } catch (error) {
      await this.redis.del(lockKey);
      throw error;
    }
  }
}
```

## Handling Concurrent Requests

```typescript
// Using database locking
async executeWithLock<T>(
  key: string,
  operation: () => Promise<T>,
): Promise<T> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Lock the row (SELECT FOR UPDATE)
    const existing = await queryRunner.manager
      .createQueryBuilder(IdempotencyKey, 'ik')
      .setLock('pessimistic_write')
      .where('ik.key = :key', { key })
      .getOne();

    if (existing?.status === 'completed') {
      await queryRunner.rollbackTransaction();
      return existing.result;
    }

    // Execute operation
    const result = await operation();

    // Store result
    await queryRunner.manager.upsert(IdempotencyKey, {
      key,
      status: 'completed',
      result,
    }, ['key']);

    await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

## Key Guidelines

| Guideline | Reasoning |
|-----------|-----------|
| Client generates key | Client controls retry |
| UUID v4 format | Unique, unpredictable |
| 24-hour TTL | Allow late retries |
| Store in database | Survives restarts |
| Return same response | Consistent client experience |

## Key Principles

1. **Always use idempotency keys** for non-GET operations
2. **Client generates key** — They control retry behavior
3. **Store results** — Return same response on duplicate
4. **Set TTL** — Clean up old keys
5. **Atomic check-and-set** — Prevent race conditions
6. **Delete on failure** — Allow genuine retry

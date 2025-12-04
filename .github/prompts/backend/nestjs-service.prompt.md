---
mode: agent
description: Generate a NestJS service with proper patterns and error handling
---

# NestJS Service Generator

Generate a production-ready NestJS service with TypeORM repository pattern.

## Input Requirements

- **serviceName**: The name of the service (e.g., "users", "orders")
- **entityName**: The TypeORM entity this service manages
- **methods**: CRUD methods to include
- **hasCache**: Whether to include caching (default: false)

## Service Template

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { {Entity} } from './entities/{entity}.entity';
import { Create{Entity}Dto } from './dto/create-{entity}.dto';
import { Update{Entity}Dto } from './dto/update-{entity}.dto';

@Injectable()
export class {PascalName}Service {
  constructor(
    @InjectRepository({Entity})
    private readonly {camelName}Repository: Repository<{Entity}>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: Create{Entity}Dto): Promise<{Entity}> {
    const entity = this.{camelName}Repository.create(dto);
    return this.{camelName}Repository.save(entity);
  }

  async findAll(): Promise<{Entity}[]> {
    return this.{camelName}Repository.find();
  }

  async findOne(id: number): Promise<{Entity}> {
    const entity = await this.{camelName}Repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`{Entity} #${id} not found`);
    }
    return entity;
  }

  async update(id: number, dto: Update{Entity}Dto): Promise<{Entity}> {
    const entity = await this.findOne(id); // Throws if not found
    Object.assign(entity, dto);
    return this.{camelName}Repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const result = await this.{camelName}Repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`{Entity} #${id} not found`);
    }
  }
}
```

## With Relations

```typescript
async findOneWithRelations(id: number): Promise<{Entity}> {
  const entity = await this.{camelName}Repository.findOne({
    where: { id },
    relations: ['profile', 'posts'], // Eager load relations
  });
  if (!entity) {
    throw new NotFoundException(`{Entity} #${id} not found`);
  }
  return entity;
}
```

## With Transactions

```typescript
async createWithProfile(dto: Create{Entity}Dto): Promise<{Entity}> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    const entity = await queryRunner.manager.save({Entity}, dto);
    await queryRunner.manager.save(Profile, { userId: entity.id });
    await queryRunner.commitTransaction();
    return entity;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
```

## With Caching (Keyv)

```typescript
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class {PascalName}Service {
  constructor(
    @InjectRepository({Entity})
    private readonly {camelName}Repository: Repository<{Entity}>,
    @Inject(CACHE_MANAGER) 
    private readonly cacheManager: Cache,
  ) {}

  async findOne(id: number): Promise<{Entity}> {
    const cacheKey = `{entity}:${id}`;
    
    // Check cache first
    const cached = await this.cacheManager.get<{Entity}>(cacheKey);
    if (cached) return cached;
    
    // Query database
    const entity = await this.{camelName}Repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`{Entity} #${id} not found`);
    }
    
    // Cache for 1 hour
    await this.cacheManager.set(cacheKey, entity, 3600000);
    return entity;
  }
  
  async update(id: number, dto: Update{Entity}Dto): Promise<{Entity}> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    const saved = await this.{camelName}Repository.save(entity);
    
    // Invalidate cache
    await this.cacheManager.del(`{entity}:${id}`);
    return saved;
  }
}
```

## Key Principles

1. **Always throw NotFoundException** for missing entities
2. **Use transactions** for multi-entity operations
3. **Invalidate cache** on mutations
4. **Singleton scope by default** (no `@Injectable({ scope: Scope.REQUEST })`)
5. **Query Builder** for complex queries

## Anti-Patterns to Avoid

- ❌ N+1 queries (use relations or joins)
- ❌ Catching and swallowing errors silently
- ❌ Hardcoded configuration values
- ❌ Business logic in controllers

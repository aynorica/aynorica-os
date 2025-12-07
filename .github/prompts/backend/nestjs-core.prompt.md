---
mode: agent
description: NestJS core patterns - controllers, services, modules with proper DI and validation
---

# NestJS Core Development Guide

Production-ready patterns for NestJS controllers, services, and modules.

---

## Controller Pattern

### Standard REST Controller

```typescript
import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  ParseIntPipe, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('{resource}')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: '{resource}', version: '1' })
export class {Resource}Controller {
  constructor(private readonly service: {Resource}Service) {}

  @Post()
  @ApiOperation({ summary: 'Create resource' })
  @ApiResponse({ status: 201, type: {Resource} })
  create(@Body() dto: Create{Resource}Dto): Promise<{Resource}> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List resources' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('limit', ParseIntPipe) limit?: number): Promise<{Resource}[]> {
    return this.service.findAll({ limit });
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: {Resource} })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<{Resource}> {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Update{Resource}Dto,
  ): Promise<{Resource}> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
```

### Custom Decorators

```typescript
// decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.user?.[data] : request.user;
  },
);

// Usage
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

---

## Service Pattern

### Repository-Based Service

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class {Resource}Service {
  constructor(
    @InjectRepository({Entity})
    private readonly repository: Repository<{Entity}>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: Create{Entity}Dto): Promise<{Entity}> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<{Entity}[]> {
    return this.repository.find({
      take: options?.limit,
      skip: options?.offset,
    });
  }

  async findOne(id: number): Promise<{Entity}> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`{Entity} #${id} not found`);
    }
    return entity;
  }

  async update(id: number, dto: Update{Entity}Dto): Promise<{Entity}> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`{Entity} #${id} not found`);
    }
  }
}
```

### With Relations

```typescript
async findOneWithRelations(id: number): Promise<{Entity}> {
  return this.repository.findOne({
    where: { id },
    relations: ['profile', 'posts'],
  });
}
```

### With Transactions

```typescript
async createWithProfile(dto: CreateDto): Promise<{Entity}> {
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

### With Caching

```typescript
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class {Resource}Service {
  constructor(
    @InjectRepository({Entity})
    private readonly repository: Repository<{Entity}>,
    @Inject(CACHE_MANAGER) 
    private readonly cache: Cache,
  ) {}

  async findOne(id: number): Promise<{Entity}> {
    const key = `{entity}:${id}`;
    const cached = await this.cache.get<{Entity}>(key);
    if (cached) return cached;
    
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException();
    
    await this.cache.set(key, entity, 3600000); // 1 hour
    return entity;
  }
  
  async update(id: number, dto: UpdateDto): Promise<{Entity}> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    const saved = await this.repository.save(entity);
    await this.cache.del(`{entity}:${id}`);
    return saved;
  }
}
```

---

## Module Pattern

### Feature Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([{Entity}])],
  controllers: [{Resource}Controller],
  providers: [{Resource}Service],
  exports: [{Resource}Service], // Only export what's needed
})
export class {Resource}Module {}
```

### Dynamic Module

```typescript
@Module({})
export class {Resource}Module {
  static forRoot(options: ModuleOptions): DynamicModule {
    return {
      module: {Resource}Module,
      providers: [
        { provide: 'MODULE_OPTIONS', useValue: options },
        {Resource}Service,
      ],
      exports: [{Resource}Service],
    };
  }
  
  static forRootAsync(options: AsyncModuleOptions): DynamicModule {
    return {
      module: {Resource}Module,
      imports: options.imports || [],
      providers: [
        {
          provide: 'MODULE_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {Resource}Service,
      ],
      exports: [{Resource}Service],
    };
  }
}
```

---

## DTOs & Validation

### Create DTO

```typescript
import { IsString, IsEmail, MinLength, IsOptional, ValidateNested, Type } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Create{Resource}Dto {
  @ApiProperty({ description: 'Name', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileDto)
  profile?: ProfileDto;
}
```

### Update DTO

```typescript
import { PartialType } from '@nestjs/swagger';

export class Update{Resource}Dto extends PartialType(Create{Resource}Dto) {}
```

### Global Validation (main.ts)

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
}));
```

---

## Core Principles

1. **Controllers** — Routing + validation only, no business logic
2. **Services** — Business logic + data access
3. **Always throw NotFoundException** for missing entities
4. **Use DTOs** for all request/response bodies
5. **Document with Swagger** decorators
6. **Use transactions** for multi-step operations
7. **Cache invalidation** on mutations
8. **Module encapsulation** — only export what's needed

---

## Anti-Patterns

- ❌ Business logic in controllers
- ❌ Manual validation (use class-validator)
- ❌ Returning raw entities (use DTOs)
- ❌ N+1 queries (eager load relations)
- ❌ Exporting entire modules
- ❌ Circular imports without `forwardRef()`

---
mode: agent
description: Generate a NestJS REST controller with validation and documentation
---

# NestJS Controller Generator

Generate a production-ready NestJS REST controller with Swagger docs and validation.

## Input Requirements

- **controllerName**: The resource name (e.g., "users", "products")
- **serviceName**: The service to inject
- **hasAuth**: Whether to require authentication (default: true)
- **apiVersion**: API version (default: "1")

## Controller Template

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { {PascalName}Service } from './{name}.service';
import { Create{Entity}Dto } from './dto/create-{entity}.dto';
import { Update{Entity}Dto } from './dto/update-{entity}.dto';
import { {Entity} } from './entities/{entity}.entity';

@ApiTags('{name}')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: '{name}', version: '1' })
export class {PascalName}Controller {
  constructor(private readonly {camelName}Service: {PascalName}Service) {}

  @Post()
  @ApiOperation({ summary: 'Create a new {entity}' })
  @ApiResponse({ status: 201, description: '{Entity} created', type: {Entity} })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: Create{Entity}Dto): Promise<{Entity}> {
    return this.{camelName}Service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all {entities}' })
  @ApiResponse({ status: 200, description: 'List of {entities}', type: [{Entity}] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ): Promise<{Entity}[]> {
    return this.{camelName}Service.findAll({ limit, offset });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get {entity} by ID' })
  @ApiResponse({ status: 200, description: 'The {entity}', type: {Entity} })
  @ApiResponse({ status: 404, description: '{Entity} not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<{Entity}> {
    return this.{camelName}Service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update {entity}' })
  @ApiResponse({ status: 200, description: '{Entity} updated', type: {Entity} })
  @ApiResponse({ status: 404, description: '{Entity} not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Update{Entity}Dto,
  ): Promise<{Entity}> {
    return this.{camelName}Service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete {entity}' })
  @ApiResponse({ status: 204, description: '{Entity} deleted' })
  @ApiResponse({ status: 404, description: '{Entity} not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.{camelName}Service.remove(id);
  }
}
```

## Custom Parameter Decorator

```typescript
// decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

// Usage in controller
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}

@Get('email')
getEmail(@CurrentUser('email') email: string) {
  return { email };
}
```

## DTO with Validation

```typescript
// dto/create-{entity}.dto.ts
import { IsString, IsEmail, MinLength, IsOptional, ValidateNested, Type } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Create{Entity}Dto {
  @ApiProperty({ description: 'User name', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Optional profile data' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileDto)
  profile?: ProfileDto;
}

// dto/update-{entity}.dto.ts
import { PartialType } from '@nestjs/swagger';
import { Create{Entity}Dto } from './create-{entity}.dto';

export class Update{Entity}Dto extends PartialType(Create{Entity}Dto) {}
```

## Global Validation Pipe

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // Strip non-whitelisted properties
  forbidNonWhitelisted: true, // Throw error for non-whitelisted
  transform: true,            // Auto-transform payloads to DTO types
  transformOptions: {
    enableImplicitConversion: true,
  },
}));
```

## Key Principles

1. **Always use DTOs** for request bodies
2. **Use ParseIntPipe** for numeric parameters
3. **Document with Swagger** decorators
4. **Apply guards** at controller or method level
5. **Return proper HTTP status codes**

## Anti-Patterns to Avoid

- ❌ Business logic in controllers
- ❌ Manual validation (use class-validator)
- ❌ Returning raw database entities (use DTOs)
- ❌ Catching exceptions in controllers (use exception filters)

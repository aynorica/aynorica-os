---
mode: agent
description: Generate a NestJS feature module with proper encapsulation and DI
---

# NestJS Module Generator

Generate a well-structured NestJS feature module following best practices.

## Input Requirements

- **moduleName**: The name of the feature (e.g., "users", "auth", "products")
- **entities**: List of TypeORM entities this module manages
- **hasController**: Whether to include a REST controller (default: true)
- **exports**: Services to export for other modules
- **dependencies**: Other modules to import

## Output Structure

```
src/modules/{moduleName}/
├── {moduleName}.module.ts
├── {moduleName}.controller.ts
├── {moduleName}.service.ts
├── dto/
│   ├── create-{moduleName}.dto.ts
│   └── update-{moduleName}.dto.ts
└── entities/
    └── {entity}.entity.ts
```

## Module Template

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { {PascalName}Controller } from './{moduleName}.controller';
import { {PascalName}Service } from './{moduleName}.service';
import { {Entity} } from './entities/{entity}.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([{Entity}]),
    // Add other module imports here
  ],
  controllers: [{PascalName}Controller],
  providers: [{PascalName}Service],
  exports: [{PascalName}Service], // Only export what other modules need
})
export class {PascalName}Module {}
```

## Key Principles

1. **Encapsulation**: Only export services that other modules need
2. **Single Responsibility**: One module per feature domain
3. **TypeORM Integration**: Use `forFeature()` for entity registration
4. **No Circular Imports**: Use `forwardRef()` only when absolutely necessary

## Dynamic Module Pattern

For configurable modules:

```typescript
@Module({})
export class {PascalName}Module {
  static forRoot(options: {ModuleName}Options): DynamicModule {
    return {
      module: {PascalName}Module,
      providers: [
        { provide: '{MODULE}_OPTIONS', useValue: options },
        {PascalName}Service,
      ],
      exports: [{PascalName}Service],
    };
  }
  
  static forRootAsync(options: {ModuleName}AsyncOptions): DynamicModule {
    return {
      module: {PascalName}Module,
      imports: options.imports || [],
      providers: [
        {
          provide: '{MODULE}_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {PascalName}Service,
      ],
      exports: [{PascalName}Service],
    };
  }
}
```

## Anti-Patterns to Avoid

- ❌ Exporting everything from the module
- ❌ Circular dependencies without `forwardRef()`
- ❌ Importing from barrel files within same module
- ❌ Controllers in providers array

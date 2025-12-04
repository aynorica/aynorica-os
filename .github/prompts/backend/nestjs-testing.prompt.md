---
mode: agent
description: Generate NestJS unit and e2e tests following best practices
---

# NestJS Testing Generator

Generate comprehensive tests for NestJS services, controllers, and e2e flows.

## Unit Test Template (Service)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { {PascalName}Service } from './{name}.service';
import { {Entity} } from './entities/{entity}.entity';

describe('{PascalName}Service', () => {
  let service: {PascalName}Service;
  let repository: jest.Mocked<Repository<{Entity}>>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {PascalName}Service,
        {
          provide: getRepositoryToken({Entity}),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<{PascalName}Service>({PascalName}Service);
    repository = module.get(getRepositoryToken({Entity}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of {entities}', async () => {
      const expected = [{ id: 1, name: 'Test' }];
      mockRepository.find.mockResolvedValue(expected);

      const result = await service.findAll();

      expect(result).toEqual(expected);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a {entity} if found', async () => {
      const expected = { id: 1, name: 'Test' };
      mockRepository.findOne.mockResolvedValue(expected);

      const result = await service.findOne(1);

      expect(result).toEqual(expected);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a {entity}', async () => {
      const dto = { name: 'New Entity' };
      const created = { id: 1, ...dto };
      
      mockRepository.create.mockReturnValue(created);
      mockRepository.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(created);
    });
  });

  describe('remove', () => {
    it('should delete the {entity}', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
```

## Unit Test Template (Controller)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { {PascalName}Controller } from './{name}.controller';
import { {PascalName}Service } from './{name}.service';

describe('{PascalName}Controller', () => {
  let controller: {PascalName}Controller;
  let service: jest.Mocked<{PascalName}Service>;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [{PascalName}Controller],
      providers: [
        {
          provide: {PascalName}Service,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<{PascalName}Controller>({PascalName}Controller);
    service = module.get({PascalName}Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of {entities}', async () => {
      const expected = [{ id: 1, name: 'Test' }];
      mockService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll();

      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should create and return a {entity}', async () => {
      const dto = { name: 'New' };
      const expected = { id: 1, ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(result).toEqual(expected);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });
});
```

## E2E Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('{PascalName}Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /{name}', () => {
    it('should return 200 and array', () => {
      return request(app.getHttpServer())
        .get('/{name}')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('POST /{name}', () => {
    it('should create with valid data', () => {
      return request(app.getHttpServer())
        .post('/{name}')
        .send({ name: 'Test', email: 'test@example.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('Test');
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/{name}')
        .send({ name: '' }) // Invalid
        .expect(400);
    });
  });

  describe('GET /{name}/:id', () => {
    it('should return 404 for non-existent', () => {
      return request(app.getHttpServer())
        .get('/{name}/99999')
        .expect(404);
    });
  });
});
```

## Auto-Mocking with useMocker

```typescript
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('{PascalName}Service', () => {
  let service: {PascalName}Service;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [{PascalName}Service],
    })
      .useMocker((token) => {
        if (token === ConfigService) {
          return { get: jest.fn().mockReturnValue('test-value') };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = moduleRef.get({PascalName}Service);
  });
});
```

## Testing with Overrides

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [{PascalName}Module],
})
  .overrideProvider({PascalName}Service)
  .useValue({
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 1 }),
  })
  .overrideGuard(JwtAuthGuard)
  .useValue({ canActivate: () => true })
  .compile();
```

## Key Principles

1. **Use Jest** as the standard testing framework
2. **Mock repositories** with jest.fn()
3. **Clear mocks** after each test
4. **Test both success and error paths**
5. **Use ValidationPipe** in e2e tests

## Anti-Patterns to Avoid

- ❌ Testing implementation details
- ❌ Not cleaning up resources
- ❌ Skipping error path tests
- ❌ Using real database in unit tests

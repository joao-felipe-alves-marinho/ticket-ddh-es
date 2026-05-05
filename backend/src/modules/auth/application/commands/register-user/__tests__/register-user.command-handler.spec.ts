import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
import { Result } from 'src/shared/common/result';
import { RegisterUserCommandHandler } from '../register-user.command-handler';
import { RegisterUserCommand } from '../register-user.command';
import { UserWriteRepositoryPort } from 'src/modules/auth/domain/ports/user-write.repository.port';
import { UserWriteRepositoryToken } from 'src/modules/auth/auth.constants';
import { User } from 'src/modules/auth/domain/user.entity';
import { ConflictException } from 'src/shared/common/exceptions';
import { Logger } from '@nestjs/common';

const mockUserWriteRepository = (): jest.Mocked<UserWriteRepositoryPort> => ({
  save: jest.fn().mockResolvedValue(Result.success(undefined)),
  findById: jest.fn(),
  existsByEmail: jest.fn().mockResolvedValue(Result.success(false)),
});

const VALID_NAME = 'John Doe';
const VALID_EMAIL = 'john.doe@example.com';
const VALID_PASSWORD = 's3cr3tP@ssword';
const VALID_ROLE = 'reporter';

describe('RegisterUserCommandHandler', () => {
  let handler: RegisterUserCommandHandler;
  let writeRepo: jest.Mocked<UserWriteRepositoryPort>;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        RegisterUserCommandHandler,
        {
          provide: UserWriteRepositoryToken,
          useValue: mockUserWriteRepository(),
        },
      ],
    }).compile();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    handler = testingModule.get(RegisterUserCommandHandler);
    writeRepo = testingModule.get(UserWriteRepositoryToken);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.clearAllMocks();
  });

  describe('given valid command data', () => {
    let command: RegisterUserCommand;

    beforeEach(() => {
      command = new RegisterUserCommand(
        VALID_NAME,
        VALID_EMAIL,
        VALID_PASSWORD,
        VALID_ROLE,
      );
      (bcrypt.hash as unknown as jest.Mock).mockResolvedValue(
        'hashed-password',
      );
    });

    it('should call writeRepo.save once', async () => {
      await handler.execute(command);

      expect(writeRepo.save.mock.calls).toHaveLength(1);
    });

    it('should pass a User aggregate instance to writeRepo.save', async () => {
      await handler.execute(command);

      const [savedUser] = writeRepo.save.mock.calls[0];
      expect(savedUser).toBeInstanceOf(User);
    });

    it('should return Result with created user id', async () => {
      const result = await handler.execute(command);

      expect(result.isSuccess()).toBe(true);
      const id = result.unwrap();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should persist passwordHash produced by bcrypt.hash', async () => {
      await handler.execute(command);

      const [savedUser] = writeRepo.save.mock.calls[0];
      expect(savedUser.getProps().passwordHash.value).toBe('hashed-password');
    });

    it('should emit UserRegisteredDomainEvent before save', async () => {
      let eventsBeforeClear: any[] = [];

      writeRepo.save.mockImplementationOnce((user) => {
        eventsBeforeClear = [...user.domainEvents];
        return Promise.resolve(Result.success(undefined));
      });

      await handler.execute(command);

      expect(eventsBeforeClear).toHaveLength(1);
      expect(
        (eventsBeforeClear[0] as { constructor: { name: string } }).constructor
          .name,
      ).toBe('UserRegisteredDomainEvent');
    });
  });

  describe('given email already registered', () => {
    it('should return ConflictException', async () => {
      writeRepo.existsByEmail.mockResolvedValueOnce(Result.success(true));

      const command = new RegisterUserCommand(
        VALID_NAME,
        VALID_EMAIL,
        VALID_PASSWORD,
        VALID_ROLE,
      );

      const result = await handler.execute(command);

      expect(result.isFailure()).toBe(true);
      expect(result.unwrapError()).toBeInstanceOf(ConflictException);
      expect(writeRepo.save.mock.calls).toHaveLength(0);
    });
  });

  describe('domain validation', () => {
    it('should return domain error for invalid name', async () => {
      const command = new RegisterUserCommand(
        'Jo',
        VALID_EMAIL,
        VALID_PASSWORD,
        VALID_ROLE,
      );

      const result = await handler.execute(command);

      expect(result.isFailure()).toBe(true);
      expect(result.unwrapError().message).toBe(
        'User name must be between 3 and 150 characters',
      );
      expect(writeRepo.save.mock.calls).toHaveLength(0);
    });
  });

  describe('repository failures', () => {
    it('should propagate thrown error from repository.save', async () => {
      const repoError = new Error('DB down');
      writeRepo.save.mockRejectedValueOnce(repoError);

      (bcrypt.hash as unknown as jest.Mock).mockResolvedValue(
        'hashed-password',
      );

      const command = new RegisterUserCommand(
        VALID_NAME,
        VALID_EMAIL,
        VALID_PASSWORD,
        VALID_ROLE,
      );

      const result = await handler.execute(command);

      expect(result.isFailure()).toBe(true);
      expect(result.unwrapError().message).toBe('DB down');
    });

    it('should return failure when existsByEmail check fails', async () => {
      const err = new Error('exists check failed');
      writeRepo.existsByEmail.mockResolvedValueOnce(Result.failure(err as any));

      const command = new RegisterUserCommand(
        VALID_NAME,
        VALID_EMAIL,
        VALID_PASSWORD,
        VALID_ROLE,
      );

      const result = await handler.execute(command);

      expect(result.isFailure()).toBe(true);
      expect(result.unwrapError()).toBe(err);
    });
  });
});

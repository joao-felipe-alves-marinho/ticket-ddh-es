import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from 'src/shared/common/result';
import { AggregateID } from 'src/shared/domain';
import { RegisterUserCommand } from './register-user.command';
import {
  ExceptionBase,
  InternalServerErrorException,
  ConflictException,
} from 'src/shared/common/exceptions';
import * as bcrypt from 'bcrypt';
import { UserWriteRepositoryToken } from '../../../auth.constants';
import { UserWriteRepositoryPort } from '../../../domain/ports/user-write.repository.port';
import { User } from '../../../domain/user.entity';
import {
  Name,
  Email,
  Role,
  PasswordHash,
  Password,
} from '../../../domain/value-objects';

@CommandHandler(RegisterUserCommand)
export class RegisterUserCommandHandler implements ICommandHandler<RegisterUserCommand> {
  private readonly logger = new Logger(RegisterUserCommandHandler.name);

  constructor(
    @Inject(UserWriteRepositoryToken)
    private readonly userRepository: UserWriteRepositoryPort,
  ) {}

  async execute(
    command: RegisterUserCommand,
  ): Promise<Result<AggregateID, ExceptionBase>> {
    try {
      this.logger.log(`Registering user with email ${command.email}`);

      const existsResult = await this.userRepository.existsByEmail(
        command.email,
      );

      if (existsResult.isFailure()) {
        this.logger.error(
          `Failed to verify if email is already registered: ${command.email}`,
          existsResult.unwrapError(),
        );
        return Result.failure(existsResult.unwrapError());
      }

      if (existsResult.unwrap()) {
        this.logger.warn(`Email already registered: ${command.email}`);
        return Result.failure(
          new ConflictException('Email already registered'),
        );
      }

      const name = Name.create(command.name);
      const email = Email.create(command.email);
      const role = Role.create(command.role);
      const password = Password.create(command.password);

      const passwordHashStr = await bcrypt.hash(password.value, 12);
      const passwordHash = PasswordHash.create(passwordHashStr);

      const newUserResult = User.register({
        name,
        email,
        role,
        passwordHash,
      });

      const newUser = newUserResult.unwrap();

      this.logger.log(`Saving new user aggregate ${newUser.id}`);

      const saveResult = await this.userRepository.save(newUser);

      if (saveResult.isFailure()) {
        this.logger.error(
          `Failed to save user aggregate ${newUser.id}`,
          saveResult.unwrapError(),
        );
        return Result.failure(saveResult.unwrapError());
      }

      this.logger.log(`User registered successfully: ${newUser.id}`);

      return Result.success(newUser.id);
    } catch (error) {
      if (error instanceof ExceptionBase) {
        this.logger.error(
          `Register user command failed for ${command.email}`,
          error,
        );
        return Result.failure(error);
      }

      this.logger.error(
        `Unexpected error while registering user ${command.email}`,
        error instanceof Error ? error.stack : String(error),
      );

      return Result.failure(
        new InternalServerErrorException((error as Error)?.message),
      );
    }
  }
}

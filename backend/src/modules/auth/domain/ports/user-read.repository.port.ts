import { Result } from 'src/shared/common/result';
import { ExceptionBase, NotFoundException } from 'src/shared/common/exceptions';

export interface UserReadModel {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class UserReadRepositoryPort {
  abstract findById(
    id: string,
  ): Promise<Result<UserReadModel, NotFoundException>>;

  abstract findByEmail(
    email: string,
  ): Promise<Result<UserReadModel, NotFoundException>>;

  abstract findAll(): Promise<Result<UserReadModel[], ExceptionBase>>;
}

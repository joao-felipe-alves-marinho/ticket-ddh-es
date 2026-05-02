import { Result } from 'src/shared/common/result';
import { User } from '../user.entity';
import { ExceptionBase } from 'src/shared/common/exceptions';

export abstract class UserWriteRepositoryPort {
  abstract save(user: User): Promise<Result<void, ExceptionBase>>;
  abstract findById(id: string): Promise<Result<User | null, ExceptionBase>>;
  abstract existsByEmail(
    email: string,
  ): Promise<Result<boolean, ExceptionBase>>;
}

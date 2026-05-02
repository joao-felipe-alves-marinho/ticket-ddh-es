import { Result } from '../common/result';

export interface RepositoryBase<T> {
  save(entity: T): Promise<Result<void, Error>>;
  findById(id: string): Promise<Result<T | null, Error>>;
}

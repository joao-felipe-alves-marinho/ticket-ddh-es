export type Success<T> = Result<T, never>;
export type Failure<E extends Error> = Result<never, E>;

export class Result<T, E extends Error> {
  private readonly success: boolean;
  private readonly value?: T;
  private readonly error?: E;

  private constructor(success: boolean, value?: T, error?: E) {
    this.success = success;
    this.value = value;
    this.error = error;
  }

  static success<T>(value: T): Success<T> {
    return new Result<T, never>(true, value);
  }

  static failure<E extends Error>(error: E): Failure<E> {
    return new Result<never, E>(false, undefined, error);
  }

  isSuccess(): this is Success<T> {
    return this.success;
  }

  isFailure(): this is Failure<E> {
    return !this.success;
  }

  unwrap(): T {
    if (this.isFailure()) {
      const error = this.error;
      if (!error) {
        throw new Error('Expected failure to contain an error');
      }
      throw error;
    }

    return this.value as T;
  }

  unwrapError(): E {
    if (this.isSuccess()) {
      throw new Error('Cannot unwrap error from a successful result');
    }

    return this.error as E;
  }

  unwrapOr(defaultValue: T): T {
    if (this.isFailure()) {
      return defaultValue;
    }

    return this.value as T;
  }

  map<U>(mapper: (value: T) => U): Result<U, E> {
    if (this.isFailure()) {
      return Result.failure(this.error as E);
    }

    return Result.success(mapper(this.value as T));
  }

  flatMap<U, F extends Error>(
    mapper: (value: T) => Result<U, F>,
  ): Result<U, E | F> {
    if (this.isFailure()) {
      return Result.failure(this.error as E);
    }

    return mapper(this.value as T);
  }

  fold<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    if (this.isFailure()) {
      return onFailure(this.error as E);
    }

    return onSuccess(this.value as T);
  }

  match(onSuccess: (value: T) => void, onFailure: (error: E) => void): void {
    if (this.isFailure()) {
      onFailure(this.error as E);
      return;
    }

    onSuccess(this.value as T);
  }
}

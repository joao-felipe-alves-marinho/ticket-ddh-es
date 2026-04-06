export interface SerializedException {
  message: string;
  code: string;
  stack?: string;
  cause?: string;
  metadata?: unknown;
}

export abstract class ExceptionBase extends Error {
  constructor(
    readonly message: string,
    readonly cause?: Error,
    readonly metadata?: unknown,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }

  abstract code: string;

  toJSON(): SerializedException {
    return {
      message: this.message,
      code: this.code,
      stack: this.stack,
      cause: JSON.stringify(this.cause),
      metadata: this.metadata,
    };
  }
}

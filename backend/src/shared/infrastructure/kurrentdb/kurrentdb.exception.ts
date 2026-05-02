import { ExceptionBase } from 'src/shared/common/exceptions';

export class StreamNotFoundException extends ExceptionBase {
  public readonly code = 'KURRENT_STREAM_NOT_FOUND';
  constructor(cause?: Error, metadata?: unknown) {
    super('Kurrent stream not found', cause, metadata);
    this.name = 'StreamNotFoundException';
  }
}

export class WrongExpectedVersionException extends ExceptionBase {
  public readonly code = 'KURRENT_WRONG_EXPECTED_VERSION';
  constructor(cause?: Error, metadata?: unknown) {
    super(
      'Kurrent wrong expected version (concurrency conflict)',
      cause,
      metadata,
    );
    this.name = 'WrongExpectedVersionException';
  }
}

export class NoEventInResolvedEventFoundException extends ExceptionBase {
  public readonly code = 'KURRENT_NO_EVENT_FOUND';
  constructor(cause?: Error, metadata?: unknown) {
    super('No event found in resolved event', cause, metadata);
    this.name = 'NoEventInResolvedEventFoundException';
  }
}

import { ExceptionBase } from 'src/shared/common/exceptions';

type InvalidTicketStatusTransitionErrorMetadata = {
  fromStatus: string;
  toStatus: string;
};

export class TicketInvalidStatusTransitionError extends ExceptionBase {
  readonly code = 'TICKET.INVALID_STATUS_TRANSITION';

  constructor(fromStatus: string, toStatus: string, cause?: Error) {
    super(
      `Invalid ticket status transition: ${fromStatus} -> ${toStatus}`,
      cause,
      {
        fromStatus,
        toStatus,
      } satisfies InvalidTicketStatusTransitionErrorMetadata,
    );
  }
}

export class TicketStatusNotAllowedError extends ExceptionBase {
  readonly code = 'TICKET.STATUS_NOT_ALLOWED';
}

export class TicketAssigneeNotPresentError extends ExceptionBase {
  readonly code = 'TICKET.ASSIGNEE_NOT_PRESENT';
  static message = 'Ticket must have an assignee to be in progress';

  constructor(cause?: Error, metadata?: unknown) {
    super(TicketAssigneeNotPresentError.message, cause, metadata);
  }
}

export class TicketReopenLimitExceededError extends ExceptionBase {
  readonly code = 'TICKET.REOPEN_LIMIT_EXCEEDED';
  static message = 'Ticket cannot be reopened more than once';

  constructor(cause?: Error, metadata?: unknown) {
    super(TicketReopenLimitExceededError.message, cause, metadata);
  }
}

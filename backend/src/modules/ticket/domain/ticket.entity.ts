import { randomUUID } from 'crypto';
import { Result } from 'src/lib/common/result';
import { AggregateID, AggregateRoot } from 'src/lib/ddd';
import {
  TicketAssigneeNotPresentError,
  TicketInvalidStatusTransitionError,
  TicketReopenLimitExceededError,
  TicketStatusNotAllowedError,
} from './ticket.errors';
import {
  TicketProps,
  CreateTicketProps,
  UpdateTicketDetailsProps,
} from './ticket.types';
import {
  Title,
  Description,
  Status,
  Urgency,
  Priority,
  BlockReason,
  TicketPriority,
} from './value-objects';
import {
  TicketCreatedDomainEvent,
  TicketTriagedDomainEvent,
  TicketAssignedDomainEvent,
  TicketProgressStartedDomainEvent,
  TicketBlockedDomainEvent,
  TicketCancelledDomainEvent,
  TicketResolvedDomainEvent,
  TicketDetailsUpdatedDomainEvent,
  TicketReopenedDomainEvent,
} from './events';
import {
  ArgumentNotProvidedException,
  ArgumentInvalidException,
} from 'src/lib/common/exceptions';

export class Ticket extends AggregateRoot<TicketProps> {
  static create(create: CreateTicketProps): Ticket {
    const id = randomUUID();
    const props: TicketProps = {
      ...create,
      title: Title.create(create.title),
      description: Description.create(create.description),
      urgency: Urgency.create(create.urgency),
      status: Status.open(),
      reopenCount: 0,
    };
    const ticket = new Ticket({ id, props });

    ticket.addDomainEvent(
      new TicketCreatedDomainEvent({
        aggregateId: ticket.id,
        reporterId: ticket.props.reporterId,
        title: ticket.props.title.value,
        description: ticket.props.description.value,
        urgency: ticket.props.urgency.value,
        status: ticket.props.status.value,
      }),
    );

    return ticket;
  }

  triage(
    priority: TicketPriority,
  ): Result<void, TicketInvalidStatusTransitionError> {
    const canTransition = this.validateTransition(Status.triaged(), [
      Status.open(),
      Status.reopened(),
    ]);

    if (canTransition.isFailure()) {
      return Result.failure(canTransition.unwrapError());
    }

    this.props.priority = Priority.create(priority);
    this.props.status = Status.triaged();

    this.addDomainEvent(
      new TicketTriagedDomainEvent({
        aggregateId: this.id,
        priority: this.props.priority.value,
        status: this.props.status.value,
      }),
    );

    return Result.success(undefined);
  }

  assign(assigneeId: AggregateID): Result<void, TicketStatusNotAllowedError> {
    if (!this.isStatus(Status.triaged())) {
      return Result.failure(
        new TicketStatusNotAllowedError(
          `Cannot assign agent to ticket with status ${this.props.status.value}`,
        ),
      );
    }

    if (this.props.assigneeId === assigneeId) {
      return Result.success(undefined);
    }

    this.props.assigneeId = assigneeId;

    this.addDomainEvent(
      new TicketAssignedDomainEvent({
        aggregateId: this.id,
        assigneeId,
      }),
    );

    return Result.success(undefined);
  }

  startProgress(): Result<
    void,
    TicketInvalidStatusTransitionError | TicketAssigneeNotPresentError
  > {
    const canTransition = this.validateTransition(Status.inProgress(), [
      Status.triaged(),
      Status.blocked(),
    ]);

    if (canTransition.isFailure()) {
      return Result.failure(canTransition.unwrapError());
    }

    if (!this.props.assigneeId) {
      return Result.failure(new TicketAssigneeNotPresentError());
    }

    this.props.blockReason = undefined;
    this.props.status = Status.inProgress();

    this.addDomainEvent(
      new TicketProgressStartedDomainEvent({
        aggregateId: this.id,
        status: this.props.status.value,
      }),
    );

    return Result.success(undefined);
  }

  block(reason: string): Result<void, TicketInvalidStatusTransitionError> {
    const canTransition = this.validateTransition(Status.blocked(), [
      Status.inProgress(),
    ]);

    if (canTransition.isFailure()) {
      return Result.failure(canTransition.unwrapError());
    }

    this.props.blockReason = BlockReason.create(reason);
    this.props.status = Status.blocked();

    this.addDomainEvent(
      new TicketBlockedDomainEvent({
        aggregateId: this.id,
        reason: this.props.blockReason.value,
        status: this.props.status.value,
      }),
    );

    return Result.success(undefined);
  }

  cancel(): Result<void, TicketInvalidStatusTransitionError> {
    const canTransition = this.validateTransition(Status.cancelled(), [
      Status.open(),
      Status.triaged(),
      Status.reopened(),
    ]);

    if (canTransition.isFailure()) {
      return Result.failure(canTransition.unwrapError());
    }

    this.props.status = Status.cancelled();

    this.addDomainEvent(
      new TicketCancelledDomainEvent({
        aggregateId: this.id,
        status: this.props.status.value,
      }),
    );

    return Result.success(undefined);
  }

  resolve(): Result<void, TicketInvalidStatusTransitionError> {
    const canTransition = this.validateTransition(Status.done(), [
      Status.inProgress(),
    ]);

    if (canTransition.isFailure()) {
      return Result.failure(canTransition.unwrapError());
    }

    this.props.status = Status.done();

    this.addDomainEvent(
      new TicketResolvedDomainEvent({
        aggregateId: this.id,
        status: this.props.status.value,
      }),
    );

    return Result.success(undefined);
  }

  reopen(): Result<
    void,
    TicketInvalidStatusTransitionError | TicketReopenLimitExceededError
  > {
    const canTransition = this.validateTransition(Status.reopened(), [
      Status.done(),
    ]);

    if (canTransition.isFailure()) {
      return Result.failure(canTransition.unwrapError());
    }

    if (this.props.reopenCount >= 1) {
      return Result.failure(new TicketReopenLimitExceededError());
    }

    this.props.status = Status.reopened();
    this.props.reopenCount += 1;

    this.addDomainEvent(
      new TicketReopenedDomainEvent({
        aggregateId: this.id,
        status: this.props.status.value,
        reopenCount: this.props.reopenCount,
      }),
    );

    return Result.success(undefined);
  }

  updateDetails(
    newDetails: UpdateTicketDetailsProps,
  ): Result<void, TicketStatusNotAllowedError> {
    if (!this.isStatus(Status.open())) {
      return Result.failure(
        new TicketStatusNotAllowedError(
          `Cannot change details of ticket with status ${this.props.status.value}`,
        ),
      );
    }

    const eventPayload: Partial<Record<string, unknown>> = {};

    if (newDetails.title) {
      this.props.title = Title.create(newDetails.title);
      eventPayload.title = this.props.title.value;
    }
    if (newDetails.description) {
      this.props.description = Description.create(newDetails.description);
      eventPayload.description = this.props.description.value;
    }
    if (newDetails.urgency) {
      this.props.urgency = Urgency.create(newDetails.urgency);
      eventPayload.urgency = this.props.urgency.value;
    }

    this.addDomainEvent(
      new TicketDetailsUpdatedDomainEvent({
        aggregateId: this.id,
        ...eventPayload,
      }),
    );

    return Result.success(undefined);
  }

  private isStatus(status: Status): boolean {
    return this.props.status.equals(status);
  }

  private validateTransition(
    nextStatus: Status,
    allowedCurrentStatuses: Status[],
  ): Result<void, TicketInvalidStatusTransitionError> {
    const isAllowed = this.props.status.isOneOf(allowedCurrentStatuses);

    if (!isAllowed) {
      return Result.failure(
        new TicketInvalidStatusTransitionError(
          this.props.status.value,
          nextStatus.value,
        ),
      );
    }

    return Result.success(undefined);
  }

  public validate(): void {
    if (this.props.reopenCount < 0 || this.props.reopenCount > 1) {
      throw new ArgumentNotProvidedException(
        'Ticket reopen count must be between 0 and 1',
      );
    }

    if (!this.props.reporterId) {
      throw new ArgumentNotProvidedException('Ticket must have a reporterId');
    }

    if (!this.props.title) {
      throw new ArgumentNotProvidedException('Ticket title must be provided');
    }

    if (!this.props.description) {
      throw new ArgumentNotProvidedException(
        'Ticket description must be provided',
      );
    }

    if (!this.props.urgency) {
      throw new ArgumentNotProvidedException('Ticket urgency must be provided');
    }

    if (!this.props.status) {
      throw new ArgumentNotProvidedException('Ticket status must be provided');
    }

    if (
      this.props.status.isOneOf([
        Status.triaged(),
        Status.inProgress(),
        Status.blocked(),
        Status.done(),
        Status.reopened(),
      ]) &&
      !this.props.priority
    ) {
      throw new ArgumentNotProvidedException(
        'Ticket priority must be set for triaged or progressed tickets',
      );
    }

    if (
      this.props.status.equals(Status.inProgress()) &&
      !this.props.assigneeId
    ) {
      throw new TicketAssigneeNotPresentError();
    }

    if (this.props.status.equals(Status.blocked()) && !this.props.blockReason) {
      throw new ArgumentNotProvidedException(
        'Block reason must be provided when ticket is blocked',
      );
    }

    if (
      this.props.status.equals(Status.reopened()) &&
      this.props.reopenCount < 1
    ) {
      throw new ArgumentInvalidException(
        'Reopened ticket must have reopenCount = 1',
      );
    }

    if (this.props.assigneeId && this.props.status.equals(Status.open())) {
      throw new ArgumentInvalidException(
        'Ticket cannot have an assignee while status is OPEN',
      );
    }
  }
}

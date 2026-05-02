import { randomUUID } from 'crypto';
import { Result } from 'src/shared/common/result';
import { AggregateID, AggregateRoot } from 'src/shared/domain';
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
  Status,
  Priority,
  BlockReason,
  Description,
  Title,
  Urgency,
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
} from 'src/shared/common/exceptions';

export class Ticket extends AggregateRoot<TicketProps> {
  static create(create: CreateTicketProps): Result<Ticket, never> {
    const id = randomUUID();
    const ticket = new Ticket();

    ticket.apply(
      new TicketCreatedDomainEvent({
        aggregateId: id,
        reporterId: create.reporterId,
        title: create.title.value,
        description: create.description.value,
        urgency: create.urgency.value,
        status: Status.open().value,
        createdAt: new Date().toISOString(),
      }),
    );

    return Result.success(ticket);
  }

  triage(priority: Priority): Result<void, TicketInvalidStatusTransitionError> {
    const canTransition = this.validateTransition(Status.triaged(), [
      Status.open(),
      Status.reopened(),
    ]);

    if (canTransition.isFailure()) {
      return Result.failure(canTransition.unwrapError());
    }

    this.apply(
      new TicketTriagedDomainEvent({
        aggregateId: this.id,
        priority: priority.value,
        status: Status.triaged().value,
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

    this.apply(
      new TicketAssignedDomainEvent({
        aggregateId: this.id,
        assigneeId: assigneeId,
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

    this.apply(
      new TicketProgressStartedDomainEvent({
        aggregateId: this.id,
        status: Status.inProgress().value,
      }),
    );

    return Result.success(undefined);
  }

  block(
    blockReason: BlockReason,
  ): Result<void, TicketInvalidStatusTransitionError> {
    const canTransition = this.validateTransition(Status.blocked(), [
      Status.inProgress(),
    ]);

    if (canTransition.isFailure()) {
      return Result.failure(canTransition.unwrapError());
    }

    this.apply(
      new TicketBlockedDomainEvent({
        aggregateId: this.id,
        blockReason: blockReason.value,
        status: Status.blocked().value,
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

    this.apply(
      new TicketCancelledDomainEvent({
        aggregateId: this.id,
        status: Status.cancelled().value,
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

    this.apply(
      new TicketResolvedDomainEvent({
        aggregateId: this.id,
        status: Status.done().value,
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

    this.apply(
      new TicketReopenedDomainEvent({
        aggregateId: this.id,
        status: Status.reopened().value,
        reopenCount: this.props.reopenCount + 1,
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
      eventPayload.title = newDetails.title.value;
    }
    if (newDetails.description) {
      eventPayload.description = newDetails.description.value;
    }
    if (newDetails.urgency) {
      eventPayload.urgency = newDetails.urgency.value;
    }

    this.apply(
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

  private onTicketCreated(event: TicketCreatedDomainEvent): void {
    this._id = event.aggregateId;
    this._createdAt = new Date(event.createdAt);
    const props: TicketProps = {
      reporterId: event.reporterId,
      title: Title.create(event.title),
      description: Description.create(event.description),
      urgency: Urgency.create(event.urgency),
      status: Status.create(event.status),
      reopenCount: 0,
    };
    this.validateProps(props);
    this.props = props;
    this.validate();
  }

  private onTicketTriaged(event: TicketTriagedDomainEvent): void {
    this.props.priority = Priority.create(event.priority);
    this.props.status = Status.create(event.status);
    this.validate();
  }

  private onTicketAssigned(event: TicketAssignedDomainEvent): void {
    this.props.assigneeId = event.assigneeId;
    this.validate();
  }

  private onTicketProgressStarted(
    event: TicketProgressStartedDomainEvent,
  ): void {
    this.props.status = Status.create(event.status);
    this.validate();
  }

  private onTicketBlocked(event: TicketBlockedDomainEvent): void {
    this.props.blockReason = BlockReason.create(event.blockReason);
    this.props.status = Status.create(event.status);
    this.validate();
  }

  private onTicketCancelled(event: TicketCancelledDomainEvent): void {
    this.props.status = Status.create(event.status);
    this.validate();
  }

  private onTicketResolved(event: TicketResolvedDomainEvent): void {
    this.props.status = Status.create(event.status);
    this.validate();
  }

  private onTicketReopened(event: TicketReopenedDomainEvent): void {
    this.props.status = Status.create(event.status);
    this.props.reopenCount = event.reopenCount;
    this.validate();
  }

  private onTicketDetailsUpdated(event: TicketDetailsUpdatedDomainEvent): void {
    if (event.title) {
      this.props.title = Title.create(event.title);
    }
    if (event.description) {
      this.props.description = Description.create(event.description);
    }
    if (event.urgency) {
      this.props.urgency = Urgency.create(event.urgency);
    }
    this.validate();
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

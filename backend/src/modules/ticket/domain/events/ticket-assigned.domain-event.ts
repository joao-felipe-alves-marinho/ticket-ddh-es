import { AggregateID, DomainEvent, DomainEventProps } from 'src/shared/domain';

export class TicketAssignedDomainEvent extends DomainEvent {
  readonly assigneeId: AggregateID;

  constructor(props: DomainEventProps<TicketAssignedDomainEvent>) {
    super(props);
    this.assigneeId = props.assigneeId;
  }
}

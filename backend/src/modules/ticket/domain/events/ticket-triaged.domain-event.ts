import { DomainEvent, DomainEventProps } from 'src/shared/domain';
import { TicketPriority, TicketStatus } from '../value-objects';

export class TicketTriagedDomainEvent extends DomainEvent {
  readonly priority: TicketPriority;
  readonly status: TicketStatus;

  constructor(props: DomainEventProps<TicketTriagedDomainEvent>) {
    super(props);
    this.priority = props.priority;
    this.status = props.status;
  }
}

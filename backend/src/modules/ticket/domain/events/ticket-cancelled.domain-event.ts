import { DomainEvent, DomainEventProps } from 'src/lib/ddd';
import { TicketStatus } from '../value-objects';

export class TicketCancelledDomainEvent extends DomainEvent {
  readonly status: TicketStatus;

  constructor(props: DomainEventProps<TicketCancelledDomainEvent>) {
    super(props);
    this.status = props.status;
  }
}

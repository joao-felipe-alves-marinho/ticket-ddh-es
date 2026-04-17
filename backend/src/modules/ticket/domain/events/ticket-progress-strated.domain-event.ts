import { DomainEvent, DomainEventProps } from 'src/lib/ddd';
import { TicketStatus } from '../value-objects';

export class TicketProgressStartedDomainEvent extends DomainEvent {
  readonly status: TicketStatus;

  constructor(props: DomainEventProps<TicketProgressStartedDomainEvent>) {
    super(props);
    this.status = props.status;
  }
}

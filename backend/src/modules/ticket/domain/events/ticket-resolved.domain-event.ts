import { DomainEvent, DomainEventProps } from 'src/lib/ddd';
import { TicketStatus } from '../value-objects';

export class TicketResolvedDomainEvent extends DomainEvent {
  readonly status: TicketStatus;

  constructor(props: DomainEventProps<TicketResolvedDomainEvent>) {
    super(props);
    this.status = props.status;
  }
}

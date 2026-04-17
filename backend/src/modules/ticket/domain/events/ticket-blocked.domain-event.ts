import { DomainEvent, DomainEventProps } from 'src/lib/ddd';
import { TicketStatus } from '../value-objects';

export class TicketBlockedDomainEvent extends DomainEvent {
  readonly reason: string;
  readonly status: TicketStatus;

  constructor(props: DomainEventProps<TicketBlockedDomainEvent>) {
    super(props);
    this.reason = props.reason;
    this.status = props.status;
  }
}

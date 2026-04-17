import { DomainEvent, DomainEventProps } from 'src/lib/ddd';
import { TicketStatus } from '../value-objects';

export class TicketReopenedDomainEvent extends DomainEvent {
  readonly status: TicketStatus;
  readonly reopenCount: number;

  constructor(props: DomainEventProps<TicketReopenedDomainEvent>) {
    super(props);
    this.status = props.status;
    this.reopenCount = props.reopenCount;
  }
}

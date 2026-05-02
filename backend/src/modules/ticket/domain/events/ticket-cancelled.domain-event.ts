import { DomainEvent, DomainEventProps } from 'src/shared/domain';
import { TicketStatus } from '../value-objects';

export class TicketCancelledDomainEvent extends DomainEvent {
  readonly status: TicketStatus;

  constructor(props: DomainEventProps<TicketCancelledDomainEvent>) {
    super(props);
    this.status = props.status;
  }
}

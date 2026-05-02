import { DomainEvent, DomainEventProps } from 'src/shared/domain';
import { TicketStatus } from '../value-objects';

export class TicketBlockedDomainEvent extends DomainEvent {
  readonly blockReason: string;
  readonly status: TicketStatus;

  constructor(props: DomainEventProps<TicketBlockedDomainEvent>) {
    super(props);
    this.blockReason = props.blockReason;
    this.status = props.status;
  }
}

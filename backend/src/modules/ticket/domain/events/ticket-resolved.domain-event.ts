import { DomainEvent, DomainEventProps } from 'src/shared/domain';
import { TicketStatus } from '../value-objects';

export class TicketResolvedDomainEvent extends DomainEvent {
  readonly status: TicketStatus;

  constructor(props: DomainEventProps<TicketResolvedDomainEvent>) {
    super(props);
    this.status = props.status;
  }
}

import { DomainEvent, DomainEventProps } from 'src/shared/domain';
import { TicketStatus } from '../value-objects';

export class TicketProgressStartedDomainEvent extends DomainEvent {
  readonly status: TicketStatus;

  constructor(props: DomainEventProps<TicketProgressStartedDomainEvent>) {
    super(props);
    this.status = props.status;
  }
}

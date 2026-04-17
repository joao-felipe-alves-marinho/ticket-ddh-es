import { AggregateID, DomainEvent, DomainEventProps } from 'src/lib/ddd';
import { TicketStatus, TicketUrgency } from '../value-objects';

export class TicketCreatedDomainEvent extends DomainEvent {
  readonly reporterId: AggregateID;
  readonly title: string;
  readonly description: string;
  readonly urgency: TicketUrgency;
  readonly status: TicketStatus;

  constructor(props: DomainEventProps<TicketCreatedDomainEvent>) {
    super(props);
    this.reporterId = props.reporterId;
    this.title = props.title;
    this.description = props.description;
    this.urgency = props.urgency;
    this.status = props.status;
  }
}

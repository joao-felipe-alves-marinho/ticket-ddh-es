import { AggregateID, DomainEvent, DomainEventProps } from 'src/shared/domain';
import { TicketStatus, TicketUrgency } from '../value-objects';

export class TicketCreatedDomainEvent extends DomainEvent {
  readonly reporterId: AggregateID;
  readonly title: string;
  readonly description: string;
  readonly urgency: TicketUrgency;
  readonly status: TicketStatus;
  readonly createdAt: string;

  constructor(props: DomainEventProps<TicketCreatedDomainEvent>) {
    super(props);
    this.reporterId = props.reporterId;
    this.title = props.title;
    this.description = props.description;
    this.urgency = props.urgency;
    this.status = props.status;
    this.createdAt = props.createdAt;
  }
}

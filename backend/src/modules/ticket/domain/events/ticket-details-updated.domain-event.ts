import { DomainEvent, DomainEventProps } from 'src/lib/ddd';
import { TicketUrgency } from '../value-objects';

export class TicketDetailsUpdatedDomainEvent extends DomainEvent {
  readonly title?: string;
  readonly description?: string;
  readonly urgency?: TicketUrgency;

  constructor(props: DomainEventProps<TicketDetailsUpdatedDomainEvent>) {
    super(props);
    this.title = props.title;
    this.description = props.description;
    this.urgency = props.urgency;
  }
}

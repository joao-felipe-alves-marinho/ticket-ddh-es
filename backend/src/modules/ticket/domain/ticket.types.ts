import { AggregateID } from 'src/lib/ddd';
import {
  Title,
  Description,
  Status,
  Urgency,
  Priority,
  BlockReason,
  TicketUrgency,
} from './value-objects';

export interface CreateTicketProps {
  reporterId: AggregateID;
  title: string;
  description: string;
  urgency: TicketUrgency;
}

export type UpdateTicketDetailsProps = Partial<
  Omit<CreateTicketProps, 'reporterId'>
>;

export interface TicketProps extends Pick<CreateTicketProps, 'reporterId'> {
  title: Title;
  description: Description;
  urgency: Urgency;
  status: Status;
  priority?: Priority;
  assigneeId?: AggregateID;
  blockReason?: BlockReason;
  reopenCount: number;
}

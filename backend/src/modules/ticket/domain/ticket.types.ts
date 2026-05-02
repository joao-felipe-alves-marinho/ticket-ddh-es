import { AggregateID } from 'src/shared/domain';
import {
  Title,
  Description,
  Status,
  Urgency,
  Priority,
  BlockReason,
} from './value-objects';

export interface CreateTicketProps {
  reporterId: AggregateID;
  title: Title;
  description: Description;
  urgency: Urgency;
}

export type UpdateTicketDetailsProps = Partial<
  Omit<CreateTicketProps, 'reporterId'>
>;

export interface TicketProps extends CreateTicketProps {
  status: Status;
  priority?: Priority;
  assigneeId?: AggregateID;
  blockReason?: BlockReason;
  reopenCount: number;
}

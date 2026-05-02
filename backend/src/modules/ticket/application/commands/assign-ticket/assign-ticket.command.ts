import { ICommand } from '@nestjs/cqrs';
import { AggregateID } from 'src/shared/domain';

export class AssignTicketCommand implements ICommand {
  constructor(
    public readonly ticketId: AggregateID,
    public readonly assigneeId: AggregateID,
  ) {}
}

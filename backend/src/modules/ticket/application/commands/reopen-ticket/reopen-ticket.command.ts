import { ICommand } from '@nestjs/cqrs';
import { AggregateID } from 'src/shared/domain';

export class ReopenTicketCommand implements ICommand {
  constructor(public readonly ticketId: AggregateID) {}
}

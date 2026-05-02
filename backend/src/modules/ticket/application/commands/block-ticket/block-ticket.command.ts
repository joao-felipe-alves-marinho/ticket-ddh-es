import { ICommand } from '@nestjs/cqrs';
import { AggregateID } from 'src/shared/domain';

export class BlockTicketCommand implements ICommand {
  constructor(
    public readonly ticketId: AggregateID,
    public readonly blockReason: string,
  ) {}
}

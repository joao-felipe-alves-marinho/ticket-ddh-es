import { ICommand } from '@nestjs/cqrs';
import { AggregateID } from 'src/shared/domain';

export class UpdateTicketDetailsCommand implements ICommand {
  constructor(
    public readonly ticketId: AggregateID,
    public readonly title?: string,
    public readonly description?: string,
    public readonly urgency?: string,
  ) {}
}

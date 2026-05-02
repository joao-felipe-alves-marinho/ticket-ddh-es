import { ICommand } from '@nestjs/cqrs';
import { AggregateID } from 'src/shared/domain';
import { TicketUrgency } from 'src/modules/ticket/domain/value-objects';

export class CreateTicketCommand implements ICommand {
  constructor(
    public readonly reporterId: AggregateID,
    public readonly title: string,
    public readonly description: string,
    public readonly urgency: TicketUrgency,
  ) {}
}

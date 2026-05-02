import { ICommand } from '@nestjs/cqrs';
import { AggregateID } from 'src/shared/domain';

export class StartProgressCommand implements ICommand {
  constructor(public readonly ticketId: AggregateID) {}
}

import { ICommand } from '@nestjs/cqrs';

export class TriageTicketCommand implements ICommand {
  constructor(
    public readonly ticketId: string,
    public readonly priority: string,
  ) {}
}

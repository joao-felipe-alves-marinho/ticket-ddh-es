import { IQuery } from '@nestjs/cqrs';

export class GetTicketQuery implements IQuery {
  constructor(public readonly id: string) {}
}

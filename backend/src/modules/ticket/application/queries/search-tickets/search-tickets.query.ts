import { IQuery } from '@nestjs/cqrs';

export class SearchTicketsQuery implements IQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly limit: number = 20,
    public readonly offset: number = 0,
  ) {}
}

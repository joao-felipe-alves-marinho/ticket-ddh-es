import { IQuery } from '@nestjs/cqrs';

export interface GetAllTicketsFilters {
  status?: string;
  reporterId?: string;
  assigneeId?: string;
  limit?: number;
  offset?: number;
}

export class GetAllTicketsQuery implements IQuery {
  constructor(public readonly filters?: GetAllTicketsFilters) {}
}

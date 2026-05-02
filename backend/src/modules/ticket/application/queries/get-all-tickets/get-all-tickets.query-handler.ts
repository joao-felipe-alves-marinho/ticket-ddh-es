import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllTicketsQuery } from './get-all-tickets.query';
import {
  TicketReadModel,
  TicketReadRepositoryPort,
} from 'src/modules/ticket/domain/ports/ticket-read.repository.port';
import { Result } from 'src/shared/common/result';
import {
  ExceptionBase,
  InternalServerErrorException,
} from 'src/shared/common/exceptions';
import { Inject } from '@nestjs/common';
import { TicketReadRepositoryToken } from 'src/modules/ticket/ticket.constants';

@QueryHandler(GetAllTicketsQuery)
export class GetAllTicketsQueryHandler implements IQueryHandler<GetAllTicketsQuery> {
  constructor(
    @Inject(TicketReadRepositoryToken)
    private readonly ticketReadRepository: TicketReadRepositoryPort,
  ) {}

  async execute(
    query: GetAllTicketsQuery,
  ): Promise<Result<TicketReadModel[], ExceptionBase>> {
    try {
      const result = await this.ticketReadRepository.findAll();

      if (result.isFailure()) {
        return Result.failure(result.unwrapError());
      }

      let tickets = result.unwrap();

      // Apply filters if provided
      if (query.filters) {
        if (query.filters.status) {
          tickets = tickets.filter((t) => t.status === query.filters!.status);
        }
        if (query.filters.reporterId) {
          tickets = tickets.filter(
            (t) => t.reporterId === query.filters!.reporterId,
          );
        }
        if (query.filters.assigneeId) {
          tickets = tickets.filter(
            (t) => t.assigneeId === query.filters!.assigneeId,
          );
        }
      }

      // Apply pagination
      const limit = query.filters?.limit || 50;
      const offset = query.filters?.offset || 0;
      const paginated = tickets.slice(offset, offset + limit);

      return Result.success(paginated);
    } catch (error) {
      return Result.failure(
        new InternalServerErrorException((error as Error).message),
      );
    }
  }
}

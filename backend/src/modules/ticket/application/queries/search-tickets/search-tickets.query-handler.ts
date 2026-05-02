import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchTicketsQuery } from './search-tickets.query';
import {
  TicketReadModel,
  TicketReadRepositoryPort,
} from 'src/modules/ticket/domain/ports/ticket-read.repository.port';
import { Result } from 'src/shared/common/result';
import {
  ExceptionBase,
  InternalServerErrorException,
} from 'src/shared/common/exceptions';
import { TicketReadRepositoryToken } from 'src/modules/ticket/ticket.constants';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';

@QueryHandler(SearchTicketsQuery)
export class SearchTicketsQueryHandler implements IQueryHandler<SearchTicketsQuery> {
  constructor(
    @Inject(TicketReadRepositoryToken)
    private readonly ticketReadRepository: TicketReadRepositoryPort,
  ) {}

  async execute(
    query: SearchTicketsQuery,
  ): Promise<Result<TicketReadModel[], ExceptionBase>> {
    try {
      const result = await this.ticketReadRepository.findAll();

      if (result.isFailure()) {
        return Result.failure(result.unwrapError());
      }

      const allTickets = result.unwrap();
      const filtered = allTickets.filter(
        (t) =>
          t.title.toLowerCase().includes(query.searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(query.searchTerm.toLowerCase()),
      );

      return Result.success(
        filtered.slice(query.offset, query.offset + query.limit),
      );
    } catch (error) {
      return Result.failure(
        new InternalServerErrorException((error as Error).message),
      );
    }
  }
}

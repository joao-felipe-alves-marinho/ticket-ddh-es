import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTicketQuery } from './get-ticket.query';
import {
  TicketReadModel,
  TicketReadRepositoryPort,
} from 'src/modules/ticket/domain/ports/ticket-read.repository.port';
import { Result } from 'src/shared/common/result';
import { NotFoundException } from 'src/shared/common/exceptions';
import { TicketReadRepositoryToken } from 'src/modules/ticket/ticket.constants';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';

@QueryHandler(GetTicketQuery)
export class GetTicketQueryHandler implements IQueryHandler<GetTicketQuery> {
  constructor(
    @Inject(TicketReadRepositoryToken)
    private readonly ticketReadRepository: TicketReadRepositoryPort,
  ) {}

  async execute(
    query: GetTicketQuery,
  ): Promise<Result<TicketReadModel, NotFoundException>> {
    const ticket = await this.ticketReadRepository.findById(query.id);

    if (ticket.isFailure()) {
      return Result.failure(ticket.unwrapError());
    }

    return Result.success(ticket).unwrap();
  }
}

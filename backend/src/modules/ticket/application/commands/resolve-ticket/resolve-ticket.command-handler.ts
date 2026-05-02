import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Result } from 'src/shared/common/result';
import { ExceptionBase, NotFoundException } from 'src/shared/common/exceptions';
import { TicketWriteRepositoryPort } from 'src/modules/ticket/domain/ports/ticket-write.repository.port';
import { TicketWriteRepositoryToken } from 'src/modules/ticket/ticket.constants';
import { ResolveTicketCommand } from './resolve-ticket.command';

@CommandHandler(ResolveTicketCommand)
export class ResolveTicketCommandHandler implements ICommandHandler<ResolveTicketCommand> {
  constructor(
    @Inject(TicketWriteRepositoryToken)
    private readonly ticketRepository: TicketWriteRepositoryPort,
  ) {}

  async execute(
    command: ResolveTicketCommand,
  ): Promise<Result<void, ExceptionBase>> {
    const findResult = await this.ticketRepository.findById(command.ticketId);

    if (findResult.isFailure()) {
      return Result.failure(findResult.unwrapError());
    }

    const ticket = findResult.unwrap();

    if (!ticket) {
      return Result.failure(
        new NotFoundException(`Ticket with ID ${command.ticketId} not found`),
      );
    }

    const result = ticket.resolve();

    if (result.isFailure()) {
      return result;
    }

    return this.ticketRepository.save(ticket);
  }
}

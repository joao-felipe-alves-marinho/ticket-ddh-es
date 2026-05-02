import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Result } from 'src/shared/common/result';
import { ExceptionBase, NotFoundException } from 'src/shared/common/exceptions';
import { TicketWriteRepositoryPort } from 'src/modules/ticket/domain/ports/ticket-write.repository.port';
import { TicketWriteRepositoryToken } from 'src/modules/ticket/ticket.constants';
import { StartProgressCommand } from './start-progress.command';

@CommandHandler(StartProgressCommand)
export class StartProgressCommandHandler implements ICommandHandler<StartProgressCommand> {
  constructor(
    @Inject(TicketWriteRepositoryToken)
    private readonly ticketRepository: TicketWriteRepositoryPort,
  ) {}

  async execute(
    command: StartProgressCommand,
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

    const result = ticket.startProgress();

    if (result.isFailure()) {
      return result;
    }

    return this.ticketRepository.save(ticket);
  }
}

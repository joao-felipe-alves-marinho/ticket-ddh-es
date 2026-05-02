import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TriageTicketCommand } from './triage-ticket.command';
import { TicketWriteRepositoryPort } from 'src/modules/ticket/domain/ports/ticket-write.repository.port';
import { TicketWriteRepositoryToken } from 'src/modules/ticket/ticket.constants';
import { Logger } from '@nestjs/common/services/logger.service';
import { Result } from 'src/shared/common/result';
import { ExceptionBase, NotFoundException } from 'src/shared/common/exceptions';
import { Priority } from 'src/modules/ticket/domain/value-objects';

@CommandHandler(TriageTicketCommand)
export class TriageTicketCommandHandler implements ICommandHandler<TriageTicketCommand> {
  private readonly logger = new Logger(TriageTicketCommandHandler.name);

  constructor(
    @Inject(TicketWriteRepositoryToken)
    private readonly ticketRepository: TicketWriteRepositoryPort,
  ) {}

  async execute(
    command: TriageTicketCommand,
  ): Promise<Result<void, ExceptionBase>> {
    this.logger.log(
      `Triage ticket with ID ${command.ticketId} and priority ${command.priority}`,
    );

    const ticketResult = await this.ticketRepository.findById(command.ticketId);

    if (ticketResult.isFailure()) {
      this.logger.error(
        `Failed to find ticket with ID ${command.ticketId}`,
        ticketResult.unwrapError(),
      );
      return Result.failure(ticketResult.unwrapError());
    }

    const ticket = ticketResult.unwrap();

    if (!ticket) {
      this.logger.warn(`Ticket with ID ${command.ticketId} not found`);
      return Result.failure(
        new NotFoundException(`Ticket with ID ${command.ticketId} not found`),
      );
    }

    const priority = Priority.create(command.priority);

    ticket.triage(priority);
    const saveResult = await this.ticketRepository.save(ticket);

    if (saveResult.isFailure()) {
      this.logger.error(
        `Failed to save triaged ticket with ID ${command.ticketId}`,
        saveResult.unwrapError(),
      );
      return Result.failure(saveResult.unwrapError());
    }

    this.logger.log(
      `Ticket with ID ${command.ticketId} triaged successfully with priority ${command.priority}`,
    );
    return Result.success(undefined);
  }
}

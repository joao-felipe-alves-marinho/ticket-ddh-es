import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from 'src/shared/common/result';
import { AggregateID } from 'src/shared/domain';
import { Description, Title, Urgency } from '../../../domain/value-objects';
import { Ticket } from '../../../domain/ticket.entity';
import { TicketWriteRepositoryToken } from '../../../ticket.constants';
import {
  ExceptionBase,
  InternalServerErrorException,
} from 'src/shared/common/exceptions';
import { CreateTicketCommand } from './create-ticket.command';
import { TicketWriteRepositoryPort } from 'src/modules/ticket/domain/ports/ticket-write.repository.port';

@CommandHandler(CreateTicketCommand)
export class CreateTicketCommandHandler implements ICommandHandler<CreateTicketCommand> {
  private readonly logger = new Logger(CreateTicketCommandHandler.name);

  constructor(
    @Inject(TicketWriteRepositoryToken)
    private readonly ticketRepository: TicketWriteRepositoryPort,
  ) {}

  async execute(
    command: CreateTicketCommand,
  ): Promise<Result<AggregateID, ExceptionBase>> {
    try {
      this.logger.log(`Creating ticket for reporter ${command.reporterId}`);

      const title = Title.create(command.title);
      const description = Description.create(command.description);
      const urgency = Urgency.create(command.urgency);

      const newTicket = Ticket.create({
        reporterId: command.reporterId,
        title: title,
        description: description,
        urgency: urgency,
      }).unwrap();

      this.logger.log(`Saving new ticket aggregate ${newTicket.id}`);

      const saveResult = await this.ticketRepository.save(newTicket);

      if (saveResult.isFailure()) {
        this.logger.error(
          `Failed to save ticket aggregate ${newTicket.id}`,
          saveResult.unwrapError(),
        );
        return Result.failure(saveResult.unwrapError());
      }

      this.logger.log(`Ticket created successfully: ${newTicket.id}`);

      return Result.success(newTicket.id);
    } catch (error) {
      if (error instanceof ExceptionBase) {
        this.logger.error(
          `Create ticket command failed for reporter ${command.reporterId}`,
          error,
        );
        return Result.failure(error);
      }

      this.logger.error(
        `Unexpected error while creating ticket for reporter ${command.reporterId}`,
        error instanceof Error ? error.stack : String(error),
      );

      return Result.failure(
        new InternalServerErrorException((error as Error)?.message),
      );
    }
  }
}

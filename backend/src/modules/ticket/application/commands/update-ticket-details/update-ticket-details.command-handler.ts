import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Result } from 'src/shared/common/result';
import { ExceptionBase, NotFoundException } from 'src/shared/common/exceptions';
import { TicketWriteRepositoryPort } from 'src/modules/ticket/domain/ports/ticket-write.repository.port';
import { TicketWriteRepositoryToken } from 'src/modules/ticket/ticket.constants';
import {
  Title,
  Description,
  Urgency,
} from 'src/modules/ticket/domain/value-objects';
import { UpdateTicketDetailsCommand } from './update-ticket-details.command';

@CommandHandler(UpdateTicketDetailsCommand)
export class UpdateTicketDetailsCommandHandler implements ICommandHandler<UpdateTicketDetailsCommand> {
  constructor(
    @Inject(TicketWriteRepositoryToken)
    private readonly ticketRepository: TicketWriteRepositoryPort,
  ) {}

  async execute(
    command: UpdateTicketDetailsCommand,
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

    const title = command.title ? Title.create(command.title) : undefined;
    const description = command.description
      ? Description.create(command.description)
      : undefined;
    const urgency = command.urgency
      ? Urgency.create(command.urgency)
      : undefined;

    const result = ticket.updateDetails({
      title,
      description,
      urgency,
    });

    if (result.isFailure()) {
      return result;
    }

    return this.ticketRepository.save(ticket);
  }
}

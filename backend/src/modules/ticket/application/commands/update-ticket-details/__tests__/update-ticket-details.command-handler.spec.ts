import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Result } from 'src/shared/common/result';
import { UpdateTicketDetailsCommandHandler } from '../update-ticket-details.command-handler';
import { UpdateTicketDetailsCommand } from '../update-ticket-details.command';
import { TicketWriteRepositoryPort } from 'src/modules/ticket/domain/ports/ticket-write.repository.port';
import { TicketWriteRepositoryToken } from 'src/modules/ticket/ticket.constants';
import { Ticket } from 'src/modules/ticket/domain/ticket.entity';
import {
  Description,
  Priority,
  Title,
  Urgency,
} from 'src/modules/ticket/domain/value-objects';

const mockTicketWriteRepository =
  (): jest.Mocked<TicketWriteRepositoryPort> => ({
    save: jest.fn().mockResolvedValue(Result.success(undefined)),
    findById: jest.fn(),
  });

const TICKET_ID = 'ticket-1';
const NEW_TITLE = 'Updated title for login bug';
const NEW_DESCRIPTION = 'Updated description with better reproduction steps.';
const NEW_URGENCY = 'medium';

const makeOpenTicket = (): Ticket =>
  Ticket.create({
    reporterId: 'reporter-1',
    title: Title.create('Fix login issue'),
    description: Description.create(
      'Users cannot login when they enter valid credentials.',
    ),
    urgency: Urgency.high(),
  }).unwrap();

describe('UpdateTicketDetailsCommandHandler', () => {
  let handler: UpdateTicketDetailsCommandHandler;
  let writeRepo: jest.Mocked<TicketWriteRepositoryPort>;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        UpdateTicketDetailsCommandHandler,
        {
          provide: TicketWriteRepositoryToken,
          useValue: mockTicketWriteRepository(),
        },
      ],
    }).compile();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    handler = testingModule.get(UpdateTicketDetailsCommandHandler);
    writeRepo = testingModule.get(TicketWriteRepositoryToken);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.clearAllMocks();
  });

  it('should update details and save when ticket is open', async () => {
    const ticket = makeOpenTicket();
    writeRepo.findById.mockResolvedValueOnce(Result.success(ticket));

    const result = await handler.execute(
      new UpdateTicketDetailsCommand(
        TICKET_ID,
        NEW_TITLE,
        NEW_DESCRIPTION,
        NEW_URGENCY,
      ),
    );

    expect(result.isSuccess()).toBe(true);
    expect(writeRepo.save.mock.calls).toHaveLength(1);

    const props = ticket.getProps();
    expect(props.title.value).toBe(NEW_TITLE);
    expect(props.description.value).toBe(NEW_DESCRIPTION);
    expect(props.urgency.value).toBe(NEW_URGENCY);
  });

  it('should return failure when findById fails', async () => {
    const error = new Error('db failed');
    writeRepo.findById.mockResolvedValueOnce(Result.failure(error as any));

    const result = await handler.execute(
      new UpdateTicketDetailsCommand(
        TICKET_ID,
        NEW_TITLE,
        NEW_DESCRIPTION,
        NEW_URGENCY,
      ),
    );

    expect(result.isFailure()).toBe(true);
    expect(result.unwrapError()).toBe(error);
    expect(writeRepo.save.mock.calls).toHaveLength(0);
  });

  it('should return not found when ticket does not exist', async () => {
    writeRepo.findById.mockResolvedValueOnce(Result.success(null));

    const result = await handler.execute(
      new UpdateTicketDetailsCommand(
        TICKET_ID,
        NEW_TITLE,
        NEW_DESCRIPTION,
        NEW_URGENCY,
      ),
    );

    expect(result.isFailure()).toBe(true);
    expect(result.unwrapError().message).toBe(
      `Ticket with ID ${TICKET_ID} not found`,
    );
    expect(writeRepo.save.mock.calls).toHaveLength(0);
  });

  it('should return domain failure when ticket is not open', async () => {
    const ticket = makeOpenTicket();
    ticket.triage(Priority.high()).unwrap();

    writeRepo.findById.mockResolvedValueOnce(Result.success(ticket));

    const result = await handler.execute(
      new UpdateTicketDetailsCommand(
        TICKET_ID,
        NEW_TITLE,
        NEW_DESCRIPTION,
        NEW_URGENCY,
      ),
    );

    expect(result.isFailure()).toBe(true);
    expect(result.unwrapError().message).toContain(
      'Cannot change details of ticket with status',
    );
    expect(writeRepo.save.mock.calls).toHaveLength(0);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Result } from 'src/shared/common/result';
import { CancelTicketCommandHandler } from '../cancel-ticket.command-handler';
import { CancelTicketCommand } from '../cancel-ticket.command';
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
const ASSIGNEE_ID = 'assignee-1';

const makeOpenTicket = (): Ticket =>
  Ticket.create({
    reporterId: 'reporter-1',
    title: Title.create('Fix login issue'),
    description: Description.create(
      'Users cannot login when they enter valid credentials.',
    ),
    urgency: Urgency.high(),
  }).unwrap();

describe('CancelTicketCommandHandler', () => {
  let handler: CancelTicketCommandHandler;
  let writeRepo: jest.Mocked<TicketWriteRepositoryPort>;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        CancelTicketCommandHandler,
        {
          provide: TicketWriteRepositoryToken,
          useValue: mockTicketWriteRepository(),
        },
      ],
    }).compile();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    handler = testingModule.get(CancelTicketCommandHandler);
    writeRepo = testingModule.get(TicketWriteRepositoryToken);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.clearAllMocks();
  });

  it('should cancel and save when ticket is open', async () => {
    const ticket = makeOpenTicket();
    writeRepo.findById.mockResolvedValueOnce(Result.success(ticket));

    const result = await handler.execute(new CancelTicketCommand(TICKET_ID));

    expect(result.isSuccess()).toBe(true);
    expect(writeRepo.save.mock.calls).toHaveLength(1);
    expect(ticket.getProps().status.value).toBe('cancelled');
  });

  it('should return failure when findById fails', async () => {
    const error = new Error('db failed');
    writeRepo.findById.mockResolvedValueOnce(Result.failure(error as any));

    const result = await handler.execute(new CancelTicketCommand(TICKET_ID));

    expect(result.isFailure()).toBe(true);
    expect(result.unwrapError()).toBe(error);
    expect(writeRepo.save.mock.calls).toHaveLength(0);
  });

  it('should return not found when ticket does not exist', async () => {
    writeRepo.findById.mockResolvedValueOnce(Result.success(null));

    const result = await handler.execute(new CancelTicketCommand(TICKET_ID));

    expect(result.isFailure()).toBe(true);
    expect(result.unwrapError().message).toBe(
      `Ticket with ID ${TICKET_ID} not found`,
    );
    expect(writeRepo.save.mock.calls).toHaveLength(0);
  });

  it('should return domain failure when status transition is invalid', async () => {
    const ticket = makeOpenTicket();
    ticket.triage(Priority.high()).unwrap();
    ticket.assign(ASSIGNEE_ID).unwrap();
    ticket.startProgress().unwrap();
    ticket.resolve().unwrap();

    writeRepo.findById.mockResolvedValueOnce(Result.success(ticket));

    const result = await handler.execute(new CancelTicketCommand(TICKET_ID));

    expect(result.isFailure()).toBe(true);
    expect(result.unwrapError().message).toContain(
      'Invalid ticket status transition',
    );
    expect(writeRepo.save.mock.calls).toHaveLength(0);
  });
});

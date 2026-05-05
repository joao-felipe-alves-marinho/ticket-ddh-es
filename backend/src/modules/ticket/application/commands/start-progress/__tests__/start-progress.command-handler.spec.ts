import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Result } from 'src/shared/common/result';
import { StartProgressCommandHandler } from '../start-progress.command-handler';
import { StartProgressCommand } from '../start-progress.command';
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

describe('StartProgressCommandHandler', () => {
  let handler: StartProgressCommandHandler;
  let writeRepo: jest.Mocked<TicketWriteRepositoryPort>;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        StartProgressCommandHandler,
        {
          provide: TicketWriteRepositoryToken,
          useValue: mockTicketWriteRepository(),
        },
      ],
    }).compile();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    handler = testingModule.get(StartProgressCommandHandler);
    writeRepo = testingModule.get(TicketWriteRepositoryToken);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.clearAllMocks();
  });

  it('should start progress and save when ticket is triaged and assigned', async () => {
    const ticket = makeOpenTicket();
    ticket.triage(Priority.high()).unwrap();
    ticket.assign(ASSIGNEE_ID).unwrap();

    writeRepo.findById.mockResolvedValueOnce(Result.success(ticket));

    const result = await handler.execute(new StartProgressCommand(TICKET_ID));

    expect(result.isSuccess()).toBe(true);
    expect(writeRepo.save.mock.calls).toHaveLength(1);
    expect(ticket.getProps().status.value).toBe('in_progress');
  });

  it('should return failure when findById fails', async () => {
    const error = new Error('db failed');
    writeRepo.findById.mockResolvedValueOnce(Result.failure(error as any));

    const result = await handler.execute(new StartProgressCommand(TICKET_ID));

    expect(result.isFailure()).toBe(true);
    expect(result.unwrapError()).toBe(error);
    expect(writeRepo.save.mock.calls).toHaveLength(0);
  });

  it('should return not found when ticket does not exist', async () => {
    writeRepo.findById.mockResolvedValueOnce(Result.success(null));

    const result = await handler.execute(new StartProgressCommand(TICKET_ID));

    expect(result.isFailure()).toBe(true);
    expect(result.unwrapError().message).toBe(
      `Ticket with ID ${TICKET_ID} not found`,
    );
    expect(writeRepo.save.mock.calls).toHaveLength(0);
  });

  it('should return domain failure when ticket has no assignee', async () => {
    const ticket = makeOpenTicket();
    ticket.triage(Priority.high()).unwrap();

    writeRepo.findById.mockResolvedValueOnce(Result.success(ticket));

    const result = await handler.execute(new StartProgressCommand(TICKET_ID));

    expect(result.isFailure()).toBe(true);
    expect(result.unwrapError().message).toBe(
      'Ticket must have an assignee to be in progress',
    );
    expect(writeRepo.save.mock.calls).toHaveLength(0);
  });
});

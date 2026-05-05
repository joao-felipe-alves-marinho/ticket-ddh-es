import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Result } from 'src/shared/common/result';
import { CreateTicketCommandHandler } from '../create-ticket.command-handler';
import { CreateTicketCommand } from '../create-ticket.command';
import { TicketWriteRepositoryPort } from 'src/modules/ticket/domain/ports/ticket-write.repository.port';
import { Ticket } from 'src/modules/ticket/domain/ticket.entity';
import { TicketWriteRepositoryToken } from 'src/modules/ticket/ticket.constants';
import { DomainEvent } from 'src/shared/domain/domain-event.base';
import {
  ALLOWED_URGENCIES,
  TicketUrgency,
} from 'src/modules/ticket/domain/value-objects';

// ── Test doubles ──────────────────────────────────────────────────────────────

/**
 * Factory for mocking TicketWriteRepositoryPort.
 * jest.Mocked gives full type safety on every mock method.
 */
const mockTicketWriteRepository =
  (): jest.Mocked<TicketWriteRepositoryPort> => ({
    save: jest.fn().mockResolvedValue(Result.success(undefined)),
    findById: jest.fn(),
  });

// ── Fixtures ──────────────────────────────────────────────────────────────────

const REPORTER_ID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_TITLE = 'App crashes on login screen';
const VALID_DESCRIPTION =
  'Steps to reproduce: open the app and click login button.';
const VALID_URGENCY = 'high';

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('CreateTicketCommandHandler', () => {
  let handler: CreateTicketCommandHandler;
  let writeRepo: jest.Mocked<TicketWriteRepositoryPort>;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        CreateTicketCommandHandler,
        {
          provide: TicketWriteRepositoryToken,
          useValue: mockTicketWriteRepository(),
        },
      ],
    }).compile();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    handler = testingModule.get(CreateTicketCommandHandler);
    writeRepo = testingModule.get(TicketWriteRepositoryToken);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.clearAllMocks();
  });

  // ── Happy path ───────────────────────────────────────────────────────────────

  describe('given valid command data', () => {
    let command: CreateTicketCommand;

    beforeEach(() => {
      command = new CreateTicketCommand(
        REPORTER_ID,
        VALID_TITLE,
        VALID_DESCRIPTION,
        VALID_URGENCY,
      );
    });

    it('should call writeRepo.save once', async () => {
      await handler.execute(command);

      expect(writeRepo.save.mock.calls).toHaveLength(1);
    });

    it('should pass a TicketAggregate instance to writeRepo.save', async () => {
      await handler.execute(command);

      const [savedTicket] = writeRepo.save.mock.calls[0];
      expect(savedTicket).toBeInstanceOf(Ticket);
    });

    it('should return a Result with the created ticket ID', async () => {
      const result = await handler.execute(command);

      expect(result.isSuccess()).toBe(true);
      const ticketId = result.unwrap();
      expect(typeof ticketId).toBe('string');
      expect(ticketId.length).toBeGreaterThan(0);
    });

    it('should create the aggregate with the correct title', async () => {
      await handler.execute(command);

      const [savedTicket] = writeRepo.save.mock.calls[0];
      expect(savedTicket.getProps().title.value).toBe(VALID_TITLE);
    });

    it('should create the aggregate with the correct reportedById', async () => {
      await handler.execute(command);

      const [savedTicket] = writeRepo.save.mock.calls[0];
      expect(savedTicket.getProps().reporterId).toBe(REPORTER_ID);
    });

    it('should create the aggregate with the correct description', async () => {
      await handler.execute(command);

      const [savedTicket] = writeRepo.save.mock.calls[0];
      expect(savedTicket.getProps().description.value).toBe(VALID_DESCRIPTION);
    });

    it('should create the aggregate with the correct urgency', async () => {
      await handler.execute(command);

      const [savedTicket] = writeRepo.save.mock.calls[0];
      expect(savedTicket.getProps().urgency.value).toBe(VALID_URGENCY);
    });

    it('should have status open', async () => {
      await handler.execute(command);

      const [savedTicket] = writeRepo.save.mock.calls[0];
      expect(savedTicket.getProps().status.value).toBe('open');
    });

    it('should have emitted exactly 1 TicketCreatedEvent', async () => {
      let eventsBeforeClear: DomainEvent[] = [];

      writeRepo.save.mockImplementationOnce((ticket) => {
        eventsBeforeClear = [...ticket.domainEvents];
        return Promise.resolve(Result.success(undefined));
      });

      await handler.execute(command);

      expect(eventsBeforeClear).toHaveLength(1);
      expect(eventsBeforeClear[0].constructor.name).toBe(
        'TicketCreatedDomainEvent',
      );
    });
  });

  // ── Domain validation ────────────────────────────────────────────────────────

  describe('given a title that is too short', () => {
    it('should throw a domain error before calling save', async () => {
      const command = new CreateTicketCommand(
        REPORTER_ID,
        'ab', // < MIN_LENGTH of 3
        VALID_DESCRIPTION,
        VALID_URGENCY,
      );

      const result = await handler.execute(command);

      expect(result.isFailure()).toBe(true);
      expect(result.unwrapError().message).toBe(
        'Ticket title must be between 3 and 150 characters',
      );

      expect(writeRepo.save.mock.calls).toHaveLength(0);
    });
  });

  describe('given a title that is too long', () => {
    it('should throw a domain error before calling save', async () => {
      const command = new CreateTicketCommand(
        REPORTER_ID,
        'a'.repeat(151), // > MAX_LENGTH of 150
        VALID_DESCRIPTION,
        VALID_URGENCY,
      );

      const result = await handler.execute(command);

      expect(result.isFailure()).toBe(true);
      expect(result.unwrapError().message).toBe(
        'Ticket title must be between 3 and 150 characters',
      );

      expect(writeRepo.save.mock.calls).toHaveLength(0);
    });
  });

  describe('given an empty description', () => {
    it('should throw a domain error before calling save', async () => {
      const command = new CreateTicketCommand(
        REPORTER_ID,
        VALID_TITLE,
        '', // empty
        VALID_URGENCY,
      );

      const result = await handler.execute(command);

      expect(result.isFailure()).toBe(true);
      expect(result.unwrapError().message).toBe(
        'Value object props must be provided',
      );

      expect(writeRepo.save.mock.calls).toHaveLength(0);
    });
  });

  // ── Repository failure ───────────────────────────────────────────────────────

  describe('given the repository throws', () => {
    it('should propagate the error to the caller', async () => {
      const repoError = new Error('Event store connection refused');
      writeRepo.save.mockRejectedValueOnce(repoError);

      const command = new CreateTicketCommand(
        REPORTER_ID,
        VALID_TITLE,
        VALID_DESCRIPTION,
        VALID_URGENCY,
      );

      const result = await handler.execute(command);

      expect(result.isFailure()).toBe(true);
      expect(result.unwrapError().message).toBe(
        'Event store connection refused',
      );
    });
  });

  describe('given the repository returns a failure result', () => {
    it('should return the failure result to the caller', async () => {
      const repoError = new Error('Failed to persist event');
      writeRepo.save.mockResolvedValueOnce(Result.failure(repoError as any));

      const command = new CreateTicketCommand(
        REPORTER_ID,
        VALID_TITLE,
        VALID_DESCRIPTION,
        VALID_URGENCY,
      );

      const result = await handler.execute(command);

      expect(result.isFailure()).toBe(true);
      expect(result.unwrapError()).toBe(repoError);
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────────────

  describe('given whitespace in title and description', () => {
    it('should trim whitespace and create ticket successfully', async () => {
      const command = new CreateTicketCommand(
        REPORTER_ID,
        '  Fix login issue  ',
        '  Users cannot sign in with valid password  ',
        VALID_URGENCY,
      );

      await handler.execute(command);

      const [savedTicket] = writeRepo.save.mock.calls[0];
      const props = savedTicket.getProps();

      expect(props.title.value).toBe('Fix login issue');
      expect(props.description.value).toBe(
        'Users cannot sign in with valid password',
      );
    });
  });

  describe('given multiple concurrent ticket creations', () => {
    it('should generate unique IDs for each ticket', async () => {
      writeRepo.save.mockResolvedValue(Result.success(undefined));

      const commands = [
        new CreateTicketCommand(
          'reporter-1',
          'Ticket 1',
          'Description 1',
          'high',
        ),
        new CreateTicketCommand(
          'reporter-2',
          'Ticket 2',
          'Description 2',
          'medium',
        ),
        new CreateTicketCommand(
          'reporter-3',
          'Ticket 3',
          'Description 3',
          'low',
        ),
      ];

      const results = await Promise.all(
        commands.map((cmd) => handler.execute(cmd)),
      );

      const ticketIds = results
        .filter((r) => r.isSuccess())
        .map((r) => r.unwrap());

      expect(ticketIds).toHaveLength(3);
      expect(new Set(ticketIds).size).toBe(3); // All unique
    });
  });

  describe('given different urgency levels', () => {
    it.each(ALLOWED_URGENCIES)(
      'should create ticket with urgency %s',
      async (urgency: TicketUrgency) => {
        const command = new CreateTicketCommand(
          REPORTER_ID,
          VALID_TITLE,
          VALID_DESCRIPTION,
          urgency,
        );

        writeRepo.save.mockResolvedValueOnce(Result.success(undefined));

        await handler.execute(command);

        const [savedTicket] = writeRepo.save.mock.calls[0];
        expect(savedTicket.getProps().urgency.value).toBe(urgency);
      },
    );
  });
});

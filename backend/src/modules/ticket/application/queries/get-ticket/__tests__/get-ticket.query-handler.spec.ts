import { Test, TestingModule } from '@nestjs/testing';
import { GetTicketQueryHandler } from '../get-ticket.query-handler';
import { GetTicketQuery } from '../get-ticket.query';
import {
  TicketReadRepositoryPort,
  TicketReadModel,
} from 'src/modules/ticket/domain/ports/ticket-read.repository.port';
import { TicketReadRepositoryToken } from 'src/modules/ticket/ticket.constants';
import { Result } from 'src/shared/common/result';
import { NotFoundException } from 'src/shared/common/exceptions';

// ── Test doubles ──────────────────────────────────────────────────────────────

const mockTicketReadRepository = (): jest.Mocked<TicketReadRepositoryPort> => ({
  findById: jest.fn(),
  findByReportedBy: jest.fn(),
  findAll: jest.fn(),
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TICKET_ID = '550e8400-e29b-41d4-a716-446655440000';

const SAMPLE_TICKET: TicketReadModel = {
  id: TICKET_ID,
  reporterId: '660e8400-e29b-41d4-a716-446655440000',
  title: 'App crashes on login',
  description: 'App crashes when clicking login button',
  urgency: 'high',
  status: 'open',
  priority: '1',
  assigneeId: '770e8400-e29b-41d4-a716-446655440000',
  blockReason: undefined,
  reopenCount: 0,
  createdAt: new Date('2026-01-01T10:00:00Z'),
  updatedAt: new Date('2026-01-01T10:00:00Z'),
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('GetTicketQueryHandler', () => {
  let handler: GetTicketQueryHandler;
  let readRepo: jest.Mocked<TicketReadRepositoryPort>;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        GetTicketQueryHandler,
        {
          provide: TicketReadRepositoryToken,
          useValue: mockTicketReadRepository(),
        },
      ],
    }).compile();

    handler = testingModule.get(GetTicketQueryHandler);
    readRepo = testingModule.get(TicketReadRepositoryToken);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.clearAllMocks();
  });

  // ── Happy path ───────────────────────────────────────────────────────────────

  describe('given valid ticket ID exists', () => {
    let query: GetTicketQuery;

    beforeEach(() => {
      query = new GetTicketQuery(TICKET_ID);
      readRepo.findById.mockResolvedValueOnce(Result.success(SAMPLE_TICKET));
    });

    it('should call findById once with ticket ID', async () => {
      await handler.execute(query);

      expect(readRepo.findById.mock.calls).toHaveLength(1);
      expect(readRepo.findById.mock.calls[0][0]).toBe(TICKET_ID);
    });

    it('should return success result with ticket data', async () => {
      const result = await handler.execute(query);

      expect(result.isSuccess()).toBe(true);
      const ticket = result.unwrap();
      expect(ticket).toEqual(SAMPLE_TICKET);
    });

    it('should return ticket with correct ID', async () => {
      const result = await handler.execute(query);

      const ticket = result.unwrap();
      expect(ticket.id).toBe(TICKET_ID);
    });

    it('should return ticket with correct title', async () => {
      const result = await handler.execute(query);

      const ticket = result.unwrap();
      expect(ticket.title).toBe(SAMPLE_TICKET.title);
    });

    it('should return ticket with correct status', async () => {
      const result = await handler.execute(query);

      const ticket = result.unwrap();
      expect(ticket.status).toBe('open');
    });

    it('should return ticket with correct urgency', async () => {
      const result = await handler.execute(query);

      const ticket = result.unwrap();
      expect(ticket.urgency).toBe('high');
    });

    it('should return ticket with assignee ID', async () => {
      const result = await handler.execute(query);

      const ticket = result.unwrap();
      expect(ticket.assigneeId).toBe(SAMPLE_TICKET.assigneeId);
    });
  });

  // ── Failure cases ────────────────────────────────────────────────────────────

  describe('given ticket ID does not exist', () => {
    let query: GetTicketQuery;
    const notFoundError = new NotFoundException('Ticket not found');

    beforeEach(() => {
      query = new GetTicketQuery(TICKET_ID);
      readRepo.findById.mockResolvedValueOnce(Result.failure(notFoundError));
    });

    it('should call findById once', async () => {
      await handler.execute(query);

      expect(readRepo.findById.mock.calls).toHaveLength(1);
    });

    it('should return failure result', async () => {
      const result = await handler.execute(query);

      expect(result.isFailure()).toBe(true);
    });

    it('should return NotFoundException', async () => {
      const result = await handler.execute(query);

      const error = result.unwrapError();
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('Ticket not found');
    });
  });

  describe('given repository throws exception', () => {
    let query: GetTicketQuery;
    const repoError = new Error('Database connection failed');

    beforeEach(() => {
      query = new GetTicketQuery(TICKET_ID);
      readRepo.findById.mockRejectedValueOnce(repoError);
    });

    it('should propagate error to caller', async () => {
      await expect(handler.execute(query)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  // ── Edge cases ───────────────────────────────────────────────────────────────

  describe('given ticket with no assignee', () => {
    let query: GetTicketQuery;
    const ticketWithoutAssignee: TicketReadModel = {
      ...SAMPLE_TICKET,
      assigneeId: undefined,
    };

    beforeEach(() => {
      query = new GetTicketQuery(TICKET_ID);
      readRepo.findById.mockResolvedValueOnce(
        Result.success(ticketWithoutAssignee),
      );
    });

    it('should return ticket with undefined assigneeId', async () => {
      const result = await handler.execute(query);

      const ticket = result.unwrap();
      expect(ticket.assigneeId).toBeUndefined();
    });
  });

  describe('given ticket with block reason', () => {
    let query: GetTicketQuery;
    const blockedTicket: TicketReadModel = {
      ...SAMPLE_TICKET,
      status: 'blocked',
      blockReason: 'Waiting for external API response',
    };

    beforeEach(() => {
      query = new GetTicketQuery(TICKET_ID);
      readRepo.findById.mockResolvedValueOnce(Result.success(blockedTicket));
    });

    it('should return ticket with block reason', async () => {
      const result = await handler.execute(query);

      const ticket = result.unwrap();
      expect(ticket.blockReason).toBe('Waiting for external API response');
      expect(ticket.status).toBe('blocked');
    });
  });
});

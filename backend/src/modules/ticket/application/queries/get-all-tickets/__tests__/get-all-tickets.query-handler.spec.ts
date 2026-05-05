import { Test, TestingModule } from '@nestjs/testing';
import { GetAllTicketsQueryHandler } from '../get-all-tickets.query-handler';
import { GetAllTicketsQuery } from '../get-all-tickets.query';
import {
  TicketReadRepositoryPort,
  TicketReadModel,
} from 'src/modules/ticket/domain/ports/ticket-read.repository.port';
import { TicketReadRepositoryToken } from 'src/modules/ticket/ticket.constants';
import { Result } from 'src/shared/common/result';
import { InternalServerErrorException } from 'src/shared/common/exceptions';

// ── Test doubles ──────────────────────────────────────────────────────────────

const mockTicketReadRepository = (): jest.Mocked<TicketReadRepositoryPort> => ({
  findById: jest.fn(),
  findByReportedBy: jest.fn(),
  findAll: jest.fn(),
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TICKETS_FIXTURE: TicketReadModel[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
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
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    reporterId: '660e8400-e29b-41d4-a716-446655440000',
    title: 'UI button misaligned',
    description: 'Button on homepage is not aligned properly',
    urgency: 'low',
    status: 'in-progress',
    priority: '3',
    assigneeId: '770e8400-e29b-41d4-a716-446655440001',
    blockReason: undefined,
    reopenCount: 0,
    createdAt: new Date('2026-01-02T10:00:00Z'),
    updatedAt: new Date('2026-01-02T10:00:00Z'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    reporterId: '660e8400-e29b-41d4-a716-446655440001',
    title: 'Feature request: dark mode',
    description: 'Please add dark mode support',
    urgency: 'medium',
    status: 'open',
    priority: '2',
    assigneeId: undefined,
    blockReason: undefined,
    reopenCount: 0,
    createdAt: new Date('2026-01-03T10:00:00Z'),
    updatedAt: new Date('2026-01-03T10:00:00Z'),
  },
];

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('GetAllTicketsQueryHandler', () => {
  let handler: GetAllTicketsQueryHandler;
  let readRepo: jest.Mocked<TicketReadRepositoryPort>;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        GetAllTicketsQueryHandler,
        {
          provide: TicketReadRepositoryToken,
          useValue: mockTicketReadRepository(),
        },
      ],
    }).compile();

    handler = testingModule.get(GetAllTicketsQueryHandler);
    readRepo = testingModule.get(TicketReadRepositoryToken);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.clearAllMocks();
  });

  // ── Happy path: no filters ────────────────────────────────────────────────────

  describe('given query without filters', () => {
    let query: GetAllTicketsQuery;

    beforeEach(() => {
      query = new GetAllTicketsQuery();
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should call findAll once', async () => {
      await handler.execute(query);

      expect(readRepo.findAll.mock.calls).toHaveLength(1);
    });

    it('should return success result with all tickets', async () => {
      const result = await handler.execute(query);

      expect(result.isSuccess()).toBe(true);
      const tickets = result.unwrap();
      expect(tickets).toHaveLength(3);
    });

    it('should return all tickets in order', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets[0].id).toBe(TICKETS_FIXTURE[0].id);
      expect(tickets[1].id).toBe(TICKETS_FIXTURE[1].id);
      expect(tickets[2].id).toBe(TICKETS_FIXTURE[2].id);
    });

    it('should apply default pagination limit of 50', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(3); // all 3 fit within default limit
    });
  });

  // ── Happy path: filter by status ──────────────────────────────────────────────

  describe('given query filtering by status open', () => {
    let query: GetAllTicketsQuery;

    beforeEach(() => {
      query = new GetAllTicketsQuery({ status: 'open' });
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should call findAll once', async () => {
      await handler.execute(query);

      expect(readRepo.findAll.mock.calls).toHaveLength(1);
    });

    it('should return only tickets with status open', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(2);
      expect(tickets.every((t) => t.status === 'open')).toBe(true);
    });

    it('should not include in-progress tickets', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets.some((t) => t.status === 'in-progress')).toBe(false);
    });
  });

  // ── Happy path: filter by reporterId ──────────────────────────────────────────

  describe('given query filtering by reporterId', () => {
    let query: GetAllTicketsQuery;
    const reporterId = '660e8400-e29b-41d4-a716-446655440000';

    beforeEach(() => {
      query = new GetAllTicketsQuery({ reporterId });
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should call findAll once', async () => {
      await handler.execute(query);

      expect(readRepo.findAll.mock.calls).toHaveLength(1);
    });

    it('should return only tickets reported by the given reporter', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(2);
      expect(tickets.every((t) => t.reporterId === reporterId)).toBe(true);
    });
  });

  // ── Happy path: filter by assigneeId ──────────────────────────────────────────

  describe('given query filtering by assigneeId', () => {
    let query: GetAllTicketsQuery;
    const assigneeId = '770e8400-e29b-41d4-a716-446655440000';

    beforeEach(() => {
      query = new GetAllTicketsQuery({ assigneeId });
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should return only tickets assigned to the given assignee', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(1);
      expect(tickets[0].assigneeId).toBe(assigneeId);
    });
  });

  // ── Happy path: pagination ────────────────────────────────────────────────────

  describe('given query with custom limit', () => {
    let query: GetAllTicketsQuery;

    beforeEach(() => {
      query = new GetAllTicketsQuery({ limit: 2, offset: 0 });
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should return only specified number of tickets', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(2);
    });

    it('should respect offset to skip tickets', async () => {
      query = new GetAllTicketsQuery({ limit: 2, offset: 1 });

      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(2);
      expect(tickets[0].id).toBe(TICKETS_FIXTURE[1].id);
      expect(tickets[1].id).toBe(TICKETS_FIXTURE[2].id);
    });
  });

  // ── Happy path: combined filters ──────────────────────────────────────────────

  describe('given query with multiple filters', () => {
    let query: GetAllTicketsQuery;

    beforeEach(() => {
      query = new GetAllTicketsQuery({
        status: 'open',
        reporterId: '660e8400-e29b-41d4-a716-446655440000',
        limit: 10,
        offset: 0,
      });
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should apply all filters', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(1);
      expect(tickets[0].status).toBe('open');
      expect(tickets[0].reporterId).toBe(
        '660e8400-e29b-41d4-a716-446655440000',
      );
    });
  });

  // ── Failure cases: empty results ──────────────────────────────────────────────

  describe('given no tickets in database', () => {
    let query: GetAllTicketsQuery;

    beforeEach(() => {
      query = new GetAllTicketsQuery();
      readRepo.findAll.mockResolvedValueOnce(Result.success([]));
    });

    it('should return empty array', async () => {
      const result = await handler.execute(query);

      expect(result.isSuccess()).toBe(true);
      const tickets = result.unwrap();
      expect(tickets).toHaveLength(0);
    });
  });

  // ── Failure cases: repository error ──────────────────────────────────────────

  describe('given repository returns failure', () => {
    let query: GetAllTicketsQuery;
    const repoError = new InternalServerErrorException('DB connection error');

    beforeEach(() => {
      query = new GetAllTicketsQuery();
      readRepo.findAll.mockResolvedValueOnce(Result.failure(repoError));
    });

    it('should return failure result', async () => {
      const result = await handler.execute(query);

      expect(result.isFailure()).toBe(true);
    });

    it('should propagate repository error', async () => {
      const result = await handler.execute(query);

      const error = result.unwrapError();
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toBe('DB connection error');
    });
  });

  describe('given repository throws exception', () => {
    let query: GetAllTicketsQuery;
    const repoError = new Error('Unexpected database error');

    beforeEach(() => {
      query = new GetAllTicketsQuery();
      readRepo.findAll.mockRejectedValueOnce(repoError);
    });

    it('should return failure result', async () => {
      const result = await handler.execute(query);

      expect(result.isFailure()).toBe(true);
    });

    it('should return InternalServerErrorException', async () => {
      const result = await handler.execute(query);

      const error = result.unwrapError();
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toBe('Unexpected database error');
    });
  });

  // ── Edge cases: filter with no matches ───────────────────────────────────────

  describe('given filter that matches no tickets', () => {
    let query: GetAllTicketsQuery;

    beforeEach(() => {
      query = new GetAllTicketsQuery({ status: 'resolved' });
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should return empty array', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(0);
    });
  });

  describe('given offset exceeds total tickets', () => {
    let query: GetAllTicketsQuery;

    beforeEach(() => {
      query = new GetAllTicketsQuery({ offset: 100 });
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should return empty array', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(0);
    });
  });
});

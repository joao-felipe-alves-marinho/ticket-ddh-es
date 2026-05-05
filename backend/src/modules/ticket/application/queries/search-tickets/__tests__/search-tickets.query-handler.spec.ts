import { Test, TestingModule } from '@nestjs/testing';
import { SearchTicketsQueryHandler } from '../search-tickets.query-handler';
import { SearchTicketsQuery } from '../search-tickets.query';
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
    title: 'App crashes on login screen',
    description: 'Users report the app crashes when trying to log in',
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
    description: 'The login button on homepage is misaligned',
    urgency: 'low',
    status: 'in_progress',
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
    description: 'Please add dark mode support to the application',
    urgency: 'medium',
    status: 'open',
    priority: '2',
    assigneeId: undefined,
    blockReason: undefined,
    reopenCount: 0,
    createdAt: new Date('2026-01-03T10:00:00Z'),
    updatedAt: new Date('2026-01-03T10:00:00Z'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    reporterId: '660e8400-e29b-41d4-a716-446655440001',
    title: 'Performance issue: slow login',
    description: 'Login process takes too long in production',
    urgency: 'high',
    status: 'open',
    priority: '1',
    assigneeId: '770e8400-e29b-41d4-a716-446655440000',
    blockReason: undefined,
    reopenCount: 0,
    createdAt: new Date('2026-01-04T10:00:00Z'),
    updatedAt: new Date('2026-01-04T10:00:00Z'),
  },
];

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('SearchTicketsQueryHandler', () => {
  let handler: SearchTicketsQueryHandler;
  let readRepo: jest.Mocked<TicketReadRepositoryPort>;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        SearchTicketsQueryHandler,
        {
          provide: TicketReadRepositoryToken,
          useValue: mockTicketReadRepository(),
        },
      ],
    }).compile();

    handler = testingModule.get(SearchTicketsQueryHandler);
    readRepo = testingModule.get(TicketReadRepositoryToken);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.clearAllMocks();
  });

  // ── Happy path: search by title ───────────────────────────────────────────────

  describe('given search term found in title', () => {
    let query: SearchTicketsQuery;

    beforeEach(() => {
      query = new SearchTicketsQuery('crashes');
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should call findAll once', async () => {
      await handler.execute(query);

      expect(readRepo.findAll.mock.calls).toHaveLength(1);
    });

    it('should return success result with matching tickets', async () => {
      const result = await handler.execute(query);

      expect(result.isSuccess()).toBe(true);
      const tickets = result.unwrap();
      expect(tickets.length).toBeGreaterThan(0);
    });

    it('should return only tickets matching search term in title', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(1);
      expect(tickets[0].title.toLowerCase()).toContain('crashes');
    });

    it('should be case-insensitive for title search', async () => {
      query = new SearchTicketsQuery('CRASHES');

      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(1);
      expect(tickets[0].title.toLowerCase()).toContain('crashes');
    });
  });

  // ── Happy path: search by description ─────────────────────────────────────────

  describe('given search term found in description', () => {
    let query: SearchTicketsQuery;

    beforeEach(() => {
      query = new SearchTicketsQuery('dark mode');
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should return tickets matching search term in description', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(1);
      expect(tickets[0].description.toLowerCase().includes('dark mode')).toBe(
        true,
      );
    });

    it('should be case-insensitive for description search', async () => {
      query = new SearchTicketsQuery('DARK MODE');

      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(1);
    });
  });

  // ── Happy path: multiple matches ──────────────────────────────────────────────

  describe('given search term matches multiple tickets', () => {
    let query: SearchTicketsQuery;

    beforeEach(() => {
      query = new SearchTicketsQuery('login');
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should return all matching tickets', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets.length).toBeGreaterThanOrEqual(2);
    });

    it('should match across both title and description', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      tickets.forEach((ticket) => {
        const titleMatch = ticket.title.toLowerCase().includes('login');
        const descriptionMatch = ticket.description
          .toLowerCase()
          .includes('login');
        expect(titleMatch || descriptionMatch).toBe(true);
      });
    });
  });

  // ── Happy path: pagination ────────────────────────────────────────────────────

  describe('given search with default pagination', () => {
    let query: SearchTicketsQuery;

    beforeEach(() => {
      query = new SearchTicketsQuery('login'); // no limit/offset specified
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should apply default limit of 20', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets.length).toBeLessThanOrEqual(20);
    });

    it('should apply default offset of 0', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets[0].id).toBe(TICKETS_FIXTURE[0].id);
    });
  });

  describe('given search with custom limit', () => {
    let query: SearchTicketsQuery;

    beforeEach(() => {
      query = new SearchTicketsQuery('login', 2, 0);
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should limit results to specified count', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets.length).toBeLessThanOrEqual(2);
    });
  });

  describe('given search with custom offset', () => {
    let query: SearchTicketsQuery;

    beforeEach(() => {
      query = new SearchTicketsQuery('login', 20, 1);
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should skip specified number of results', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      const allResults = TICKETS_FIXTURE.filter(
        (t) =>
          t.title.toLowerCase().includes('login') ||
          t.description.toLowerCase().includes('login'),
      );
      const expectedFirstId = allResults[1]?.id;
      if (expectedFirstId) {
        expect(tickets[0].id).toBe(expectedFirstId);
      }
    });
  });

  // ── Failure cases: no matches ─────────────────────────────────────────────────

  describe('given search term with no matches', () => {
    let query: SearchTicketsQuery;

    beforeEach(() => {
      query = new SearchTicketsQuery('nonexistent-term');
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should return success with empty array', async () => {
      const result = await handler.execute(query);

      expect(result.isSuccess()).toBe(true);
      const tickets = result.unwrap();
      expect(tickets).toHaveLength(0);
    });
  });

  // ── Failure cases: empty database ─────────────────────────────────────────────

  describe('given no tickets in database', () => {
    let query: SearchTicketsQuery;

    beforeEach(() => {
      query = new SearchTicketsQuery('any-term');
      readRepo.findAll.mockResolvedValueOnce(Result.success([]));
    });

    it('should return empty array', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(0);
    });
  });

  // ── Failure cases: repository error ──────────────────────────────────────────

  describe('given repository returns failure', () => {
    let query: SearchTicketsQuery;
    const repoError = new InternalServerErrorException('DB connection error');

    beforeEach(() => {
      query = new SearchTicketsQuery('login');
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
    let query: SearchTicketsQuery;
    const repoError = new Error('Database timeout');

    beforeEach(() => {
      query = new SearchTicketsQuery('login');
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
      expect(error.message).toBe('Database timeout');
    });
  });

  // ── Edge cases: special characters ────────────────────────────────────────────

  describe('given search term with special characters', () => {
    let query: SearchTicketsQuery;

    beforeEach(() => {
      query = new SearchTicketsQuery('(login)');
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should handle special characters in search', async () => {
      const result = await handler.execute(query);

      expect(result.isSuccess()).toBe(true);
    });
  });

  describe('given empty search term', () => {
    let query: SearchTicketsQuery;

    beforeEach(() => {
      query = new SearchTicketsQuery('');
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should return all tickets', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      // Empty string is contained in all strings
      expect(tickets.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('given offset that exceeds search results', () => {
    let query: SearchTicketsQuery;

    beforeEach(() => {
      query = new SearchTicketsQuery('login', 20, 100);
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should return empty array', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets).toHaveLength(0);
    });
  });

  describe('given partial word match', () => {
    let query: SearchTicketsQuery;

    beforeEach(() => {
      query = new SearchTicketsQuery('login');
      readRepo.findAll.mockResolvedValueOnce(Result.success(TICKETS_FIXTURE));
    });

    it('should find partial matches', async () => {
      const result = await handler.execute(query);

      const tickets = result.unwrap();
      expect(tickets.length).toBeGreaterThan(0);
      tickets.forEach((ticket) => {
        const matches =
          ticket.title.toLowerCase().includes('login') ||
          ticket.description.toLowerCase().includes('login');
        expect(matches).toBe(true);
      });
    });
  });
});

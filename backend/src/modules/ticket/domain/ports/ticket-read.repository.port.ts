import { Result } from 'src/shared/common/result';
import { ExceptionBase, NotFoundException } from 'src/shared/common/exceptions';
import { TicketStatus, TicketUrgency } from '../value-objects';

export interface TicketReadModel {
  id: string;
  reporterId: string;
  title: string;
  description: string;
  urgency: TicketUrgency;
  status: TicketStatus;
  priority?: string;
  assigneeId?: string;
  blockReason?: string;
  reopenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class TicketReadRepositoryPort {
  abstract findById(
    id: string,
  ): Promise<Result<TicketReadModel, NotFoundException>>;

  abstract findByReportedBy(
    userId: string,
  ): Promise<Result<TicketReadModel[], NotFoundException>>;

  abstract findAll(): Promise<Result<TicketReadModel[], ExceptionBase>>;
}

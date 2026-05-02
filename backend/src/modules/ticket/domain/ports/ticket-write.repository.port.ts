import { Ticket } from '../ticket.entity';
import { Result } from 'src/shared/common/result';
import { ExceptionBase } from 'src/shared/common/exceptions';

export abstract class TicketWriteRepositoryPort {
  abstract save(ticket: Ticket): Promise<Result<void, ExceptionBase>>;
  abstract findById(id: string): Promise<Result<Ticket | null, ExceptionBase>>;
}

import { Injectable, Inject } from '@nestjs/common';
import { KurrentDBRepositoryBase } from 'src/shared/infrastructure/kurrentdb/kurrentdb-repository.base';
import { TicketEventMapToken } from '../../ticket.constants';
import { DomainEvent } from 'src/shared/domain';
import { Ticket } from '../../domain/ticket.entity';
import { KurrentDBService } from 'src/shared/infrastructure/kurrentdb/kurrentdb.service';
import { KurrentDBSerializer } from 'src/shared/infrastructure/kurrentdb/kurrentdb.serializer';
import {
  KurrentDBServiceToken,
  KurrentDBSerializerToken,
} from 'src/shared/infrastructure/kurrentdb/kurrentdb.constants';
import { TicketWriteRepositoryPort } from '../../domain/ports/ticket-write.repository.port';

@Injectable()
export class TicketKurrentDBRepository
  extends KurrentDBRepositoryBase<Ticket>
  implements TicketWriteRepositoryPort
{
  constructor(
    @Inject(KurrentDBServiceToken)
    kurrentClient: KurrentDBService,
    @Inject(KurrentDBSerializerToken)
    serializer: KurrentDBSerializer,
    @Inject(TicketEventMapToken)
    private readonly eventMap: Record<
      string,
      new (props: unknown) => DomainEvent
    >,
  ) {
    super(kurrentClient, serializer);
  }

  protected getStreamPrefix(): string {
    return 'ticket';
  }

  protected getEventMap(): Record<string, new (props: unknown) => DomainEvent> {
    return this.eventMap;
  }

  protected createAggregateInstance(): Ticket {
    return new Ticket();
  }
}

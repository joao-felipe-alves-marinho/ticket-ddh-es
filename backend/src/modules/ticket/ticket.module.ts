import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TicketEventMap } from './infrastructure/kurrentdb/ticket.event-map';
import {
  TicketEventMapToken,
  TicketReadRepositoryToken,
  TicketWriteRepositoryToken,
} from './ticket.constants';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TicketDocument,
  TicketSchema,
} from './infrastructure/mongodb/ticket.schema';
import { TicketProjector } from './infrastructure/projections/ticket.projector';
import { TicketKurrentDBRepository } from './infrastructure/kurrentdb/ticket-kurrentdb.repository';
import { TicketMongoDBRepository } from './infrastructure/mongodb/ticket-mongodb.repository';
import {
  CreateTicketCommandHandler,
  TriageTicketCommandHandler,
  StartProgressCommandHandler,
  BlockTicketCommandHandler,
  ResolveTicketCommandHandler,
  ReopenTicketCommandHandler,
  CancelTicketCommandHandler,
  AssignTicketCommandHandler,
  UpdateTicketDetailsCommandHandler,
} from './application/commands';
import {
  GetTicketQueryHandler,
  GetAllTicketsQueryHandler,
  SearchTicketsQueryHandler,
} from './application/queries';
import { TicketController } from './infrastructure/http/ticket.controller';

const CommandHandlers = [
  CreateTicketCommandHandler,
  TriageTicketCommandHandler,
  StartProgressCommandHandler,
  BlockTicketCommandHandler,
  ResolveTicketCommandHandler,
  ReopenTicketCommandHandler,
  CancelTicketCommandHandler,
  AssignTicketCommandHandler,
  UpdateTicketDetailsCommandHandler,
];

const QueryHandlers = [
  GetTicketQueryHandler,
  GetAllTicketsQueryHandler,
  SearchTicketsQueryHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: TicketDocument.name, schema: TicketSchema },
    ]),
  ],
  controllers: [TicketController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: TicketWriteRepositoryToken,
      useClass: TicketKurrentDBRepository,
    },
    {
      provide: TicketReadRepositoryToken,
      useClass: TicketMongoDBRepository,
    },
    {
      provide: TicketEventMapToken,
      useValue: TicketEventMap,
    },
    TicketProjector,
  ],
})
export class TicketModule implements OnModuleInit {
  private readonly logger = new Logger(TicketModule.name);
  onModuleInit(): void {
    this.logger.log('TicketModule initialized');
  }
}

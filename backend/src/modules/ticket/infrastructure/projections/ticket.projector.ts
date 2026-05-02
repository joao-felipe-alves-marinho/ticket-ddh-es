import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KurrentDBService } from 'src/shared/infrastructure/kurrentdb/kurrentdb.service';
import { TicketDocument } from '../mongodb/ticket.schema';
import { KurrentDBSerializer } from 'src/shared/infrastructure/kurrentdb/kurrentdb.serializer';
import { BaseProjector } from 'src/shared/infrastructure/projections/base.projector';
import { Inject, Logger } from '@nestjs/common';
import {
  KurrentDBSerializerToken,
  KurrentDBServiceToken,
} from 'src/shared/infrastructure/kurrentdb/kurrentdb.constants';

export class TicketProjector extends BaseProjector<TicketDocument> {
  protected streamName = 'ticket-';

  constructor(
    @Inject(KurrentDBServiceToken)
    kurrentDB: KurrentDBService,
    @Inject(KurrentDBSerializerToken)
    kurrentDBSerializer: KurrentDBSerializer,
    @InjectModel(TicketDocument.name)
    ticketModel: Model<TicketDocument>,
  ) {
    super(TicketProjector.name, kurrentDB, kurrentDBSerializer, ticketModel);
    const logger = new Logger(TicketProjector.name);
    logger.log('TicketProjector initialized');
  }
}

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KurrentDBService } from 'src/shared/infrastructure/kurrentdb/kurrentdb.service';
import { KurrentDBSerializer } from 'src/shared/infrastructure/kurrentdb/kurrentdb.serializer';
import { BaseProjector } from 'src/shared/infrastructure/projections/base.projector';
import { UserDocument } from '../mongodb/user.schema';
import { Inject, Logger } from '@nestjs/common';
import {
  KurrentDBSerializerToken,
  KurrentDBServiceToken,
} from 'src/shared/infrastructure/kurrentdb/kurrentdb.constants';

export class UserProjector extends BaseProjector<UserDocument> {
  protected streamName = 'user-';

  constructor(
    @Inject(KurrentDBServiceToken)
    kurrentDB: KurrentDBService,
    @Inject(KurrentDBSerializerToken)
    kurrentDBSerializer: KurrentDBSerializer,
    @InjectModel(UserDocument.name)
    userModel: Model<UserDocument>,
  ) {
    super(UserProjector.name, kurrentDB, kurrentDBSerializer, userModel);
    const logger = new Logger(UserProjector.name);
    logger.log('UserProjector initialized');
  }
}

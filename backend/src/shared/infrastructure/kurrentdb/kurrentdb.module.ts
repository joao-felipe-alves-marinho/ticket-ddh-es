import { Global, Module } from '@nestjs/common';
import { KurrentDBSerializer } from './kurrentdb.serializer';
import { KurrentDBService } from './kurrentdb.service';
import {
  KurrentDBServiceToken,
  KurrentDBSerializerToken,
} from './kurrentdb.constants';

@Global()
@Module({
  providers: [
    {
      provide: KurrentDBServiceToken,
      useClass: KurrentDBService,
    },
    {
      provide: KurrentDBSerializerToken,
      useClass: KurrentDBSerializer,
    },
  ],
  exports: [KurrentDBServiceToken, KurrentDBSerializerToken],
})
export class KurrentDBModule {}

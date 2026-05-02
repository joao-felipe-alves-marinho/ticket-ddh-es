import { Module } from '@nestjs/common';
import { KurrentDBModule } from './shared/infrastructure/kurrentdb/kurrentdb.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { validateConfig, AppConfig } from './shared/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>) => ({
        uri: config.get('MONGODB_URI', { infer: true }),
      }),
    }),
    KurrentDBModule,
    AuthModule,
    TicketModule,
  ],
})
export class AppModule {}

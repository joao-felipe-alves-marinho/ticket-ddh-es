import { Module, OnModuleInit, Logger } from '@nestjs/common';
import {
  UserEventMapToken,
  UserReadRepositoryToken,
  UserWriteRepositoryToken,
} from './auth.constants';
import { UserEventMap } from './infrastructure/kurrentdb/user.event-map';
import { CqrsModule } from '@nestjs/cqrs';
import { UserDocument, UserSchema } from './infrastructure/mongodb/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './infrastructure/http/auth.controller';
import { UserKurrentDBRepository } from './infrastructure/kurrentdb/user-kurrentdb.repository';
import { UserMongoDBRepository } from './infrastructure/mongodb/user-mongodb.repository';
import { UserProjector } from './infrastructure/projections/user.projector';
import { JwtStrategy } from './infrastructure/jwt/jwt.strategy';
import { RegisterUserCommandHandler } from './application/commands/register-user/register-user.command-handler';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/shared/config';

const CommandHandlers = [RegisterUserCommandHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', { infer: true }),
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    {
      provide: UserWriteRepositoryToken,
      useClass: UserKurrentDBRepository,
    },
    {
      provide: UserReadRepositoryToken,
      useClass: UserMongoDBRepository,
    },
    {
      provide: UserEventMapToken,
      useValue: UserEventMap,
    },
    UserProjector,
    JwtStrategy,
  ],
  exports: [UserReadRepositoryToken, JwtModule],
})
export class AuthModule implements OnModuleInit {
  private readonly logger = new Logger(AuthModule.name);
  onModuleInit(): void {
    this.logger.log('AuthModule initialized');
  }
}

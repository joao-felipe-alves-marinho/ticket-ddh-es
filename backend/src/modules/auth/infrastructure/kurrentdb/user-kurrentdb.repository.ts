import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/user.entity';
import { KurrentDBRepositoryBase } from 'src/shared/infrastructure/kurrentdb/kurrentdb-repository.base';
import { UserWriteRepositoryPort } from '../../domain/ports/user-write.repository.port';
import { KurrentDBSerializer } from 'src/shared/infrastructure/kurrentdb/kurrentdb.serializer';
import { KurrentDBService } from 'src/shared/infrastructure/kurrentdb/kurrentdb.service';
import {
  KurrentDBServiceToken,
  KurrentDBSerializerToken,
} from 'src/shared/infrastructure/kurrentdb/kurrentdb.constants';
import {
  UserEventMapToken,
  UserReadRepositoryToken,
} from '../../auth.constants';
import { DomainEvent } from 'src/shared/domain/domain-event.base';
import { ExceptionBase, NotFoundException } from 'src/shared/common/exceptions';
import { Result } from 'src/shared/common/result';
import { UserReadRepositoryPort } from '../../domain/ports/user-read.repository.port';

@Injectable()
export class UserKurrentDBRepository
  extends KurrentDBRepositoryBase<User>
  implements UserWriteRepositoryPort
{
  constructor(
    @Inject(KurrentDBServiceToken)
    kurrentClient: KurrentDBService,
    @Inject(KurrentDBSerializerToken)
    serializer: KurrentDBSerializer,
    @Inject(UserReadRepositoryToken)
    private readonly userReadRepository: UserReadRepositoryPort,
    @Inject(UserEventMapToken)
    private readonly eventMap: Record<
      string,
      new (props: unknown) => DomainEvent
    >,
  ) {
    super(kurrentClient, serializer);
  }

  async existsByEmail(email: string): Promise<Result<boolean, ExceptionBase>> {
    this.logger.debug(`existsByEmail: ${email}`);
    const user = await this.userReadRepository.findByEmail(email);
    if (user.isFailure()) {
      if (user.unwrapError() instanceof NotFoundException) {
        return Result.success(false);
      }
      return Result.failure(user.unwrapError());
    }
    return Result.success(true);
  }

  protected getStreamPrefix(): string {
    return 'user';
  }

  protected getEventMap(): Record<string, new (props: unknown) => DomainEvent> {
    return this.eventMap;
  }

  protected createAggregateInstance(): User {
    return new User();
  }
}

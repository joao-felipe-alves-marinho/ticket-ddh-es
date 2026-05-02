import { Injectable, Logger } from '@nestjs/common';
import { RepositoryBase } from 'src/shared/domain/repository.interface';
import { AggregateRoot } from 'src/shared/domain/aggregate-root.base';
import { Result } from 'src/shared/common/result';
import { KurrentDBService } from './kurrentdb.service';
import { KurrentDBSerializer } from './kurrentdb.serializer';
import { DomainEvent } from 'src/shared/domain';
import { ExceptionBase } from 'src/shared/common/exceptions';

type VersionedAggregate = AggregateRoot<unknown> & {
  revision?: bigint;
  markPersisted(revision: bigint): void;
};

@Injectable()
export abstract class KurrentDBRepositoryBase<
  T extends AggregateRoot<unknown>,
> implements RepositoryBase<T> {
  protected readonly logger = new Logger(KurrentDBRepositoryBase.name);
  constructor(
    protected readonly kurrentClient: KurrentDBService,
    protected readonly serializer: KurrentDBSerializer,
  ) {}

  protected abstract getStreamPrefix(): string;

  protected abstract getEventMap(): Record<
    string,
    new (props: unknown) => DomainEvent
  >;

  protected abstract createAggregateInstance(): T;

  async save(entity: T): Promise<Result<void, ExceptionBase>> {
    const versionedEntity = entity as VersionedAggregate;
    const streamName = this.buildStreamName(entity.id);
    this.logger.debug(`appendToStream: ${streamName}`);
    const events = versionedEntity.pullDomainEvents();
    const eventData = events.map((event) => this.serializer.toJSONEvent(event));
    const expectedRevision: bigint | undefined = versionedEntity.revision;

    const result = await this.kurrentClient.appendToStream(
      streamName,
      eventData,
      expectedRevision,
    );

    if (result.isFailure()) {
      this.logger.error(
        `appendToStream failed for ${streamName}`,
        result.unwrapError(),
      );
      return Result.failure(result.unwrapError());
    }

    versionedEntity.markPersisted(result.unwrap());

    this.logger.debug(`appendToStream succeeded for ${streamName}`);

    return Result.success(undefined);
  }

  async findById(id: string): Promise<Result<T | null, ExceptionBase>> {
    const streamName = this.buildStreamName(id);
    this.logger.debug(`readStream: ${streamName}`);
    const result = await this.kurrentClient.readStream(streamName);

    if (result.isFailure()) {
      return Result.failure(result.unwrapError());
    }

    const events = result
      .unwrap()
      .map((storageEvent) =>
        this.serializer.toDomainEvent(storageEvent, this.getEventMap()),
      );

    if (events.length === 0) {
      this.logger.debug(`no events found for ${streamName}`);
      return Result.success(null);
    }

    const aggregate = this.createAggregateInstance();
    aggregate.loadFromHistory(events);
    return Result.success(aggregate);
  }

  protected buildStreamName(id: string): string {
    return `${this.getStreamPrefix()}-${id}`;
  }
}

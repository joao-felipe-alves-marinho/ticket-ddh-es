import {
  jsonEvent,
  JSONEventData,
  ResolvedEvent,
} from '@kurrent/kurrentdb-client';
import { Injectable, Logger } from '@nestjs/common';
import { DomainEvent, DomainEventProps } from 'src/shared/domain';
import { NoEventInResolvedEventFoundException } from './kurrentdb.exception';

export interface StorageEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  metadata: {
    aggregateId: string;
    occurredAt: string;
  };
  revision?: bigint;
}

@Injectable()
export class KurrentDBSerializer {
  private readonly logger = new Logger(KurrentDBSerializer.name);

  toJSONEvent(event: DomainEvent): JSONEventData {
    const { id, aggregateId, eventName, occurredAt, ...eventData } = event;
    this.logger.debug(
      `Serializing event ${eventName} for aggregateId ${aggregateId}`,
    );
    return jsonEvent({
      id,
      type: eventName,
      data: { ...eventData },
      metadata: {
        aggregateId,
        occurredAt: occurredAt.toISOString(),
      },
    });
  }

  public toStorageEvent(resolvedEvent: ResolvedEvent): StorageEvent {
    if (!resolvedEvent.event) {
      throw new NoEventInResolvedEventFoundException();
    }

    const metadata =
      typeof resolvedEvent.event.metadata === 'object' &&
      resolvedEvent.event.metadata !== null
        ? (resolvedEvent.event.metadata as Record<string, unknown>)
        : {};

    return {
      id: resolvedEvent.event.id,
      type: resolvedEvent.event.type,
      revision: resolvedEvent.event.revision,
      data:
        typeof resolvedEvent.event.data === 'object' &&
        resolvedEvent.event.data !== null
          ? (resolvedEvent.event.data as Record<string, unknown>)
          : {},
      metadata: {
        aggregateId:
          typeof metadata.aggregateId === 'string' ? metadata.aggregateId : '',
        occurredAt:
          typeof metadata.occurredAt === 'string' ? metadata.occurredAt : '',
      },
    };
  }

  toDomainEvent<T extends DomainEvent = DomainEvent>(
    resolvedEvent: ResolvedEvent,
    eventMap: Record<string, new (props: DomainEventProps<unknown>) => T>,
  ): T {
    const storageEvent = this.toStorageEvent(resolvedEvent);

    const props = {
      id: storageEvent.id,
      aggregateId: storageEvent.metadata.aggregateId,
      occurredAt: new Date(storageEvent.metadata.occurredAt),
      revision: storageEvent.revision,
      ...storageEvent.data,
    } as DomainEventProps<unknown> & Record<string, unknown>;

    const EventClass = eventMap[storageEvent.type];
    if (!EventClass) {
      throw new Error(
        `No domain event class found for type: ${storageEvent.type}`,
      );
    }

    return new EventClass({ ...props });
  }
}

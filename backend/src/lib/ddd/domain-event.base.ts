import { randomUUID } from 'crypto';
import { ArgumentNotProvidedException } from '../exceptions';
import { Guard } from '../guard';

type DomainEventMetadata = {
  readonly occurredAt: Date;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly userId?: string;
};

export type DomainEventProps<T> = Omit<T, 'id' | 'metadata'> & {
  aggregateId: string;
  metadata?: DomainEventMetadata;
};

type DomainEventClass = {
  readonly name: string;
  readonly VERSION?: number;
};

export abstract class DomainEvent {
  public static readonly VERSION = 1;

  public readonly id: string;
  public readonly aggregateId: string;
  public readonly eventName: string;
  public readonly version: number;
  public readonly metadata: DomainEventMetadata;

  constructor(props: DomainEventProps<unknown>) {
    if (Guard.isEmpty(props))
      throw new ArgumentNotProvidedException(
        'DomainEvent props must be provided',
      );
    if (Guard.isEmpty(props.aggregateId))
      throw new ArgumentNotProvidedException(
        'DomainEvent aggregateId must be provided',
      );

    this.id = randomUUID();
    this.aggregateId = props.aggregateId;
    const eventClass = this.constructor as DomainEventClass;
    this.eventName = eventClass.name;
    this.version = eventClass.VERSION ?? DomainEvent.VERSION;
    this.metadata = {
      occurredAt: props?.metadata?.occurredAt || new Date(),
      correlationId: props?.metadata?.correlationId,
      causationId: props?.metadata?.causationId,
      userId: props?.metadata?.userId,
    };
  }
}

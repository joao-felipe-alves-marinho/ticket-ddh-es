import { randomUUID } from 'crypto';
import { Guard } from '../common/guard';
import { ArgumentNotProvidedException } from '../common/exceptions';

export type DomainEventProps<T> = Omit<
  T,
  'id' | 'aggregateId' | 'eventName' | 'occurredAt'
> & {
  aggregateId: string;
  id?: string;
  occurredAt?: Date;
  revision?: bigint;
};

export abstract class DomainEvent {
  public readonly id: string;
  public readonly aggregateId: string;
  public readonly eventName: string;
  public readonly occurredAt: Date;
  public readonly revision?: bigint;

  constructor(props: DomainEventProps<unknown>) {
    if (Guard.isEmpty(props))
      throw new ArgumentNotProvidedException(
        'DomainEvent props must be provided',
      );
    if (Guard.isEmpty(props.aggregateId))
      throw new ArgumentNotProvidedException(
        'DomainEvent aggregateId must be provided',
      );

    this.id = props.id || randomUUID();
    this.aggregateId = props.aggregateId;
    this.eventName = this.getEventName();
    this.occurredAt = props.occurredAt || new Date();
    this.revision = props.revision;
  }

  private getEventName(): string {
    return this.constructor.name.replace('DomainEvent', '');
  }
}

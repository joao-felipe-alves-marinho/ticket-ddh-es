import { DomainEvent } from './domain-event.base';
import { Entity } from './entity.base';

export abstract class AggregateRoot<EntityProps> extends Entity<EntityProps> {
  private uncommittedDomainEvents: DomainEvent[] = [];

  public get domainEvents(): readonly DomainEvent[] {
    return [...this.uncommittedDomainEvents];
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this.uncommittedDomainEvents.push(domainEvent);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this.uncommittedDomainEvents];
    this.clearDomainEvents();
    return events;
  }

  public hasDomainEvents(): boolean {
    return this.uncommittedDomainEvents.length > 0;
  }

  public clearDomainEvents(): void {
    this.uncommittedDomainEvents.length = 0;
  }

  protected apply(event: DomainEvent, isNew = true): void {
    const eventName = event.eventName;

    const handlerMethodName = `on${eventName}`;
    type EventHandler = (event: DomainEvent) => void;
    const handler = (
      this as unknown as Record<string, EventHandler | undefined>
    )[handlerMethodName];

    if (handler) {
      handler.call(this, event);
      this._updatedAt = event.occurredAt;
      const nextRevision: bigint = event.revision ?? this.version + 1n;
      this._revision = nextRevision;
    } else {
      throw new Error(
        `No handler found for ${eventName} in ${this.constructor.name}`,
      );
    }

    if (isNew) {
      this.addDomainEvent(event);
    }
  }

  public loadFromHistory(events: DomainEvent[]): void {
    for (const event of events) {
      this.apply(event, false);
    }
  }
}

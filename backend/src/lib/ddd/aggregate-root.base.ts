import { DomainEvent } from './domain-event.base';
import { Entity } from './entity.base';

export abstract class AggregateRoot<EntityProps> extends Entity<EntityProps> {
  private _domainEvents: DomainEvent[] = [];

  public get domainEvents(): readonly DomainEvent[] {
    return [...this._domainEvents];
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this.clearDomainEvents();
    return events;
  }

  public hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }

  public clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }
}

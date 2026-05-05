import { AggregateRoot } from '../aggregate-root.base';
import { DomainEvent } from '../domain-event.base';

type TestAggregateProps = {
  count: number;
  lastDelta?: number;
  handledEvents: number;
};

class TestEvent extends DomainEvent {
  readonly delta: number;

  constructor(props: {
    aggregateId: string;
    delta: number;
    revision?: bigint;
  }) {
    super(props);
    this.delta = props.delta;
  }
}

class UnhandledEvent extends DomainEvent {
  constructor(props: { aggregateId: string }) {
    super(props);
  }
}

class TestAggregate extends AggregateRoot<TestAggregateProps> {
  constructor() {
    super();
    this.props = {
      count: 0,
      handledEvents: 0,
    };
  }

  public getUncommittedEvents(): readonly DomainEvent[] {
    return this.domainEvents;
  }

  public clearUncommittedEvents(): void {
    this.clearDomainEvents();
  }

  public route(event: DomainEvent): void {
    this.apply(event);
  }

  public applyEvent(event: DomainEvent): void {
    this.apply(event);
  }

  public get count(): number {
    return this.props.count;
  }

  public get handledEvents(): number {
    return this.props.handledEvents;
  }

  public get lastDelta(): number | undefined {
    return this.props.lastDelta;
  }

  public validate(): void {}

  private onTestEvent(event: TestEvent): void {
    this.props.count += event.delta;
    this.props.lastDelta = event.delta;
    this.props.handledEvents += 1;
  }
}

describe('AggregateRoot Base', () => {
  let aggregate: TestAggregate;

  beforeEach(() => {
    aggregate = new TestAggregate();
  });

  describe('Given a fresh aggregate', () => {
    it('When inspecting the version before events, Then it should start at -1', () => {
      expect(aggregate.version).toBe(-1n);
    });
  });

  describe('Given a new event', () => {
    it('When applying one event, Then it should increment version by 1', () => {
      aggregate.applyEvent(
        new TestEvent({ aggregateId: 'aggregate-1', delta: 1 }),
      );

      expect(aggregate.version).toBe(0n);
    });

    it('When applying one event, Then it should add it to uncommitted events', () => {
      const event = new TestEvent({ aggregateId: 'aggregate-1', delta: 1 });

      aggregate.applyEvent(event);

      expect(aggregate.getUncommittedEvents()).toHaveLength(1);
      expect(aggregate.getUncommittedEvents()[0]).toBe(event);
    });

    it('When applying one event, Then it should call the matching handler and mutate state', () => {
      aggregate.applyEvent(
        new TestEvent({ aggregateId: 'aggregate-1', delta: 3 }),
      );

      expect(aggregate.count).toBe(3);
      expect(aggregate.handledEvents).toBe(1);
      expect(aggregate.lastDelta).toBe(3);
    });
  });

  describe('Given event history', () => {
    it('When loading events from history, Then it should increment version without adding uncommitted events', () => {
      aggregate.loadFromHistory([
        new TestEvent({ aggregateId: 'aggregate-1', delta: 1 }),
        new TestEvent({ aggregateId: 'aggregate-1', delta: 2 }),
      ]);

      expect(aggregate.version).toBe(1n);
      expect(aggregate.getUncommittedEvents()).toHaveLength(0);
    });

    it('When loading events from history, Then it should call the handler for each event', () => {
      aggregate.loadFromHistory([
        new TestEvent({ aggregateId: 'aggregate-1', delta: 1 }),
        new TestEvent({ aggregateId: 'aggregate-1', delta: 2 }),
      ]);

      expect(aggregate.count).toBe(3);
      expect(aggregate.handledEvents).toBe(2);
      expect(aggregate.lastDelta).toBe(2);
    });
  });

  describe('Given uncommitted events', () => {
    it('When clearing uncommitted events, Then it should empty the queue', () => {
      aggregate.applyEvent(
        new TestEvent({ aggregateId: 'aggregate-1', delta: 1 }),
      );

      aggregate.clearUncommittedEvents();

      expect(aggregate.getUncommittedEvents()).toHaveLength(0);
    });
  });

  describe('Given an event without a handler', () => {
    it('When routing the event, Then it should throw an error', () => {
      expect(() =>
        aggregate.route(new UnhandledEvent({ aggregateId: 'aggregate-1' })),
      ).toThrow('No handler found for UnhandledEvent in TestAggregate');
    });
  });
});

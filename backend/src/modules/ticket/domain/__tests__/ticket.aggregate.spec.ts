import { Ticket } from '../ticket.entity';
import {
  BlockReason,
  Description,
  Priority,
  Status,
  Title,
  Urgency,
} from '../value-objects';
import {
  TicketAssignedDomainEvent,
  TicketBlockedDomainEvent,
  TicketCancelledDomainEvent,
  TicketCreatedDomainEvent,
  TicketDetailsUpdatedDomainEvent,
  TicketProgressStartedDomainEvent,
  TicketReopenedDomainEvent,
  TicketResolvedDomainEvent,
  TicketTriagedDomainEvent,
} from '../events';

describe('Ticket Aggregate', () => {
  let validProps: {
    reporterId: string;
    title: Title;
    description: Description;
    urgency: Urgency;
  };

  beforeEach(() => {
    validProps = {
      reporterId: 'reporter-1',
      title: Title.create('Fix login issue'),
      description: Description.create(
        'Users cannot sign in with a valid password.',
      ),
      urgency: Urgency.low(),
    };
  });

  describe('Given a valid ticket creation request', () => {
    let ticket: Ticket;

    beforeEach(() => {
      ticket = Ticket.create(validProps).unwrap();
    });

    it('When creating a ticket, Then it should emit exactly one uncommitted event', () => {
      expect(ticket.domainEvents).toHaveLength(1);
      expect(ticket.domainEvents[0]).toBeInstanceOf(TicketCreatedDomainEvent);
    });

    it('When creating a ticket, Then aggregate state should reflect the event data', () => {
      const props = ticket.getProps();

      expect(props.status.value).toBe(Status.open().value);
      expect(props.title.value).toBe('Fix login issue');
      expect(props.reporterId).toBe('reporter-1');
    });

    it('When creating a ticket, Then version should be 0', () => {
      expect(ticket.version).toBe(0n);
    });
  });

  describe('Given ticket history', () => {
    it('When loading a TicketCreatedDomainEvent, Then it should rebuild the full state', () => {
      const createdAt = '2024-01-01T00:00:00.000Z';
      const event = new TicketCreatedDomainEvent({
        aggregateId: 'ticket-1',
        reporterId: 'reporter-1',
        title: 'Fix login issue',
        description: 'Users cannot sign in with a valid password.',
        urgency: 'low',
        status: 'open',
        createdAt,
      });

      const ticket = new Ticket();
      ticket.loadFromHistory([event]);

      const props = ticket.getProps();

      expect(ticket.id).toBe('ticket-1');
      expect(ticket.createdAt.toISOString()).toBe(createdAt);
      expect(props.reporterId).toBe('reporter-1');
      expect(props.title.value).toBe('Fix login issue');
      expect(props.description.value).toBe(
        'Users cannot sign in with a valid password.',
      );
      expect(props.urgency.value).toBe(Urgency.low().value);
      expect(props.status.value).toBe(Status.open().value);
      expect(ticket.version).toBe(0n);
      expect(ticket.domainEvents).toHaveLength(0);
    });
  });

  describe('Given invalid ticket creation data', () => {
    it('When creating a ticket with a title that is too short, Then it should throw from the Title value object', () => {
      expect(() =>
        Ticket.create({
          ...validProps,
          title: Title.create('Hi'),
        }),
      ).toThrow('Ticket title must be between 3 and 150 characters');
    });
  });

  describe('Given an open ticket with uncommitted events cleared', () => {
    let ticket: Ticket;

    beforeEach(() => {
      ticket = Ticket.create(validProps).unwrap();
      ticket.clearDomainEvents();
    });

    describe('When triaging the ticket', () => {
      beforeEach(() => {
        ticket.triage(Priority.high()).unwrap();
      });

      it('Then it should emit a TicketTriagedDomainEvent', () => {
        expect(ticket.domainEvents).toHaveLength(1);
        expect(ticket.domainEvents[0]).toBeInstanceOf(TicketTriagedDomainEvent);
      });

      it('Then it should set priority and status to triaged', () => {
        const props = ticket.getProps();

        expect(props.priority?.value).toBe(Priority.high().value);
        expect(props.status.value).toBe(Status.triaged().value);
      });
    });

    describe('When updating details while the ticket is open', () => {
      beforeEach(() => {
        ticket
          .updateDetails({
            title: Title.create('Fix login redirect'),
            description: Description.create('Add a retry after redirect loop.'),
            urgency: Urgency.high(),
          })
          .unwrap();
      });

      it('Then it should emit a TicketDetailsUpdatedDomainEvent', () => {
        expect(ticket.domainEvents).toHaveLength(1);
        expect(ticket.domainEvents[0]).toBeInstanceOf(
          TicketDetailsUpdatedDomainEvent,
        );
      });

      it('Then it should update title, description, and urgency', () => {
        const props = ticket.getProps();

        expect(props.title.value).toBe('Fix login redirect');
        expect(props.description.value).toBe(
          'Add a retry after redirect loop.',
        );
        expect(props.urgency.value).toBe(Urgency.high().value);
      });
    });

    describe('When cancelling the ticket', () => {
      beforeEach(() => {
        ticket.cancel().unwrap();
      });

      it('Then it should emit a TicketCancelledDomainEvent', () => {
        expect(ticket.domainEvents).toHaveLength(1);
        expect(ticket.domainEvents[0]).toBeInstanceOf(
          TicketCancelledDomainEvent,
        );
      });

      it('Then it should set status to cancelled', () => {
        expect(ticket.getProps().status.value).toBe(Status.cancelled().value);
      });
    });

    describe('When assigning the ticket before triage', () => {
      it('Then it should fail because assignment is only allowed from triaged', () => {
        const result = ticket.assign('agent-1');

        expect(result.isFailure()).toBe(true);
        expect(result.unwrapError().message).toBe(
          'Cannot assign agent to ticket with status open',
        );
      });
    });
  });

  describe('Given a triaged ticket', () => {
    let ticket: Ticket;

    beforeEach(() => {
      ticket = Ticket.create(validProps).unwrap();
      ticket.clearDomainEvents();
      ticket.triage(Priority.high()).unwrap();
      ticket.clearDomainEvents();
    });

    describe('When assigning an agent', () => {
      beforeEach(() => {
        ticket.assign('agent-1').unwrap();
      });

      it('Then it should emit a TicketAssignedDomainEvent', () => {
        expect(ticket.domainEvents).toHaveLength(1);
        expect(ticket.domainEvents[0]).toBeInstanceOf(
          TicketAssignedDomainEvent,
        );
      });

      it('Then it should set the assigneeId', () => {
        expect(ticket.getProps().assigneeId).toBe('agent-1');
      });
    });

    describe('When starting progress without an assignee', () => {
      it('Then it should fail because the assignee is required', () => {
        const result = ticket.startProgress();

        expect(result.isFailure()).toBe(true);
        expect(result.unwrapError().message).toBe(
          'Ticket must have an assignee to be in progress',
        );
      });
    });

    describe('When cancelling the ticket', () => {
      beforeEach(() => {
        ticket.cancel().unwrap();
      });

      it('Then it should emit a TicketCancelledDomainEvent', () => {
        expect(ticket.domainEvents).toHaveLength(1);
        expect(ticket.domainEvents[0]).toBeInstanceOf(
          TicketCancelledDomainEvent,
        );
      });

      it('Then it should set status to cancelled', () => {
        expect(ticket.getProps().status.value).toBe(Status.cancelled().value);
      });
    });
  });

  describe('Given a triaged and assigned ticket', () => {
    let ticket: Ticket;

    beforeEach(() => {
      ticket = Ticket.create(validProps).unwrap();
      ticket.clearDomainEvents();
      ticket.triage(Priority.high()).unwrap();
      ticket.clearDomainEvents();
      ticket.assign('agent-1').unwrap();
      ticket.clearDomainEvents();
    });

    describe('When starting progress', () => {
      beforeEach(() => {
        ticket.startProgress().unwrap();
      });

      it('Then it should emit a TicketProgressStartedDomainEvent', () => {
        expect(ticket.domainEvents).toHaveLength(1);
        expect(ticket.domainEvents[0]).toBeInstanceOf(
          TicketProgressStartedDomainEvent,
        );
      });

      it('Then it should set status to in progress', () => {
        expect(ticket.getProps().status.value).toBe(Status.inProgress().value);
      });
    });
  });

  describe('Given an in-progress ticket', () => {
    let ticket: Ticket;

    beforeEach(() => {
      ticket = Ticket.create(validProps).unwrap();
      ticket.clearDomainEvents();
      ticket.triage(Priority.high()).unwrap();
      ticket.clearDomainEvents();
      ticket.assign('agent-1').unwrap();
      ticket.clearDomainEvents();
      ticket.startProgress().unwrap();
      ticket.clearDomainEvents();
    });

    describe('When blocking the ticket', () => {
      beforeEach(() => {
        ticket
          .block(BlockReason.create('Waiting for external dependency'))
          .unwrap();
      });

      it('Then it should emit a TicketBlockedDomainEvent', () => {
        expect(ticket.domainEvents).toHaveLength(1);
        expect(ticket.domainEvents[0]).toBeInstanceOf(TicketBlockedDomainEvent);
      });

      it('Then it should set status to blocked and save the block reason', () => {
        const props = ticket.getProps();

        expect(props.status.value).toBe(Status.blocked().value);
        expect(props.blockReason?.value).toBe(
          'Waiting for external dependency',
        );
      });
    });

    describe('When resolving the ticket', () => {
      beforeEach(() => {
        ticket.resolve().unwrap();
      });

      it('Then it should emit a TicketResolvedDomainEvent', () => {
        expect(ticket.domainEvents).toHaveLength(1);
        expect(ticket.domainEvents[0]).toBeInstanceOf(
          TicketResolvedDomainEvent,
        );
      });

      it('Then it should set status to done', () => {
        expect(ticket.getProps().status.value).toBe(Status.done().value);
      });
    });
  });

  describe('Given a done ticket', () => {
    let ticket: Ticket;

    beforeEach(() => {
      ticket = Ticket.create(validProps).unwrap();
      ticket.clearDomainEvents();
      ticket.triage(Priority.high()).unwrap();
      ticket.clearDomainEvents();
      ticket.assign('agent-1').unwrap();
      ticket.clearDomainEvents();
      ticket.startProgress().unwrap();
      ticket.clearDomainEvents();
      ticket.resolve().unwrap();
      ticket.clearDomainEvents();
    });

    describe('When reopening the ticket', () => {
      beforeEach(() => {
        ticket.reopen().unwrap();
      });

      it('Then it should emit a TicketReopenedDomainEvent', () => {
        expect(ticket.domainEvents).toHaveLength(1);
        expect(ticket.domainEvents[0]).toBeInstanceOf(
          TicketReopenedDomainEvent,
        );
      });

      it('Then it should set status to reopened and increment reopenCount', () => {
        const props = ticket.getProps();

        expect(props.status.value).toBe(Status.reopened().value);
        expect(props.reopenCount).toBe(1);
      });
    });

    describe('When reopening a ticket that was already reopened once', () => {
      it('Then it should fail because reopenCount is limited to one', () => {
        ticket.reopen().unwrap();

        const result = ticket.reopen();

        expect(result.isFailure()).toBe(true);
        expect(result.unwrapError().message).toBe(
          'Invalid ticket status transition: reopened -> reopened',
        );
      });
    });
  });

  describe('Given invalid ticket history or invalid state', () => {
    it('When loading a triaged ticket without a priority, Then validate should throw about priority', () => {
      const createdAt = '2024-01-01T00:00:00.000Z';
      const created = new TicketCreatedDomainEvent({
        aggregateId: 'ticket-err-1',
        reporterId: 'reporter-1',
        title: 'Fix login issue',
        description: 'Description',
        urgency: 'low',
        status: 'triaged',
        createdAt,
      });

      const ticket = new Ticket();

      expect(() => ticket.loadFromHistory([created])).toThrow(
        'Ticket priority must be set for triaged or progressed tickets',
      );
    });

    it('When loading an in-progress ticket without an assignee, Then validate currently throws about missing priority first', () => {
      const createdAt = '2024-01-01T00:00:00.000Z';
      const created = new TicketCreatedDomainEvent({
        aggregateId: 'ticket-err-2',
        reporterId: 'reporter-1',
        title: 'Fix login issue',
        description: 'Description',
        urgency: 'low',
        status: 'in_progress',
        createdAt,
      });

      const ticket = new Ticket();

      expect(() => ticket.loadFromHistory([created])).toThrow(
        'Ticket priority must be set for triaged or progressed tickets',
      );
    });

    it('When loading a blocked ticket without a block reason, Then validate currently throws about missing priority first', () => {
      const createdAt = '2024-01-01T00:00:00.000Z';
      const created = new TicketCreatedDomainEvent({
        aggregateId: 'ticket-err-3',
        reporterId: 'reporter-1',
        title: 'Fix login issue',
        description: 'Description',
        urgency: 'low',
        status: 'blocked',
        createdAt,
      });

      const ticket = new Ticket();

      expect(() => ticket.loadFromHistory([created])).toThrow(
        'Ticket priority must be set for triaged or progressed tickets',
      );
    });

    it('When loading a ticket with an empty reporterId, Then validate should throw about reporterId', () => {
      const createdAt = '2024-01-01T00:00:00.000Z';
      const created = new TicketCreatedDomainEvent({
        aggregateId: 'ticket-err-4',
        reporterId: '',
        title: 'Fix login issue',
        description: 'Description',
        urgency: 'low',
        status: 'open',
        createdAt,
      });

      const ticket = new Ticket();

      expect(() => ticket.loadFromHistory([created])).toThrow(
        'Ticket must have a reporterId',
      );
    });

    it('When loading a reopened ticket with reopenCount out of range, Then validate should throw about reopen count', () => {
      const createdAt = '2024-01-01T00:00:00.000Z';
      const created = new TicketCreatedDomainEvent({
        aggregateId: 'ticket-err-5',
        reporterId: 'reporter-1',
        title: 'Fix login issue',
        description: 'Description',
        urgency: 'low',
        status: 'open',
        createdAt,
      });

      const reopened = new TicketReopenedDomainEvent({
        aggregateId: 'ticket-err-5',
        status: 'reopened',
        reopenCount: 2,
      });

      const ticket = new Ticket();

      expect(() => ticket.loadFromHistory([created, reopened])).toThrow(
        'Ticket reopen count must be between 0 and 1',
      );
    });

    it('When loading an assigned event while status is open, Then validate should throw about assignee presence', () => {
      const createdAt = '2024-01-01T00:00:00.000Z';
      const created = new TicketCreatedDomainEvent({
        aggregateId: 'ticket-err-6',
        reporterId: 'reporter-1',
        title: 'Fix login issue',
        description: 'Description',
        urgency: 'low',
        status: 'open',
        createdAt,
      });

      const assigned = new TicketAssignedDomainEvent({
        aggregateId: 'ticket-err-6',
        assigneeId: 'agent-1',
      });

      const ticket = new Ticket();

      expect(() => ticket.loadFromHistory([created, assigned])).toThrow(
        'Ticket cannot have an assignee while status is OPEN',
      );
    });
  });
});

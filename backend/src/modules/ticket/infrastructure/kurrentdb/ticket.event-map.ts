import {
  TicketAssignedDomainEvent,
  TicketCreatedDomainEvent,
  TicketTriagedDomainEvent,
  TicketProgressStartedDomainEvent,
  TicketBlockedDomainEvent,
  TicketCancelledDomainEvent,
  TicketResolvedDomainEvent,
  TicketReopenedDomainEvent,
  TicketDetailsUpdatedDomainEvent,
} from '../../domain/events';

export const TicketEventMap = {
  TicketCreated: TicketCreatedDomainEvent,
  TicketAssigned: TicketAssignedDomainEvent,
  TicketTriaged: TicketTriagedDomainEvent,
  TicketProgressStarted: TicketProgressStartedDomainEvent,
  TicketBlocked: TicketBlockedDomainEvent,
  TicketCancelled: TicketCancelledDomainEvent,
  TicketResolved: TicketResolvedDomainEvent,
  TicketReopened: TicketReopenedDomainEvent,
  TicketDetailsUpdated: TicketDetailsUpdatedDomainEvent,
} as const;

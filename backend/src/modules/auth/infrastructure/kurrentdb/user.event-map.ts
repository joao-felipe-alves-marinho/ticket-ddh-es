import { UserRegisteredDomainEvent } from '../../domain/events';

export const UserEventMap = {
  UserRegistered: UserRegisteredDomainEvent,
} as const;

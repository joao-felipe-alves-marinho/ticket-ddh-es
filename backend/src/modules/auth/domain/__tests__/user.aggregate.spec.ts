import { User } from '../user.entity';
import { Email, Name, PasswordHash, Role } from '../value-objects';
import { UserRegisteredDomainEvent } from '../events/user-registered.domain-event';

describe('User Aggregate', () => {
  const buildValidProps = (role: Role = Role.reporter()) => ({
    name: Name.create('John Doe'),
    email: Email.create('john.doe@example.com'),
    role,
    passwordHash: PasswordHash.create(
      '$2b$12$abcdefghijklmnopqrstuv0123456789ABCDEFGHijklmnopqrstu',
    ),
  });

  describe('Given a valid registration', () => {
    let user: User;

    beforeEach(() => {
      user = User.register(buildValidProps()).unwrap();
    });

    it('When registering a user, Then it should emit exactly one uncommitted event', () => {
      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0]).toBeInstanceOf(UserRegisteredDomainEvent);
    });

    it('When registering a user, Then aggregate state should reflect the event data', () => {
      const props = user.getProps();

      expect(props.email.value).toBe('john.doe@example.com');
      expect(props.name.value).toBe('John Doe');
      expect(props.role.value).toBe('reporter');
      expect(user.isActive()).toBe(true);
    });

    it('When registering a user, Then version should be 0', () => {
      expect(user.version).toBe(0n);
    });

    it('When checking the role helpers, Then only reporter should match the reporter user', () => {
      expect(user.isReporter()).toBe(true);
      expect(user.isAgent()).toBe(false);
      expect(user.isManager()).toBe(false);
    });
  });

  describe('Given users with other roles', () => {
    it('When the role is agent, Then only isAgent should be true', () => {
      const user = User.register(buildValidProps(Role.agent())).unwrap();

      expect(user.isReporter()).toBe(false);
      expect(user.isAgent()).toBe(true);
      expect(user.isManager()).toBe(false);
    });

    it('When the role is manager, Then only isManager should be true', () => {
      const user = User.register(buildValidProps(Role.manager())).unwrap();

      expect(user.isReporter()).toBe(false);
      expect(user.isAgent()).toBe(false);
      expect(user.isManager()).toBe(true);
    });
  });

  describe('Given user history', () => {
    it('When loading a UserRegisteredDomainEvent, Then it should rebuild the full state', () => {
      const createdAt = '2024-01-01T00:00:00.000Z';
      const event = new UserRegisteredDomainEvent({
        aggregateId: 'user-1',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        passwordHash: '$2b$12$1234567890123456789012abcdefABCDEF1234567890abcd',
        role: 'agent',
        occurredAt: new Date(createdAt),
        createdAt,
      });

      const user = new User();
      user.loadFromHistory([event]);

      const props = user.getProps();

      expect(user.id).toBe('user-1');
      expect(user.createdAt.toISOString()).toBe(createdAt);
      expect(props.name.value).toBe('Jane Doe');
      expect(props.email.value).toBe('jane.doe@example.com');
      expect(props.passwordHash.value).toBe(
        '$2b$12$1234567890123456789012abcdefABCDEF1234567890abcd',
      );
      expect(props.role.value).toBe('agent');
      expect(user.version).toBe(0n);
      expect(user.domainEvents).toHaveLength(0);
    });

    it('When loading history, Then the aggregate should not add uncommitted events', () => {
      const user = new User();

      user.loadFromHistory([
        new UserRegisteredDomainEvent({
          aggregateId: 'user-2',
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          passwordHash:
            '$2b$12$1234567890123456789012abcdefABCDEF1234567890abcd',
          role: 'agent',
          occurredAt: new Date('2024-01-01T00:00:00.000Z'),
          createdAt: '2024-01-01T00:00:00.000Z',
        }),
      ]);

      expect(user.domainEvents).toHaveLength(0);
    });
  });

  describe('Given invalid registration data', () => {
    it('When registering with an invalid email, Then it should throw from the Email value object', () => {
      expect(() =>
        User.register({
          ...buildValidProps(),
          email: Email.create('invalid-email'),
        }),
      ).toThrow('User email must be a valid email address');
    });

    it('When registering with an invalid name, Then it should throw from the Name value object', () => {
      expect(() =>
        User.register({
          ...buildValidProps(),
          name: Name.create('Jo'),
        }),
      ).toThrow('User name must be between 3 and 150 characters');
    });

    it('When registering with an invalid role, Then it should throw from the Role value object', () => {
      expect(() =>
        User.register({
          ...buildValidProps(),
          role: Role.create('admin'),
        }),
      ).toThrow(
        'Invalid role: admin. Allowed values: reporter, agent, manager',
      );
    });

    it('When registering with an invalid password hash, Then it should throw from the PasswordHash value object', () => {
      expect(() =>
        User.register({
          ...buildValidProps(),
          passwordHash: PasswordHash.create(' '),
        }),
      ).toThrow('Value must be provided');
    });
  });
});

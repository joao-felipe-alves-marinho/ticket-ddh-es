import { Status } from '../status.value-object';

describe('Status Value Object', () => {
  describe('Given a valid status', () => {
    it('When creating a status with mixed case and spaces, Then should normalize to lowercase', () => {
      const status = Status.create('  In_Progress  ');

      expect(status.value).toBe('in_progress');
    });

    it('When using static status helpers, Then should create the expected values', () => {
      expect(Status.open().value).toBe('open');
      expect(Status.triaged().value).toBe('triaged');
      expect(Status.inProgress().value).toBe('in_progress');
      expect(Status.blocked().value).toBe('blocked');
      expect(Status.done().value).toBe('done');
      expect(Status.cancelled().value).toBe('cancelled');
      expect(Status.reopened().value).toBe('reopened');
    });
  });

  describe('Given an invalid status', () => {
    it('When creating an empty status, Then should throw ArgumentNotProvidedException', () => {
      expect(() => Status.create('')).toThrow(
        'Value object props must be provided',
      );
    });

    it('When creating a status outside the allowed list, Then should throw ArgumentInvalidException', () => {
      expect(() => Status.create('pending')).toThrow(
        'Invalid ticket status: pending. Allowed values: open, triaged, in_progress, blocked, done, cancelled, reopened',
      );
    });

    it('When creating a whitespace-only status, Then should throw ArgumentNotProvidedException', () => {
      expect(() => Status.create('   ')).toThrow(
        'Value object props must be provided',
      );
    });
  });

  describe('Given two status instances', () => {
    it('When comparing equal statuses, Then should be equal', () => {
      expect(Status.done()).toEqual(Status.create('done'));
    });

    it('When comparing different statuses, Then should not be equal', () => {
      expect(Status.open()).not.toEqual(Status.blocked());
    });
  });

  describe('Given a list of statuses', () => {
    it('When checking membership with isOneOf, Then should return true for matching status', () => {
      const currentStatus = Status.inProgress();

      expect(
        currentStatus.isOneOf([
          Status.open(),
          Status.inProgress(),
          Status.done(),
        ]),
      ).toBe(true);
    });

    it('When checking membership with isOneOf, Then should return false when no status matches', () => {
      const currentStatus = Status.cancelled();

      expect(
        currentStatus.isOneOf([
          Status.open(),
          Status.inProgress(),
          Status.done(),
        ]),
      ).toBe(false);
    });
  });
});

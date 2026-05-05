import { Priority } from '../priority.value-object';

describe('Priority Value Object', () => {
  describe('Given a valid priority', () => {
    it('When creating a priority with mixed case and spaces, Then should normalize to lowercase', () => {
      const priority = Priority.create('  HiGh  ');

      expect(priority.value).toBe('high');
    });

    it('When using static priority helpers, Then should create the expected values', () => {
      expect(Priority.low().value).toBe('low');
      expect(Priority.medium().value).toBe('medium');
      expect(Priority.high().value).toBe('high');
      expect(Priority.critical().value).toBe('critical');
    });
  });

  describe('Given an invalid priority', () => {
    it('When creating an empty priority, Then should throw ArgumentNotProvidedException', () => {
      expect(() => Priority.create('')).toThrow(
        'Value object props must be provided',
      );
    });

    it('When creating a priority outside the allowed list, Then should throw ArgumentInvalidException', () => {
      expect(() => Priority.create('urgent')).toThrow(
        'Invalid ticket priority: urgent. Allowed values: low, medium, high, critical',
      );
    });

    it('When creating a whitespace-only priority, Then should throw ArgumentNotProvidedException', () => {
      expect(() => Priority.create('   ')).toThrow(
        'Value object props must be provided',
      );
    });
  });

  describe('Given two priority instances', () => {
    it('When comparing equal priorities, Then should be equal', () => {
      expect(Priority.high()).toEqual(Priority.create('high'));
    });

    it('When comparing different priorities, Then should not be equal', () => {
      expect(Priority.low()).not.toEqual(Priority.critical());
    });
  });
});

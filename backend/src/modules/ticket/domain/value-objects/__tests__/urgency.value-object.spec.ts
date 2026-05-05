import { Urgency } from '../urgency.value-object';

describe('Urgency Value Object', () => {
  describe('Given a valid urgency', () => {
    it('When creating an urgency with mixed case and spaces, Then should normalize to lowercase', () => {
      const urgency = Urgency.create('  HiGh  ');

      expect(urgency.value).toBe('high');
    });

    it('When using static urgency helpers, Then should create the expected values', () => {
      expect(Urgency.low().value).toBe('low');
      expect(Urgency.medium().value).toBe('medium');
      expect(Urgency.high().value).toBe('high');
    });
  });

  describe('Given an invalid urgency', () => {
    it('When creating an empty urgency, Then should throw ArgumentNotProvidedException', () => {
      expect(() => Urgency.create('')).toThrow(
        'Value object props must be provided',
      );
    });

    it('When creating an urgency outside the allowed list, Then should throw ArgumentInvalidException', () => {
      expect(() => Urgency.create('critical')).toThrow(
        'Invalid ticket urgency: critical. Allowed values: low, medium, high',
      );
    });

    it('When creating a whitespace-only urgency, Then should throw ArgumentNotProvidedException', () => {
      expect(() => Urgency.create('   ')).toThrow(
        'Value object props must be provided',
      );
    });
  });

  describe('Given two urgency instances', () => {
    it('When comparing equal urgencies, Then should be equal', () => {
      expect(Urgency.medium()).toEqual(Urgency.create('medium'));
    });

    it('When comparing different urgencies, Then should not be equal', () => {
      expect(Urgency.low()).not.toEqual(Urgency.high());
    });
  });
});

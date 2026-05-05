import { Description } from '../description.value-object';

describe('Description Value Object', () => {
  describe('Given a valid description', () => {
    it('When creating a description with leading and trailing spaces, Then should trim and create successfully', () => {
      const description = Description.create(
        '  Ticket details and reproduction steps  ',
      );

      expect(description.value).toBe('Ticket details and reproduction steps');
    });

    it('When creating a description with 2000 characters, Then should create successfully', () => {
      const maxDescription = 'A'.repeat(2000);

      const description = Description.create(maxDescription);

      expect(description.value).toBe(maxDescription);
    });
  });

  describe('Given an invalid description', () => {
    it('When creating an empty description, Then should throw ArgumentNotProvidedException', () => {
      expect(() => Description.create('')).toThrow(
        'Value object props must be provided',
      );
    });

    it('When creating a description with only spaces, Then should throw ArgumentNotProvidedException', () => {
      expect(() => Description.create('   ')).toThrow(
        'Value object props must be provided',
      );
    });

    it('When creating a description longer than 2000 characters, Then should throw ArgumentOutOfRangeException', () => {
      expect(() => Description.create('A'.repeat(2001))).toThrow(
        'Ticket description must be between 1 and 2000 characters',
      );
    });
  });

  describe('Given two description instances', () => {
    it('When comparing equal descriptions, Then should be equal', () => {
      const firstDescription = Description.create('Same description');
      const secondDescription = Description.create('Same description');

      expect(firstDescription).toEqual(secondDescription);
    });

    it('When comparing different descriptions, Then should not be equal', () => {
      expect(Description.create('First description')).not.toEqual(
        Description.create('Second description'),
      );
    });
  });
});

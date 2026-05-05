import { Name } from '../name.value-object';

describe('Name Value Object', () => {
  describe('Given a valid name', () => {
    it('When creating a name with valid text, Then should create successfully', () => {
      const validName = 'John Doe';

      const name = Name.create(validName);

      expect(name.value).toBe(validName);
    });

    it('When creating a name with leading and trailing spaces, Then should trim and create successfully', () => {
      const name = Name.create('  John Doe  ');

      expect(name.value).toBe('John Doe');
    });

    it('When creating a name with 150 characters, Then should create successfully', () => {
      const maxName = 'A'.repeat(150);

      const name = Name.create(maxName);

      expect(name.value).toBe(maxName);
    });
  });

  describe('Given an invalid name', () => {
    it('When creating a name shorter than 3 characters, Then should throw ArgumentOutOfRangeException', () => {
      expect(() => Name.create('Jo')).toThrow(
        'User name must be between 3 and 150 characters',
      );
    });

    it('When creating a name longer than 150 characters, Then should throw ArgumentOutOfRangeException', () => {
      expect(() => Name.create('A'.repeat(151))).toThrow(
        'User name must be between 3 and 150 characters',
      );
    });

    it('When creating an empty name, Then should throw ArgumentNotProvidedException', () => {
      expect(() => Name.create('')).toThrow(
        'Value object props must be provided',
      );
    });

    it('When creating a name with only spaces, Then should throw ArgumentNotProvidedException', () => {
      expect(() => Name.create('   ')).toThrow(
        'Value object props must be provided',
      );
    });
  });

  describe('Given two name instances', () => {
    it('When comparing equal names, Then should be equal', () => {
      const firstName = Name.create('John Doe');
      const secondName = Name.create('John Doe');

      expect(firstName).toEqual(secondName);
    });

    it('When comparing different names, Then should not be equal', () => {
      const firstName = Name.create('John Doe');
      const secondName = Name.create('Jane Doe');

      expect(firstName).not.toEqual(secondName);
    });
  });
});

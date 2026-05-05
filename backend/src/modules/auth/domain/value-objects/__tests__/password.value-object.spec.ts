import { Password } from '../password.value-object';

describe('Password Value Object', () => {
  describe('Given a valid password', () => {
    it('When creating a password with required complexity, Then should create successfully', () => {
      const validPassword = 'Password1!';

      const password = Password.create(validPassword);

      expect(password.value).toBe(validPassword);
    });

    it('When creating a password with 128 characters and required complexity, Then should create successfully', () => {
      const maxPassword = `Aa1!${'b'.repeat(124)}`;

      const password = Password.create(maxPassword);

      expect(password.value).toBe(maxPassword);
    });
  });

  describe('Given an invalid password', () => {
    it('When creating a password shorter than 8 characters, Then should throw ArgumentOutOfRangeException', () => {
      expect(() => Password.create('Aa1!bcd')).toThrow(
        'User password must be between 8 and 128 characters',
      );
    });

    it('When creating a password longer than 128 characters, Then should throw ArgumentOutOfRangeException', () => {
      expect(() => Password.create(`Aa1!${'b'.repeat(125)}`)).toThrow(
        'User password must be between 8 and 128 characters',
      );
    });

    it('When creating a password missing uppercase letters, Then should throw ArgumentInvalidException', () => {
      expect(() => Password.create('password1!')).toThrow(
        'User password must contain uppercase, lowercase, number and special character',
      );
    });

    it('When creating a password missing lowercase letters, Then should throw ArgumentInvalidException', () => {
      expect(() => Password.create('PASSWORD1!')).toThrow(
        'User password must contain uppercase, lowercase, number and special character',
      );
    });

    it('When creating a password missing numbers, Then should throw ArgumentInvalidException', () => {
      expect(() => Password.create('Password!')).toThrow(
        'User password must contain uppercase, lowercase, number and special character',
      );
    });

    it('When creating a password missing special characters, Then should throw ArgumentInvalidException', () => {
      expect(() => Password.create('Password1')).toThrow(
        'User password must contain uppercase, lowercase, number and special character',
      );
    });

    it('When creating an empty password, Then should throw ArgumentNotProvidedException', () => {
      expect(() => Password.create('')).toThrow(
        'Value object props must be provided',
      );
    });
  });

  describe('Given two password instances', () => {
    it('When comparing equal passwords, Then should be equal', () => {
      const firstPassword = Password.create('Password1!');
      const secondPassword = Password.create('Password1!');

      expect(firstPassword).toEqual(secondPassword);
    });

    it('When comparing different passwords, Then should not be equal', () => {
      const firstPassword = Password.create('Password1!');
      const secondPassword = Password.create('Password2!');

      expect(firstPassword).not.toEqual(secondPassword);
    });
  });
});

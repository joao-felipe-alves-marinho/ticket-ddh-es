import { Email } from '../email.value-object';

describe('Email Value Object', () => {
  describe('Given a valid email', () => {
    it('When creating an email with valid format, Then should create successfully', () => {
      const validEmail = 'user@example.com';

      const email = Email.create(validEmail);

      expect(email.value).toBe(validEmail);
    });

    it('When creating an email with uppercase letters, Then should create successfully', () => {
      const validEmail = 'USER@EXAMPLE.COM';

      const email = Email.create(validEmail);

      expect(email.value).toBe(validEmail);
    });

    it('When creating an email with leading/trailing spaces, Then should trim and create successfully', () => {
      const emailWithSpaces = '  user@example.com  ';
      const expectedEmail = 'user@example.com';

      const email = Email.create(emailWithSpaces);

      expect(email.value).toBe(expectedEmail);
    });

    it('When creating emails with valid special characters, Then should create successfully', () => {
      const validEmails = [
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example.com',
        'user-name@example.com',
        '123@example.com',
      ];

      validEmails.forEach((validEmail) => {
        const email = Email.create(validEmail);
        expect(email.value).toBe(validEmail);
      });
    });

    it('When creating an email with minimum valid length (3 chars), Then should create successfully', () => {
      const minEmail = 'a@b.c';

      const email = Email.create(minEmail);

      expect(email.value).toBe(minEmail);
    });

    it('When creating an email with maximum valid length (150 chars), Then should create successfully', () => {
      const maxEmail = 'a'.repeat(135) + '@example.com'; // 135 + 1 + 7 + 3 = 146 chars (within 150)

      const email = Email.create(maxEmail);

      expect(email.value).toBe(maxEmail);
    });
  });

  describe('Given an invalid email', () => {
    it('When creating an email shorter than 3 characters, Then should throw ArgumentOutOfRangeException', () => {
      const shortEmail = 'a@';

      expect(() => Email.create(shortEmail)).toThrow(
        'User email must be between 3 and 150 characters',
      );
    });

    it('When creating an email longer than 150 characters, Then should throw ArgumentOutOfRangeException', () => {
      const longEmail = 'a'.repeat(145) + '@example.com'; // Exceeds 150 chars

      expect(() => Email.create(longEmail)).toThrow(
        'User email must be between 3 and 150 characters',
      );
    });

    it('When creating an email without @ symbol, Then should throw ArgumentInvalidException', () => {
      const emailWithoutAt = 'userexample.com';

      expect(() => Email.create(emailWithoutAt)).toThrow(
        'User email must be a valid email address',
      );
    });

    it('When creating an email without domain, Then should throw ArgumentInvalidException', () => {
      const emailWithoutDomain = 'user@';

      expect(() => Email.create(emailWithoutDomain)).toThrow(
        'User email must be a valid email address',
      );
    });

    it('When creating an email without local part, Then should throw ArgumentInvalidException', () => {
      const emailWithoutLocal = '@example.com';

      expect(() => Email.create(emailWithoutLocal)).toThrow(
        'User email must be a valid email address',
      );
    });

    it('When creating an email without dot in domain, Then should throw ArgumentInvalidException', () => {
      const emailWithoutDot = 'user@examplecom';

      expect(() => Email.create(emailWithoutDot)).toThrow(
        'User email must be a valid email address',
      );
    });

    it('When creating an email with space in local part, Then should throw ArgumentInvalidException', () => {
      const emailWithSpace = 'user name@example.com';

      expect(() => Email.create(emailWithSpace)).toThrow(
        'User email must be a valid email address',
      );
    });

    it('When creating an email with space in domain, Then should throw ArgumentInvalidException', () => {
      const emailWithSpaceInDomain = 'user@exam ple.com';

      expect(() => Email.create(emailWithSpaceInDomain)).toThrow(
        'User email must be a valid email address',
      );
    });

    it('When creating an email with multiple @ symbols, Then should throw ArgumentInvalidException', () => {
      const emailWithMultipleAts = 'user@@example.com';

      expect(() => Email.create(emailWithMultipleAts)).toThrow(
        'User email must be a valid email address',
      );
    });

    it('When creating an empty email, Then should throw ArgumentNotProvidedException', () => {
      const emptyEmail = '';

      expect(() => Email.create(emptyEmail)).toThrow(
        'Value object props must be provided',
      );
    });

    it('When creating an email with only spaces, Then should throw ArgumentNotProvidedException', () => {
      const spacesOnlyEmail = '   ';

      expect(() => Email.create(spacesOnlyEmail)).toThrow(
        'Value object props must be provided',
      );
    });
  });

  describe('Given two email instances', () => {
    it('When comparing two emails with same value, Then should be equal', () => {
      const email1 = Email.create('user@example.com');
      const email2 = Email.create('user@example.com');

      expect(email1).toEqual(email2);
    });

    it('When comparing two emails with different values, Then should not be equal', () => {
      const email1 = Email.create('user1@example.com');
      const email2 = Email.create('user2@example.com');

      expect(email1).not.toEqual(email2);
    });

    it('When accessing value property multiple times, Then should return consistent value', () => {
      const email = Email.create('user@example.com');

      const firstAccess = email.value;
      const secondAccess = email.value;

      expect(firstAccess).toBe(secondAccess);
      expect(firstAccess).toBe('user@example.com');
    });
  });
});

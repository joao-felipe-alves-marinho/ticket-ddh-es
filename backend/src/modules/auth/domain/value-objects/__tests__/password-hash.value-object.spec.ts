import { PasswordHash } from '../password-hash.value-object';

describe('PasswordHash Value Object', () => {
  describe('Given a valid password hash', () => {
    it('When creating a hash with leading and trailing spaces, Then should preserve the original value and create successfully', () => {
      const rawHash =
        '  $2b$12$abcdefghijklmnopqrstuv0123456789ABCDEFGHijklmnopqrstu  ';

      const hash = PasswordHash.create(rawHash);

      expect(hash.value).toBe(rawHash);
    });

    it('When creating a hash with 2000 characters, Then should create successfully', () => {
      const maxHash = 'a'.repeat(2000);

      const hash = PasswordHash.create(maxHash);

      expect(hash.value).toBe(maxHash);
    });
  });

  describe('Given an invalid password hash', () => {
    it('When creating an empty hash, Then should throw ArgumentNotProvidedException', () => {
      expect(() => PasswordHash.create('')).toThrow(
        'Value object props must be provided',
      );
    });

    it('When creating a hash with only spaces, Then should throw Value must be provided', () => {
      expect(() => PasswordHash.create('   ')).toThrow(
        'Value must be provided',
      );
    });

    it('When creating a hash longer than 2000 characters, Then should throw ArgumentOutOfRangeException', () => {
      expect(() => PasswordHash.create('a'.repeat(2001))).toThrow(
        'User password hash must be present and a reasonable length',
      );
    });
  });

  describe('Given two password hash instances', () => {
    it('When comparing equal hashes, Then should be equal', () => {
      const firstHash = PasswordHash.create('hash-value');
      const secondHash = PasswordHash.create('hash-value');

      expect(firstHash).toEqual(secondHash);
    });

    it('When comparing different hashes, Then should not be equal', () => {
      const firstHash = PasswordHash.create('hash-value-1');
      const secondHash = PasswordHash.create('hash-value-2');

      expect(firstHash).not.toEqual(secondHash);
    });
  });
});

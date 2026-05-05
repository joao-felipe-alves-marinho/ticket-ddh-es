import { Role } from '../role.value-object';

describe('Role Value Object', () => {
  describe('Given a valid role', () => {
    it('When creating a role with mixed case and spaces, Then should normalize to lowercase', () => {
      const role = Role.create('  RePorTer  ');

      expect(role.value).toBe('reporter');
    });

    it('When creating predefined roles, Then should create successfully', () => {
      expect(Role.reporter().value).toBe('reporter');
      expect(Role.agent().value).toBe('agent');
      expect(Role.manager().value).toBe('manager');
    });
  });

  describe('Given an invalid role', () => {
    it('When creating an empty role, Then should throw ArgumentNotProvidedException', () => {
      expect(() => Role.create('')).toThrow(
        'Value object props must be provided',
      );
    });

    it('When creating a role outside the allowed list, Then should throw ArgumentInvalidException', () => {
      expect(() => Role.create('admin')).toThrow(
        'Invalid role: admin. Allowed values: reporter, agent, manager',
      );
    });

    it('When creating a role with whitespace only, Then should throw ArgumentNotProvidedException', () => {
      expect(() => Role.create('   ')).toThrow(
        'Value object props must be provided',
      );
    });
  });

  describe('Given two role instances', () => {
    it('When comparing equal roles, Then should be equal', () => {
      const firstRole = Role.agent();
      const secondRole = Role.create('agent');

      expect(firstRole).toEqual(secondRole);
    });

    it('When comparing different roles, Then should not be equal', () => {
      expect(Role.reporter()).not.toEqual(Role.manager());
    });
  });
});

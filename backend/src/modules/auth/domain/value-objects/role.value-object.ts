import { DomainPrimitive, ValueObject } from 'src/shared/domain';
import { ArgumentInvalidException } from 'src/shared/common/exceptions';

export const ROLES = ['reporter', 'agent', 'manager'] as const;

export type UserRole = (typeof ROLES)[number];

export class Role extends ValueObject<UserRole> {
  static create(role: string): Role {
    const normalizedRole = (role || '').toString().trim().toLowerCase();
    return new Role({ value: normalizedRole as UserRole });
  }

  get value(): UserRole {
    return this.props.value;
  }

  static reporter(): Role {
    return Role.create('reporter');
  }

  static agent(): Role {
    return Role.create('agent');
  }

  static manager(): Role {
    return Role.create('manager');
  }

  protected validate(props: DomainPrimitive<UserRole>): void {
    if (!ROLES.includes(props.value)) {
      throw new ArgumentInvalidException(
        `Invalid role: ${props.value}. Allowed values: ${ROLES.join(', ')}`,
      );
    }
  }
}

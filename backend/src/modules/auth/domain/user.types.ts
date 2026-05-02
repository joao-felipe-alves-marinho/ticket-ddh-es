import { Name, Email, Role, PasswordHash } from './value-objects';

export interface CreateUserProps {
  name: Name;
  email: Email;
  role: Role;
  passwordHash: PasswordHash;
}

export type UserProps = CreateUserProps;

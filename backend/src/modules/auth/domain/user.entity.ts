import { AggregateRoot } from 'src/shared/domain';
import { CreateUserProps, UserProps } from './user.types';
import { Result } from 'src/shared/common/result';
import { randomUUID } from 'crypto';
import { Email, Name, PasswordHash, Role } from './value-objects';
import { UserRegisteredDomainEvent } from './events';

export class User extends AggregateRoot<UserProps> {
  static register(props: CreateUserProps): Result<User, never> {
    const id = randomUUID();

    const user = new User();

    user.apply(
      new UserRegisteredDomainEvent({
        aggregateId: id,
        name: props.name.value,
        email: props.email.value,
        passwordHash: props.passwordHash.value,
        role: props.role.value,
        createdAt: new Date().toISOString(),
      }),
    );

    return Result.success(user);
  }

  public isReporter(): boolean {
    return this.props.role.equals(Role.reporter());
  }

  public isAgent(): boolean {
    return this.props.role.equals(Role.agent());
  }

  public isManager(): boolean {
    return this.props.role.equals(Role.manager());
  }

  public isActive(): boolean {
    return true;
  }

  private onUserRegistered(event: UserRegisteredDomainEvent): void {
    this._id = event.aggregateId;
    this._createdAt = event.occurredAt;
    const props: UserProps = {
      name: Name.create(event.name),
      email: Email.create(event.email),
      passwordHash: PasswordHash.create(event.passwordHash),
      role: Role.create(event.role),
    };
    this.validateProps(props);
    this.props = props;
    this.validate();
  }

  public validate(): void {}
}

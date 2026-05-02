import { DomainEvent, DomainEventProps } from 'src/shared/domain';

export class UserRegisteredDomainEvent extends DomainEvent {
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: string;
  readonly createdAt: string;

  constructor(props: DomainEventProps<UserRegisteredDomainEvent>) {
    super(props);
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.createdAt = props.createdAt;
  }
}

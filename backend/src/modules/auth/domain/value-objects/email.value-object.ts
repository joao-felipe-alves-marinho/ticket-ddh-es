import { DomainPrimitive, ValueObject } from 'src/shared/domain';
import { Guard } from 'src/shared/common/guard';
import {
  ArgumentInvalidException,
  ArgumentOutOfRangeException,
} from 'src/shared/common/exceptions';

export class Email extends ValueObject<string> {
  static create(email: string): Email {
    return new Email({ value: email.trim() });
  }

  get value(): string {
    return this.props.value;
  }

  protected validate(props: DomainPrimitive<string>): void {
    const normalizedEmail = props.value.trim();

    if (!Guard.lengthIsBetween(normalizedEmail, 3, 150)) {
      throw new ArgumentOutOfRangeException(
        'User email must be between 3 and 150 characters',
      );
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      throw new ArgumentInvalidException(
        'User email must be a valid email address',
      );
    }
  }
}

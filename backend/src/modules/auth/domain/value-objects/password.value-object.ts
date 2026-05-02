import { DomainPrimitive, ValueObject } from 'src/shared/domain';
import { Guard } from 'src/shared/common/guard';
import {
  ArgumentInvalidException,
  ArgumentOutOfRangeException,
} from 'src/shared/common/exceptions';

export class Password extends ValueObject<string> {
  static create(password: string): Password {
    return new Password({ value: password });
  }

  get value(): string {
    return this.props.value;
  }

  protected validate(props: DomainPrimitive<string>): void {
    const pwd = props.value;

    if (!Guard.lengthIsBetween(pwd, 8, 128)) {
      throw new ArgumentOutOfRangeException(
        'User password must be between 8 and 128 characters',
      );
    }

    const COMPLEXITY_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/;

    if (!COMPLEXITY_REGEX.test(pwd)) {
      throw new ArgumentInvalidException(
        'User password must contain uppercase, lowercase, number and special character',
      );
    }
  }
}

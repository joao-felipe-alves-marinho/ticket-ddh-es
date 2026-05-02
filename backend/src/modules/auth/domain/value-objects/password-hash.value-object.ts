import { DomainPrimitive, ValueObject } from 'src/shared/domain';
import { Guard } from 'src/shared/common/guard';
import { ArgumentOutOfRangeException } from 'src/shared/common/exceptions';

export class PasswordHash extends ValueObject<string> {
  static create(hash: string): PasswordHash {
    return new PasswordHash({ value: hash });
  }

  get value(): string {
    return this.props.value;
  }

  protected validate(props: DomainPrimitive<string>): void {
    const h = props.value.trim();
    if (!Guard.lengthIsBetween(h, 1, 2000)) {
      throw new ArgumentOutOfRangeException(
        'User password hash must be present and a reasonable length',
      );
    }
  }
}

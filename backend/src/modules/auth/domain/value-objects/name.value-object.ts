import { DomainPrimitive, ValueObject } from 'src/shared/domain';
import { Guard } from 'src/shared/common/guard';
import { ArgumentOutOfRangeException } from 'src/shared/common/exceptions';

export class Name extends ValueObject<string> {
  static create(name: string): Name {
    return new Name({ value: name.trim() });
  }

  get value(): string {
    return this.props.value;
  }

  protected validate(props: DomainPrimitive<string>): void {
    const normalizedName = props.value.trim();

    if (!Guard.lengthIsBetween(normalizedName, 3, 150)) {
      throw new ArgumentOutOfRangeException(
        'User name must be between 3 and 150 characters',
      );
    }
  }
}

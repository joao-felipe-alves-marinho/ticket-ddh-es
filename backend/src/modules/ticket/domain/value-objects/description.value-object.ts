import { DomainPrimitive, ValueObject } from 'src/lib/ddd';
import { Guard } from 'src/lib/common/guard';
import { ArgumentInvalidException } from 'src/lib/common/exceptions';

export class Description extends ValueObject<string> {
  static create(description: string): Description {
    return new Description({ value: description.trim() });
  }

  get value(): string {
    return this.props.value;
  }

  protected validate(props: DomainPrimitive<string>): void {
    const normalizedDescription = props.value.trim();

    if (!Guard.lengthIsBetween(normalizedDescription, 1, 2000)) {
      throw new ArgumentInvalidException(
        `Ticket description must be between 1 and 2000 characters`,
      );
    }
  }
}

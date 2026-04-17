import { DomainPrimitive, ValueObject } from 'src/lib/ddd';
import { Guard } from 'src/lib/common/guard';
import { ArgumentInvalidException } from 'src/lib/common/exceptions';

export class Title extends ValueObject<string> {
  static create(title: string): Title {
    return new Title({ value: title.trim() });
  }

  get value(): string {
    return this.props.value;
  }

  protected validate(props: DomainPrimitive<string>): void {
    const normalizedTitle = props.value.trim();

    if (!Guard.lengthIsBetween(normalizedTitle, 3, 150)) {
      throw new ArgumentInvalidException(
        'Ticket title must be between 3 and 150 characters',
      );
    }
  }
}

import { DomainPrimitive, ValueObject } from 'src/lib/ddd';
import { Guard } from 'src/lib/common/guard';
import { ArgumentInvalidException } from 'src/lib/common/exceptions';

export class BlockReason extends ValueObject<string> {
  static create(reason: string): BlockReason {
    return new BlockReason({ value: reason.trim() });
  }

  get value(): string {
    return this.props.value;
  }

  protected validate(props: DomainPrimitive<string>): void {
    const normalizedReason = props.value.trim();

    if (!Guard.lengthIsBetween(normalizedReason, 3, 500)) {
      throw new ArgumentInvalidException(
        `Block reason must be between 3 and 500 characters`,
      );
    }
  }
}

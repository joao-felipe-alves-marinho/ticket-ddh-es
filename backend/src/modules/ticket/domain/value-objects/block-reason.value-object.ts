import { DomainPrimitive, ValueObject } from 'src/shared/domain';
import { Guard } from 'src/shared/common/guard';
import { ArgumentOutOfRangeException } from 'src/shared/common/exceptions';

export class BlockReason extends ValueObject<string> {
  static create(blockReason: string): BlockReason {
    return new BlockReason({ value: blockReason.trim() });
  }

  get value(): string {
    return this.props.value;
  }

  protected validate(props: DomainPrimitive<string>): void {
    const normalizedReason = props.value.trim();

    if (!Guard.lengthIsBetween(normalizedReason, 3, 500)) {
      throw new ArgumentOutOfRangeException(
        `Block reason must be between 3 and 500 characters`,
      );
    }
  }
}

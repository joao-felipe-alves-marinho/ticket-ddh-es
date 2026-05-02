import { ArgumentInvalidException } from 'src/shared/common/exceptions';
import { DomainPrimitive, ValueObject } from 'src/shared/domain';

export const ALLOWED_PRIORITIES = [
  'low',
  'medium',
  'high',
  'critical',
] as const;

export type TicketPriority = (typeof ALLOWED_PRIORITIES)[number];

export class Priority extends ValueObject<TicketPriority> {
  static create(priority: string): Priority {
    const normalizedPriority = priority.trim().toLowerCase();

    return new Priority({
      value: normalizedPriority as TicketPriority,
    });
  }

  static low(): Priority {
    return new Priority({ value: 'low' });
  }

  static medium(): Priority {
    return new Priority({ value: 'medium' });
  }

  static high(): Priority {
    return new Priority({ value: 'high' });
  }

  static critical(): Priority {
    return new Priority({ value: 'critical' });
  }

  get value(): TicketPriority {
    return this.props.value;
  }

  protected validate(props: DomainPrimitive<TicketPriority>): void {
    if (!ALLOWED_PRIORITIES.includes(props.value)) {
      throw new ArgumentInvalidException(
        `Invalid ticket priority: ${props.value}. Allowed values: ${ALLOWED_PRIORITIES.join(', ')}`,
      );
    }
  }
}

import { ArgumentInvalidException } from 'src/lib/common/exceptions';
import { DomainPrimitive, ValueObject } from 'src/lib/ddd';

const ALLOWED_URGENCIES = ['low', 'medium', 'high'] as const;

export type TicketUrgency = (typeof ALLOWED_URGENCIES)[number];

export class Urgency extends ValueObject<TicketUrgency> {
  static create(urgency: string): Urgency {
    const normalizedUrgency = urgency.trim().toLowerCase();

    return new Urgency({
      value: normalizedUrgency as TicketUrgency,
    });
  }

  static low(): Urgency {
    return new Urgency({ value: 'low' });
  }

  static medium(): Urgency {
    return new Urgency({ value: 'medium' });
  }

  static high(): Urgency {
    return new Urgency({ value: 'high' });
  }

  get value(): TicketUrgency {
    return this.props.value;
  }

  protected validate(props: DomainPrimitive<TicketUrgency>): void {
    if (!ALLOWED_URGENCIES.includes(props.value)) {
      throw new ArgumentInvalidException(
        `Invalid ticket urgency: ${props.value}. Allowed values: ${ALLOWED_URGENCIES.join(', ')}`,
      );
    }
  }
}

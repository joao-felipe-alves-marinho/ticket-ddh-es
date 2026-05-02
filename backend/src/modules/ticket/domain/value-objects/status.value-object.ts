import { ArgumentInvalidException } from 'src/shared/common/exceptions';
import { DomainPrimitive, ValueObject } from 'src/shared/domain';

export const ALLOWED_STATUSES = [
  'open',
  'triaged',
  'in_progress',
  'blocked',
  'done',
  'cancelled',
  'reopened',
] as const;

export type TicketStatus = (typeof ALLOWED_STATUSES)[number];

export class Status extends ValueObject<TicketStatus> {
  static create(status: string): Status {
    const normalizedStatus = status.trim().toLowerCase();

    return new Status({
      value: normalizedStatus as TicketStatus,
    });
  }

  static open(): Status {
    return new Status({ value: 'open' });
  }

  static triaged(): Status {
    return new Status({ value: 'triaged' });
  }

  static inProgress(): Status {
    return new Status({ value: 'in_progress' });
  }

  static blocked(): Status {
    return new Status({ value: 'blocked' });
  }

  static done(): Status {
    return new Status({ value: 'done' });
  }

  static cancelled(): Status {
    return new Status({ value: 'cancelled' });
  }

  static reopened(): Status {
    return new Status({ value: 'reopened' });
  }

  get value(): TicketStatus {
    return this.props.value;
  }

  isOneOf(statuses: readonly Status[]): boolean {
    return statuses.some((status) => status.equals(this));
  }

  protected validate(props: DomainPrimitive<TicketStatus>): void {
    if (!ALLOWED_STATUSES.includes(props.value)) {
      throw new ArgumentInvalidException(
        `Invalid ticket status: ${props.value}. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
      );
    }
  }
}

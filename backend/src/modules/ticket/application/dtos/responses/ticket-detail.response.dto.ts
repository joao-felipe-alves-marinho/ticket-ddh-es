import { ApiProperty } from '@nestjs/swagger';
import {
  ALLOWED_PRIORITIES,
  ALLOWED_STATUSES,
  ALLOWED_URGENCIES,
} from 'src/modules/ticket/domain/value-objects';
import type {
  TicketPriority,
  TicketStatus,
  TicketUrgency,
} from 'src/modules/ticket/domain/value-objects';

export class TicketDetailResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Ticket ID',
  })
  id!: string;

  @ApiProperty({
    example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    description: 'Reporter user ID',
  })
  reporterId!: string;

  @ApiProperty({
    example: 'Ticket title',
    description: 'Ticket title',
  })
  title!: string;

  @ApiProperty({
    example: 'Detailed description of the issue',
    description: 'Ticket description',
  })
  description!: string;

  @ApiProperty({
    example: 'low',
    enum: ALLOWED_URGENCIES,
    description: 'Initial urgency reported by reporter',
  })
  urgency!: TicketUrgency;

  @ApiProperty({
    example: 'medium',
    enum: ALLOWED_PRIORITIES,
    description: 'Priority assigned during triage',
    required: false,
  })
  priority!: TicketPriority;

  @ApiProperty({
    example: 'open',
    enum: ALLOWED_STATUSES,
    description: 'Current status of the ticket',
  })
  status!: TicketStatus;

  @ApiProperty({
    example: '7c9e6679-7425-40de-944b-e07fc1f90ae8',
    description: 'Assignee user ID',
    required: false,
  })
  assigneeId?: string;

  @ApiProperty({
    example: 'Waiting for customer feedback',
    description: 'Reason for blocking',
    required: false,
  })
  blockReason?: string;

  @ApiProperty({
    example: 0,
    description: 'Number of times ticket has been reopened (0 or 1)',
  })
  reopenCount!: number;

  @ApiProperty({
    example: '2026-05-01T12:00:00Z',
    description: 'Timestamp when ticket was created',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2026-05-01T13:00:00Z',
    description: 'Timestamp when ticket was last updated',
  })
  updatedAt!: string;
}

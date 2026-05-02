import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { ALLOWED_URGENCIES } from 'src/modules/ticket/domain/value-objects';
import type { TicketUrgency } from 'src/modules/ticket/domain/value-objects';

export class CreateTicketRequestDto {
  @ApiProperty({
    example: 'Ticket title',
    minLength: 3,
    maxLength: 150,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title!: string;

  @ApiProperty({
    example: 'Detailed description of the issue',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description!: string;

  @ApiProperty({
    example: 'low | medium | high',
    enum: ALLOWED_URGENCIES,
  })
  @IsEnum(ALLOWED_URGENCIES)
  urgency: TicketUrgency = 'low';
}

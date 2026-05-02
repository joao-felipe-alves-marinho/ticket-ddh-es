import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ALLOWED_URGENCIES } from 'src/modules/ticket/domain/value-objects';
import type { TicketUrgency } from 'src/modules/ticket/domain/value-objects';

export class UpdateTicketDetailsRequestDto {
  @ApiProperty({
    example: 'Updated ticket title',
    minLength: 3,
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title?: string;

  @ApiProperty({
    example: 'Updated detailed description',
    minLength: 1,
    maxLength: 2000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    example: 'low | medium | high | critical',
    enum: ALLOWED_URGENCIES,
    required: false,
  })
  @IsOptional()
  @IsEnum(ALLOWED_URGENCIES)
  urgency?: TicketUrgency;
}

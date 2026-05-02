import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ALLOWED_PRIORITIES } from 'src/modules/ticket/domain/value-objects';
import type { TicketPriority } from 'src/modules/ticket/domain/value-objects';

export class TriageTicketRequestDto {
  @ApiProperty({
    example: 'low | medium | high | critical',
    enum: ALLOWED_PRIORITIES,
  })
  @IsEnum(ALLOWED_PRIORITIES)
  priority: TicketPriority = 'low';
}

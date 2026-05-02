import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class BlockTicketRequestDto {
  @ApiProperty({
    example: 'Waiting for customer feedback',
    minLength: 1,
    maxLength: 500,
    description: 'Reason for blocking the ticket',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  blockReason!: string;
}

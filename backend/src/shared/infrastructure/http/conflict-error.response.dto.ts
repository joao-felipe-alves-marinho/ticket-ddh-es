import { ApiProperty } from '@nestjs/swagger';

export class ConflictErrorResponseDto {
  @ApiProperty({ example: 409 })
  statusCode!: number;

  @ApiProperty({ example: 'Email "x@x.com" is already registered' })
  message!: string | string[];

  @ApiProperty({ example: 'Conflict' })
  error!: string;
}

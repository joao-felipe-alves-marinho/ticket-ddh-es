import { ApiProperty } from '@nestjs/swagger';

export class BadRequestErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Invalid input data' })
  message!: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error!: string;
}

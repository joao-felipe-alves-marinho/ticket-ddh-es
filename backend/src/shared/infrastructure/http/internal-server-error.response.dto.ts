import { ApiProperty } from '@nestjs/swagger';

export class InternalServerErrorResponseDto {
  @ApiProperty({ example: 500 })
  statusCode!: number;

  @ApiProperty({ example: 'Internal server error' })
  message!: string | string[];

  @ApiProperty({ example: 'Internal Server Error' })
  error!: string;
}

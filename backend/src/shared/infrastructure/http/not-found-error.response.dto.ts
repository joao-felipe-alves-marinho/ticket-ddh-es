import { ApiProperty } from '@nestjs/swagger';

export class NotFoundErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode!: number;

  @ApiProperty({ example: 'Resource not found' })
  message!: string | string[];

  @ApiProperty({ example: 'Not Found' })
  error!: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class OperationSuccessResponseDto {
  @ApiProperty({
    example: 'Operation completed successfully',
    description: 'Success message',
  })
  message!: string;
}

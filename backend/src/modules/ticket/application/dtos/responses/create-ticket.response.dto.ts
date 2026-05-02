import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketResponseDto {
  @ApiProperty({
    example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    description: 'UUID of the newly created ticket',
  })
  id!: string;
}

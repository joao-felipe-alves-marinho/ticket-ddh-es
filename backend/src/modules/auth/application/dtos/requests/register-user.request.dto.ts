import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ROLES } from '../../../domain/value-objects/role.value-object';
import type { UserRole } from '../../../domain/value-objects/role.value-object';

export class RegisterUserRequestDto {
  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Alice Doe', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'secret123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'reporter', enum: ROLES })
  @IsEnum(ROLES)
  role: UserRole = 'reporter';
}

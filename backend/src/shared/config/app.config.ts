import { IsInt, IsString, Min } from 'class-validator';

export class AppConfig {
  @IsInt()
  @Min(1)
  PORT: number = 3000;

  @IsString()
  KURRENTDB_CONNECTION_STRING!: string;

  @IsString()
  MONGODB_URI!: string;

  @IsString()
  JWT_SECRET: string = 'supersecretkey';

  @IsString()
  JWT_EXPIRES_IN: string = '1D';
}

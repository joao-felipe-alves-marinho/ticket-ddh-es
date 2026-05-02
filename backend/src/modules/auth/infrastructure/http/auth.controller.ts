import {
  Body,
  ConflictException as HttpConflictException,
  InternalServerErrorException as HttpInternalServerErrorException,
  UnauthorizedException as HttpUnauthorizedException,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Inject,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserReadRepositoryPort } from '../../domain/ports/user-read.repository.port';
import { RegisterUserResponseDto } from '../../application/dtos/responses';
import { RegisterUserRequestDto } from '../../application/dtos/requests';
import { RegisterUserCommand } from '../../application/commands/register-user/register-user.command';
import { ExceptionBase } from 'src/shared/common/exceptions/exception.base';
import { AggregateID } from 'src/shared/domain/entity.base';
import { Result } from 'src/shared/common/result';
import {
  ConflictException,
  NotFoundException,
} from 'src/shared/common/exceptions';
import { LoginUserResponseDto } from '../../application/dtos/responses/login-user.response.dto';
import { LoginUserRequestDto } from '../../application/dtos/requests/login-user.request.dto';
import * as bcrypt from 'bcrypt';
import { UserReadRepositoryToken } from '../../auth.constants';
import {
  BadRequestErrorResponseDto,
  ConflictErrorResponseDto,
  InternalServerErrorResponseDto,
  UnauthorizedErrorResponseDto,
} from 'src/shared/infrastructure/http';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
    @Inject(UserReadRepositoryToken)
    private readonly userReadRepo: UserReadRepositoryPort,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account.',
  })
  @ApiCreatedResponse({ type: RegisterUserResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid input data.',
    type: BadRequestErrorResponseDto,
  })
  @ApiConflictResponse({
    type: ConflictErrorResponseDto,
    description: 'Email is already registered.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unexpected error occurred while processing the request.',
    type: InternalServerErrorResponseDto,
  })
  async register(
    @Body() dto: RegisterUserRequestDto,
  ): Promise<RegisterUserResponseDto> {
    const result = await this.commandBus.execute<
      RegisterUserCommand,
      Result<AggregateID, ExceptionBase>
    >(new RegisterUserCommand(dto.name, dto.email, dto.password, dto.role));

    if (result.isFailure()) {
      const error = result.unwrapError();
      if (error instanceof ConflictException) {
        throw new HttpConflictException(error.message);
      }
      if (error instanceof ExceptionBase) {
        throw new HttpInternalServerErrorException(error.message);
      }
    }
    return { id: result.unwrap() };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login a user',
    description: 'Authenticates a user and returns a JWT token.',
  })
  @ApiOkResponse({ type: LoginUserResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid email or password.',
    type: BadRequestErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication failed due to invalid credentials.',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'An unexpected error occurred while processing the request.',
    type: InternalServerErrorResponseDto,
  })
  async login(@Body() dto: LoginUserRequestDto): Promise<LoginUserResponseDto> {
    const userResult = await this.userReadRepo.findByEmail(dto.email);
    if (userResult.isFailure()) {
      const error = userResult.unwrapError();
      if (error instanceof NotFoundException) {
        throw new HttpUnauthorizedException('Invalid email or password');
      }
    }
    const user = userResult.unwrap();

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatch) {
      throw new HttpUnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);
    return {
      token,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}

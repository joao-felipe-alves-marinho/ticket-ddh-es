import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException as HttpNotFoundException,
  InternalServerErrorException as HttpInternalServerErrorException,
  Post,
  Get,
  UseGuards,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/infrastructure/guards/roles.guard';
import { Result } from 'src/shared/common/result';
import type { AggregateID } from 'src/shared/domain';
import { ExceptionBase, NotFoundException } from 'src/shared/common/exceptions';
import { Role } from 'src/modules/auth/domain/value-objects';
import { Roles } from 'src/shared/infrastructure/decorators/roles.decorator';
import { CurrentUser } from 'src/shared/infrastructure/decorators/current-user.decorator';
import {
  CreateTicketCommand,
  StartProgressCommand,
  BlockTicketCommand,
  ResolveTicketCommand,
  ReopenTicketCommand,
  CancelTicketCommand,
  AssignTicketCommand,
  TriageTicketCommand,
  UpdateTicketDetailsCommand,
} from '../../application/commands';
import {
  GetAllTicketsQuery,
  SearchTicketsQuery,
  GetTicketQuery,
} from '../../application/queries';
import {
  CreateTicketResponseDto,
  CreateTicketRequestDto,
  TicketDetailResponseDto,
  OperationSuccessResponseDto,
  TriageTicketRequestDto,
  BlockTicketRequestDto,
  AssignTicketRequestDto,
  UpdateTicketDetailsRequestDto,
} from '../../application/dtos';
import {
  BadRequestErrorResponseDto,
  InternalServerErrorResponseDto,
  NotFoundErrorResponseDto,
  UnauthorizedErrorResponseDto,
} from 'src/shared/infrastructure/http';

@ApiTags('Tickets')
@ApiBearerAuth('JWT')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new ticket',
    description:
      'Creates a new ticket with the provided details. Available to all authenticated users.',
  })
  @ApiCreatedResponse({ type: CreateTicketResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid input data.',
    type: BadRequestErrorResponseDto,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  async create(
    @Body() dto: CreateTicketRequestDto,
    @CurrentUser('sub') reporterId: AggregateID,
  ): Promise<CreateTicketResponseDto> {
    const result = await this.commandBus.execute<
      CreateTicketCommand,
      Result<AggregateID, ExceptionBase>
    >(
      new CreateTicketCommand(
        reporterId,
        dto.title,
        dto.description,
        dto.urgency,
      ),
    );

    if (result.isFailure()) {
      throw new HttpInternalServerErrorException(result.unwrapError().message);
    }

    return {
      id: result.unwrap(),
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all tickets with optional filters',
    description:
      'Retrieves all tickets with optional filtering by status, reporter, or assignee.',
  })
  @ApiOkResponse({ type: [TicketDetailResponseDto] })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'reporterId', required: false, type: String })
  @ApiQuery({ name: 'assigneeId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAll(
    @Query('status') status?: string,
    @Query('reporterId') reporterId?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<TicketDetailResponseDto[]> {
    const result = await this.queryBus.execute<
      GetAllTicketsQuery,
      Result<TicketDetailResponseDto[], ExceptionBase>
    >(
      new GetAllTicketsQuery({
        status,
        reporterId,
        assigneeId,
        limit,
        offset,
      }),
    );

    if (result.isFailure()) {
      throw new HttpInternalServerErrorException(result.unwrapError().message);
    }

    return { ...result.unwrap() };
  }

  @Get('/search/:term')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search tickets by title or description',
    description: 'Searches tickets based on title or description matching.',
  })
  @ApiOkResponse({ type: [TicketDetailResponseDto] })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async search(
    @Param('term') searchTerm: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ): Promise<TicketDetailResponseDto[]> {
    const result = await this.queryBus.execute<
      SearchTicketsQuery,
      Result<any[], ExceptionBase>
    >(new SearchTicketsQuery(searchTerm, limit, offset));

    if (result.isFailure()) {
      throw new HttpInternalServerErrorException(result.unwrapError().message);
    }

    return { ...result.unwrap() };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get ticket details',
    description: 'Retrieves detailed information about a specific ticket.',
  })
  @ApiOkResponse({ type: TicketDetailResponseDto })
  @ApiNotFoundResponse({
    description: 'Ticket not found.',
    type: NotFoundErrorResponseDto,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  async getById(
    @Param('id') id: AggregateID,
  ): Promise<TicketDetailResponseDto> {
    const result = await this.queryBus.execute<
      GetTicketQuery,
      Result<TicketDetailResponseDto, ExceptionBase>
    >(new GetTicketQuery(id));

    if (result.isFailure()) {
      throw new HttpNotFoundException(result.unwrapError().message);
    }

    return result.unwrap();
  }

  @Post(':id/triage')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.agent().value, Role.manager().value)
  @ApiOperation({
    summary: 'Triage a ticket',
    description:
      'Triage a ticket based on its urgency and other factors. Only Agent or Manager.',
  })
  @ApiOkResponse({ type: OperationSuccessResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid input data.',
    type: BadRequestErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Ticket not found.',
    type: NotFoundErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'An unexpected error occurred.',
    type: InternalServerErrorResponseDto,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  async triage(
    @Param('id') ticketId: AggregateID,
    @Body() dto: TriageTicketRequestDto,
  ): Promise<OperationSuccessResponseDto> {
    const result = await this.commandBus.execute<
      TriageTicketCommand,
      Result<void, ExceptionBase>
    >(new TriageTicketCommand(ticketId, dto.priority));

    if (result.isFailure()) {
      const error = result.unwrapError();
      if (error instanceof NotFoundException) {
        throw new HttpNotFoundException(error.message);
      }
      throw new HttpInternalServerErrorException(error.message);
    }

    return { message: 'Ticket triaged successfully' };
  }

  @Post(':id/start-progress')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.agent().value, Role.manager().value)
  @ApiOperation({
    summary: 'Start progress on a ticket',
    description:
      'Moves a triaged ticket to in-progress status. Only Agent or Manager.',
  })
  @ApiOkResponse({ type: OperationSuccessResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid input data.',
    type: BadRequestErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Ticket not found.',
    type: NotFoundErrorResponseDto,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  async startProgress(
    @Param('id') ticketId: AggregateID,
  ): Promise<OperationSuccessResponseDto> {
    const result = await this.commandBus.execute<
      StartProgressCommand,
      Result<void, ExceptionBase>
    >(new StartProgressCommand(ticketId));

    if (result.isFailure()) {
      const error = result.unwrapError();
      if (error instanceof NotFoundException) {
        throw new HttpNotFoundException(error.message);
      }
      throw new HttpInternalServerErrorException(error.message);
    }

    return { message: 'Progress started successfully' };
  }

  @Post(':id/block')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.agent().value, Role.manager().value)
  @ApiOperation({
    summary: 'Block a ticket',
    description:
      'Blocks an in-progress ticket due to a dependency. Only Agent or Manager.',
  })
  @ApiOkResponse({ type: OperationSuccessResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid input data.',
    type: BadRequestErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Ticket not found.',
    type: NotFoundErrorResponseDto,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  async block(
    @Param('id') ticketId: AggregateID,
    @Body() dto: BlockTicketRequestDto,
  ): Promise<OperationSuccessResponseDto> {
    const result = await this.commandBus.execute<
      BlockTicketCommand,
      Result<void, ExceptionBase>
    >(new BlockTicketCommand(ticketId, dto.blockReason));

    if (result.isFailure()) {
      const error = result.unwrapError();
      if (error instanceof NotFoundException) {
        throw new HttpNotFoundException(error.message);
      }
      throw new HttpInternalServerErrorException(error.message);
    }

    return { message: 'Ticket blocked successfully' };
  }

  @Post(':id/resolve')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.agent().value, Role.manager().value)
  @ApiOperation({
    summary: 'Resolve a ticket',
    description:
      'Marks an in-progress ticket as resolved. Only the assignee or Manager.',
  })
  @ApiOkResponse({ type: OperationSuccessResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid input data.',
    type: BadRequestErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Ticket not found.',
    type: NotFoundErrorResponseDto,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  async resolve(
    @Param('id') ticketId: AggregateID,
  ): Promise<OperationSuccessResponseDto> {
    const result = await this.commandBus.execute<
      ResolveTicketCommand,
      Result<void, ExceptionBase>
    >(new ResolveTicketCommand(ticketId));

    if (result.isFailure()) {
      const error = result.unwrapError();
      if (error instanceof NotFoundException) {
        throw new HttpNotFoundException(error.message);
      }
      throw new HttpInternalServerErrorException(error.message);
    }

    return { message: 'Ticket resolved successfully' };
  }

  @Post(':id/reopen')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.manager().value)
  @ApiOperation({
    summary: 'Reopen a resolved ticket',
    description: 'Reopens a resolved ticket (only once). Only Manager.',
  })
  @ApiOkResponse({ type: OperationSuccessResponseDto })
  @ApiBadRequestResponse({
    description: 'Cannot reopen ticket more than once.',
    type: BadRequestErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Ticket not found.',
    type: NotFoundErrorResponseDto,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  async reopen(
    @Param('id') ticketId: AggregateID,
  ): Promise<OperationSuccessResponseDto> {
    const result = await this.commandBus.execute<
      ReopenTicketCommand,
      Result<void, ExceptionBase>
    >(new ReopenTicketCommand(ticketId));

    if (result.isFailure()) {
      const error = result.unwrapError();
      if (error instanceof NotFoundException) {
        throw new HttpNotFoundException(error.message);
      }
      throw new HttpInternalServerErrorException(error.message);
    }

    return { message: 'Ticket reopened successfully' };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.manager().value)
  @ApiOperation({
    summary: 'Cancel a ticket',
    description: 'Cancels an open or triaged ticket. Only Manager.',
  })
  @ApiOkResponse({ type: OperationSuccessResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid input data.',
    type: BadRequestErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Ticket not found.',
    type: NotFoundErrorResponseDto,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  async cancel(
    @Param('id') ticketId: AggregateID,
  ): Promise<OperationSuccessResponseDto> {
    const result = await this.commandBus.execute<
      CancelTicketCommand,
      Result<void, ExceptionBase>
    >(new CancelTicketCommand(ticketId));

    if (result.isFailure()) {
      const error = result.unwrapError();
      if (error instanceof NotFoundException) {
        throw new HttpNotFoundException(error.message);
      }
      throw new HttpInternalServerErrorException(error.message);
    }

    return { message: 'Ticket cancelled successfully' };
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.agent().value, Role.manager().value)
  @ApiOperation({
    summary: 'Assign a ticket to an agent',
    description: 'Assigns a triaged ticket to an agent. Only Agent or Manager.',
  })
  @ApiOkResponse({ type: OperationSuccessResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid input data.',
    type: BadRequestErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Ticket not found.',
    type: NotFoundErrorResponseDto,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  async assign(
    @Param('id') ticketId: AggregateID,
    @Body() dto: AssignTicketRequestDto,
  ): Promise<OperationSuccessResponseDto> {
    const result = await this.commandBus.execute<
      AssignTicketCommand,
      Result<void, ExceptionBase>
    >(new AssignTicketCommand(ticketId, dto.assigneeId));

    if (result.isFailure()) {
      const error = result.unwrapError();
      if (error instanceof NotFoundException) {
        throw new HttpNotFoundException(error.message);
      }
      throw new HttpInternalServerErrorException(error.message);
    }

    return { message: 'Ticket assigned successfully' };
  }

  @Patch(':id/update-details')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update ticket details',
    description:
      'Updates title, description, or urgency. Reporter can update OPEN tickets. Agent/Manager can update TRIAGED/IN_PROGRESS tickets.',
  })
  @ApiOkResponse({ type: OperationSuccessResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid input data.',
    type: BadRequestErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Ticket not found.',
    type: NotFoundErrorResponseDto,
  })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  async updateDetails(
    @Param('id') ticketId: AggregateID,
    @Body() dto: UpdateTicketDetailsRequestDto,
  ): Promise<OperationSuccessResponseDto> {
    const result = await this.commandBus.execute<
      UpdateTicketDetailsCommand,
      Result<void, ExceptionBase>
    >(
      new UpdateTicketDetailsCommand(
        ticketId,
        dto.title,
        dto.description,
        dto.urgency,
      ),
    );

    if (result.isFailure()) {
      const error = result.unwrapError();
      if (error instanceof NotFoundException) {
        throw new HttpNotFoundException(error.message);
      }
      throw new HttpInternalServerErrorException(error.message);
    }

    return { message: 'Ticket details updated successfully' };
  }
}

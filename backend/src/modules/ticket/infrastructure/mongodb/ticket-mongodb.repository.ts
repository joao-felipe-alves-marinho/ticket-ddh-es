import { InjectModel } from '@nestjs/mongoose';
import {
  TicketReadRepositoryPort,
  TicketReadModel,
} from '../../domain/ports/ticket-read.repository.port';
import { TicketDocument } from './ticket.schema';
import { Model } from 'mongoose';
import { Result } from 'src/shared/common/result';
import { ExceptionBase, NotFoundException } from 'src/shared/common/exceptions';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TicketMongoDBRepository implements TicketReadRepositoryPort {
  private readonly logger = new Logger(TicketMongoDBRepository.name);
  constructor(
    @InjectModel(TicketDocument.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  async findById(
    id: string,
  ): Promise<Result<TicketReadModel, NotFoundException>> {
    this.logger.debug(`findById: ${id}`);
    const doc = await this.ticketModel.findOne({ id }).lean().exec();
    if (!doc) {
      return Result.failure(
        new NotFoundException(`Ticket with id ${id} not found`),
      );
    }
    return Result.success(this.toReadModel(doc));
  }

  async findByReportedBy(
    userId: string,
  ): Promise<Result<TicketReadModel[], NotFoundException>> {
    const docs = await this.ticketModel
      .find({ reportedById: userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return Result.success(docs.map((doc) => this.toReadModel(doc)));
  }

  async findAll(): Promise<Result<TicketReadModel[], ExceptionBase>> {
    const docs = await this.ticketModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return Result.success(docs.map((doc) => this.toReadModel(doc)));
  }

  private toReadModel(doc: TicketDocument): TicketReadModel {
    return {
      id: doc.id,
      reporterId: doc.reporterId,
      title: doc.title,
      description: doc.description,
      urgency: doc.urgency,
      status: doc.status,
      priority: doc.priority,
      assigneeId: doc.assigneeId,
      blockReason: doc.blockReason,
      reopenCount: doc.reopenCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

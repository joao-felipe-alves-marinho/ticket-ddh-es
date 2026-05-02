import { Injectable, Logger } from '@nestjs/common';
import {
  UserReadModel,
  UserReadRepositoryPort,
} from '../../domain/ports/user-read.repository.port';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { Result } from 'src/shared/common/result';
import { NotFoundException } from 'src/shared/common/exceptions';

@Injectable()
export class UserMongoDBRepository implements UserReadRepositoryPort {
  private readonly logger = new Logger(UserMongoDBRepository.name);
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(
    id: string,
  ): Promise<Result<UserReadModel, NotFoundException>> {
    this.logger.debug(`findById: ${id}`);
    const doc = await this.userModel.findOne({ id }).lean().exec();
    return doc
      ? Result.success(this.toReadModel(doc))
      : Result.failure(new NotFoundException('User not found'));
  }

  async findByEmail(
    email: string,
  ): Promise<Result<UserReadModel, NotFoundException>> {
    this.logger.debug(`findByEmail: ${email}`);
    const doc = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .lean()
      .exec();
    if (doc) {
      this.logger.debug(`Found user by email ${email}: ${JSON.stringify(doc)}`);
      return Result.success(this.toReadModel(doc));
    }
    this.logger.warn(`User not found for email: ${email}`);
    return Result.failure(new NotFoundException('User not found'));
  }

  async findAll(): Promise<Result<UserReadModel[], NotFoundException>> {
    const docs = await this.userModel.find().lean().exec();
    return Result.success(docs.map((doc) => this.toReadModel(doc)));
  }

  private toReadModel(doc: UserDocument): UserReadModel {
    return {
      id: doc.id,
      email: doc.email,
      name: doc.name,
      role: doc.role,
      passwordHash: doc.passwordHash,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

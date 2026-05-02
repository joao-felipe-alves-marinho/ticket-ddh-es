import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  ALLOWED_PRIORITIES,
  ALLOWED_STATUSES,
  ALLOWED_URGENCIES,
} from '../../domain/value-objects';
import type {
  TicketPriority,
  TicketStatus,
  TicketUrgency,
} from '../../domain/value-objects';

@Schema({ collection: 'tickets', timestamps: false })
export class TicketDocument extends Document {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true })
  reporterId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: String, required: true, enum: ALLOWED_URGENCIES })
  urgency!: TicketUrgency;

  @Prop({ type: String, required: true, enum: ALLOWED_STATUSES })
  status!: TicketStatus;

  @Prop({ type: String, enum: ALLOWED_PRIORITIES })
  priority?: TicketPriority;

  @Prop()
  assigneeId?: string;

  @Prop()
  blockReason?: string;

  @Prop({ required: true })
  reopenCount!: number;

  @Prop({ required: true })
  createdAt!: Date;

  @Prop({ required: true })
  updatedAt!: Date;
}

export const TicketSchema = SchemaFactory.createForClass(TicketDocument);
TicketSchema.index({ reporterId: 1 });
TicketSchema.index({ status: 1 });

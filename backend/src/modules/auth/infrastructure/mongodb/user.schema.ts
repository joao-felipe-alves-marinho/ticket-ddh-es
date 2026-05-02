import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ROLES, type UserRole } from '../../domain/value-objects';

@Schema({ collection: 'users', timestamps: false })
export class UserDocument extends Document {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: String, required: true, enum: ROLES })
  role!: UserRole;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true })
  createdAt!: Date;

  @Prop({ required: true })
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });

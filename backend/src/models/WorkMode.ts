import mongoose, { Document, Schema } from "mongoose";

export interface IWorkMode extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkModeSchema = new Schema<IWorkMode>(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);

export const WorkMode =
  mongoose.models.WorkMode || mongoose.model<IWorkMode>("WorkMode", WorkModeSchema);

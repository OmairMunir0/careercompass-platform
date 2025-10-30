import mongoose, { Document, Schema } from "mongoose";

export interface IShortlistStatus extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShortlistStatusSchema = new Schema<IShortlistStatus>(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export const ShortlistStatus =
  mongoose.models.ShortlistStatus ||
  mongoose.model<IShortlistStatus>("ShortlistStatus", ShortlistStatusSchema);

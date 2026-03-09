import mongoose, { Document, Schema } from "mongoose";

export interface IProficiencyLevel extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProficiencyLevelSchema = new Schema<IProficiencyLevel>(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);

export const ProficiencyLevel =
  mongoose.models.ProficiencyLevel ||
  mongoose.model<IProficiencyLevel>("ProficiencyLevel", ProficiencyLevelSchema);

import mongoose, { Document, Schema } from "mongoose";

export interface IRole extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Role = mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);

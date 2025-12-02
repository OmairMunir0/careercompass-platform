import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUserExperience extends Document {
  user: Types.ObjectId;
  jobTitle: string;
  company: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserExperienceSchema = new Schema<IUserExperience>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: null },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    description: { type: String, default: null },
    isCurrent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserExperience =
  mongoose.models.UserExperience ||
  mongoose.model<IUserExperience>("UserExperience", UserExperienceSchema);

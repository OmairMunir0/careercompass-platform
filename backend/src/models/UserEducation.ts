import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUserEducation extends Document {
  user: Types.ObjectId;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserEducationSchema = new Schema<IUserEducation>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    description: { type: String, default: null },
  },
  { timestamps: true }
);

export const UserEducation =
  mongoose.models.UserEducation ||
  mongoose.model<IUserEducation>("UserEducation", UserEducationSchema);

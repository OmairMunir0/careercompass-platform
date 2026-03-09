import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUserCertification extends Document {
  user: Types.ObjectId;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate: Date | null;
  credentialUrl: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserCertificationSchema = new Schema<IUserCertification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    issuingOrganization: { type: String, required: true, trim: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, default: null },
    credentialUrl: { type: String, default: null },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

export const UserCertification =
  mongoose.models.UserCertification ||
  mongoose.model<IUserCertification>("UserCertification", UserCertificationSchema);

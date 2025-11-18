import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash: string;
  roleId: Types.ObjectId;
  publicEmail: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  companyName: string | null;
  companyWebsite: string | null;
  position: string | null;
  imageUrl: string | null;
  resumeUrl: string | null;
  subscriptionTier: "free" | "premium";
  subscriptionStatus: "inactive" | "active" | "expired" | "canceled";
  premiumExpiresAt: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeCheckoutSessionId: string | null;
  lastPaymentAt: Date | null;
  pushSubscription: string | null; // JSON stringified push subscription
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    username: { type: String, required: true, unique: true },
    publicEmail: { type: String, default: null },
    bio: { type: String, default: null },
    location: { type: String, default: null },
    phone: { type: String, default: null },
    linkedinUrl: { type: String, default: null },
    portfolioUrl: { type: String, default: null },
    companyName: { type: String, default: null },
    companyWebsite: { type: String, default: null },
    position: { type: String, default: null },
    imageUrl: { type: String, default: null },
    resumeUrl: { type: String, default: null },
    subscriptionTier: { type: String, enum: ["free", "premium"], default: "free" },
    subscriptionStatus: {
      type: String,
      enum: ["inactive", "active", "expired", "canceled"],
      default: "inactive",
    },
    premiumExpiresAt: { type: Date, default: null },
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    stripeCheckoutSessionId: { type: String, default: null },
    lastPaymentAt: { type: Date, default: null },
    pushSubscription: { type: String, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

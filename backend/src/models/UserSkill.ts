import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUserSkill extends Document {
  user: Types.ObjectId;
  skillId: Types.ObjectId;
  proficiencyLevelId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSkillSchema = new Schema<IUserSkill>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    skillId: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
    proficiencyLevelId: { type: Schema.Types.ObjectId, ref: "ProficiencyLevel" },
  },
  { timestamps: true }
);

export const UserSkill =
  mongoose.models.UserSkill || mongoose.model<IUserSkill>("UserSkill", UserSkillSchema);

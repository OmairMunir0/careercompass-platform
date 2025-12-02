import mongoose, { Document, Schema } from "mongoose";
import { ISkillCategory } from "./SkillCategory"; 

export interface IInterviewQuestion extends Document {
  question: string;
  answer: string; 
  categoryId: mongoose.Types.ObjectId | ISkillCategory;
  difficulty?: "easy" | "medium" | "hard";
  createdAt: Date;
  updatedAt: Date;
}

const InterviewQuestionSchema = new Schema<IInterviewQuestion>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "SkillCategory", required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  },
  { timestamps: true }
);

export const InterviewQuestion =
  mongoose.models.InterviewQuestion ||
  mongoose.model<IInterviewQuestion>("InterviewQuestion", InterviewQuestionSchema);
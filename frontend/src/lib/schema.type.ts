// src/types/schema.types.ts

export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  role?: Role;
  profile?: Profile;
}

export interface Profile {
  id: string;
  userId: string;
  bio?: string | null;
  location?: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  companyName?: string | null;
  companyWebsite?: string | null;
  position?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string | null;
  likes: number;
  createdAt: string;
  profileId: string;
}

export interface Comment {
  id: string;
  postId: string;
  profileId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobPosting {
  id: string;
  recruiterProfileId: string;
  title: string;
  description: string;
  requirements?: string | null;
  location?: string | null;
  jobTypeId?: string | null;
  workModeId?: string | null;
  experienceLevelId?: string | null;
  salaryMin: number;
  salaryMax: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  jobType?: JobType;
  workMode?: WorkMode;
  experienceLevel?: ExperienceLevel;
  skills?: JobSkill[];
}

export interface JobType {
  id: string;
  name: string;
}

export interface WorkMode {
  id: string;
  name: string;
}

export interface ExperienceLevel {
  id: string;
  name: string;
}

export interface JobSkill {
  id: string;
  jobId: string;
  skillName: string;
}

export interface Education {
  id: string;
  profileId: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
}

export interface Experience {
  id: string;
  profileId: string;
  jobTitle: string;
  company: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  isCurrent: boolean;
}

export interface Skill {
  id: string;
  profileId: string;
  name: string;
  categoryId?: string | null;
  proficiencyLevelId?: string | null;
  category?: SkillCategory;
  proficiencyLevel?: ProficiencyLevel;
}

export interface SkillCategory {
  id: string;
  name: string;
}

export interface ProficiencyLevel {
  id: string;
  name: string;
}

export interface Certification {
  id: string;
  profileId: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string | null;
  credentialUrl?: string | null;
}

export interface SavedJob {
  id: string;
  profileId: string;
  jobId: string;
  savedAt: string;
  updatedAt: string;
}

export interface Shortlist {
  id: string;
  recruiterProfileId: string;
  candidateProfileId: string;
  jobId: string;
  statusId: string;
  createdAt: string;
  updatedAt: string;
  status?: ShortlistStatus;
}

export interface ShortlistStatus {
  id: string;
  name: string;
}

export interface Conversation {
  id: string;
  recruiterProfileId: string;
  candidateProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderProfileId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Entity =
  | User
  | Profile
  | Post
  | Comment
  | JobPosting
  | JobType
  | WorkMode
  | ExperienceLevel
  | JobSkill
  | Education
  | Experience
  | Skill
  | SkillCategory
  | ProficiencyLevel
  | Certification
  | SavedJob
  | Shortlist
  | ShortlistStatus
  | Conversation
  | Message;

import { Profile, User } from "./schema.type";

// Auth
export type RegisterRequestBodyDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  companyName?: string;
  companyWebsite?: string;
  position?: string;
};

export type RegisterResponseDto = { token: string; user: User; role: string };

export type LoginRequestBodyDto = { email: string; password: string };
export type LoginResponseDto = { token: string; user: User; role: string };

export type GetMeResponseDto = {
  profile: Profile & {
    user: User & { role: string };
  };
};

export type ChangeEmailRequestBodyDto = { newEmail: string };
export type ChangeEmailResponseDto = { user: User };

export type ChangePasswordRequestBodyDto = { oldPassword: string; newPassword: string };
export type ChangePasswordResponseDto = { user: User };

// Profiles
export type ListProfilesResponseDto = {
  profiles: Array<
    Profile & {
      user: Pick<User, "id" | "email" | "firstName" | "lastName" | "createdAt" | "updatedAt"> & {
        role: { id: string; name: string };
      };
    }
  >;
};

export type ListFullProfilesResponseDto = {
  profiles: Array<
    Profile & {
      user: Pick<User, "id" | "email" | "firstName" | "lastName"> & {
        role: { id: string; name: string };
      };
      skills: any[];
      education: any[];
      experience: any[];
      certifications: any[];
    }
  >;
};

export type GetProfileByIdResponseDto = { profile: Profile };

export type UpdateFullProfileRequestDto = {
  profileId: string;
  profileData: Partial<Profile>;
  educationEntries?: any[];
  experienceEntries?: any[];
  skillsEntries?: any[];
  certificationsEntries?: any[];
};

export type UpdateFullProfileResponseDto = {
  profile: {
    id: string;
    bio: string | null;
    location: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    companyName: string | null;
    companyWebsite: string | null;
    position: string | null;
    createdAt: string;
    updatedAt: string;
    education: any[];
    experience: any[];
    skills: any[];
    certifications: any[];
  };
};

/* === Job Postings === */
export type CreateJobPostingRequestDto = {
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  jobTypeId?: string;
  workModeId?: string;
  experienceLevelId?: string;
  salaryMin: number;
  salaryMax: number;
  skills?: string[];
};

export type CreateJobPostingResponseDto = {
  job: {
    id: string;
    title: string;
    description: string;
    salaryMin: number;
    salaryMax: number;
    isActive: boolean;
    createdAt: string;
  };
};

export type ListJobPostingsResponseDto = {
  jobs: Array<{
    id: string;
    title: string;
    description: string;
    location: string | null;
    salaryMin: number;
    salaryMax: number;
    isActive: boolean;
    jobType: string | null;
    workMode: string | null;
    experienceLevel: string | null;
    skills: string[];
    createdAt: string;
  }>;
};

export type GetJobPostingByIdResponseDto = {
  job: {
    id: string;
    title: string;
    description: string;
    requirements?: string | null;
    location?: string | null;
    salaryMin: number;
    salaryMax: number;
    jobType: string | null;
    workMode: string | null;
    experienceLevel: string | null;
    skills: string[];
  };
};

export type DeleteJobPostingResponseDto = { success: boolean };

/* === Posts & Comments === */
export type CreatePostRequestDto = {
  content: string;
  imageUrl?: string;
};

export type CreatePostResponseDto = {
  post: {
    id: string;
    content: string;
    imageUrl?: string | null;
    createdAt: string;
  };
};

export type ListPostsResponseDto = {
  posts: Array<{
    id: string;
    content: string;
    imageUrl?: string | null;
    likes: number;
    createdAt: string;
    profileId: string;
  }>;
};

export type UpdatePostRequestDto = {
  content?: string;
  imageUrl?: string;
};

export type UpdatePostResponseDto = { post: any };

export type DeletePostResponseDto = { success: boolean };

export type AddCommentRequestDto = {
  postId: string;
  content: string;
};

export type AddCommentResponseDto = {
  comment: {
    id: string;
    postId: string;
    content: string;
    createdAt: string;
  };
};

export type GetCommentsByPostResponseDto = {
  comments: Array<{
    id: string;
    postId: string;
    content: string;
    createdAt: string;
  }>;
};

/* === Saved Jobs === */
export type ToggleSaveJobResponseDto = {
  saved?: {
    id: string;
    profileId: string;
    jobId: string;
    savedAt: string;
  };
};

export type ListSavedJobsResponseDto = {
  savedJobs: Array<{
    savedId: string;
    savedAt: string;
    jobId: string;
    title: string;
    location: string | null;
    salaryMin: number;
    salaryMax: number;
    isActive: boolean;
  }>;
};

export type RemoveSavedJobResponseDto = { success: boolean };

export type BulkRemoveSavedJobsRequestDto = {
  jobIds: string[];
};

export type BulkRemoveSavedJobsResponseDto = { success: boolean };

/* === Shortlists === */
export type AddToShortlistRequestDto = {
  candidateProfileId: string;
  jobId: string;
  statusId: string;
};

export type AddToShortlistResponseDto = {
  shortlist: {
    id: string;
    candidateProfileId: string;
    jobId: string;
    statusId: string;
  };
};

export type ListShortlistsResponseDto = {
  shortlists: Array<{
    shortlistId: string;
    candidateProfileId: string;
    jobId: string;
    jobTitle: string;
    status: string;
    candidateFirstName: string;
    candidateLastName: string;
    candidateEmail: string;
    createdAt: string;
  }>;
};

export type UpdateShortlistStatusRequestDto = {
  statusId: string;
};

export type UpdateShortlistStatusResponseDto = {
  shortlist: {
    id: string;
    statusId: string;
    updatedAt: string;
  };
};

/* === Users === */
export type GetUserByIdResponseDto = {
  user: User;
};

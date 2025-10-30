import { Message } from "@/lib/schema.type";
import { apiRequest } from "./auth";
import axiosInstance from "./axiosInstance";

export interface ProfileData {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  certifications?: Certification[];
}

export interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  description?: string;
}

export interface Certification {
  id?: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  jobType: string;
  experienceLevel: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salaryMin?: number;
  salaryMax?: number;
  postedAt: string;
  applicationDeadline?: string;
  skills: string[];
  status: "ACTIVE" | "PAUSED" | "CLOSED" | "DRAFT";
  applicationsCount: number;
  viewsCount: number;
  isRemote: boolean;
  isUrgent?: boolean;
  isSaved?: boolean;
  hasApplied?: boolean;
  companyDescription?: string;
  companySize?: string;
  companyWebsite?: string;
  applicationInstructions?: string;
}

// Profile API functions
export const profileAPI = {
  // Get candidate profile
  getProfile: async (): Promise<ProfileData> => {
    const response = await axiosInstance.get("/candidates/profile");
    return response.data;
  },

  // Update candidate profile
  updateProfile: async (profileData: Partial<ProfileData>): Promise<ProfileData> => {
    const response = await apiRequest("/candidates/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    return response.profile;
  },
};

// Jobs API
export const jobsAPI = {
  getJobs: async (filters?: {
    search?: string;
    location?: string;
    jobType?: string;
    experienceLevel?: string;
    skills?: string[];
    salaryMin?: number;
    salaryMax?: number;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: Job[]; pagination: any }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiRequest(`/jobs?${params.toString()}`, {
      method: "GET",
    });
    return response;
  },

  getJob: async (id: string): Promise<Job> => {
    const response = await apiRequest(`/jobs/${id}`, {
      method: "GET",
    });
    return response.job;
  },

  saveJob: async (jobId: string): Promise<void> => {
    await apiRequest(`/candidates/saved-jobs/${jobId}`, {
      method: "POST",
    });
  },

  unsaveJob: async (jobId: string): Promise<void> => {
    await apiRequest(`/candidates/saved-jobs/${jobId}`, {
      method: "DELETE",
    });
  },

  getSavedJobs: async (page = 1, limit = 10): Promise<{ savedJobs: any[]; pagination: any }> => {
    const response = await apiRequest(`/candidates/saved-jobs?page=${page}&limit=${limit}`, {
      method: "GET",
    });
    return response;
  },

  checkSavedStatus: async (jobIds: string[]): Promise<string[]> => {
    // This would need to be implemented on the backend or we can check individually
    // For now, we'll get all saved jobs and filter
    const savedJobsResponse = await jobsAPI.getSavedJobs(1, 1000);
    return savedJobsResponse.savedJobs.map((saved) => saved.job.id);
  },

  // Recruiter job management functions
  createJob: async (jobData: {
    title: string;
    description: string;
    requirements: string;
    location: string;
    jobType: string;
    experienceLevel: string;
    salaryMin?: number;
    salaryMax?: number;
    skills?: string[];
  }): Promise<Job> => {
    const response = await apiRequest("/jobs", {
      method: "POST",
      body: JSON.stringify(jobData),
    });
    return response.job;
  },

  updateJob: async (
    jobId: string,
    jobData: Partial<{
      title: string;
      description: string;
      requirements: string;
      location: string;
      jobType: string;
      experienceLevel: string;
      salaryMin?: number;
      salaryMax?: number;
      skills?: string[];
    }>
  ): Promise<Job> => {
    const response = await apiRequest(`/jobs/${jobId}`, {
      method: "PUT",
      body: JSON.stringify(jobData),
    });
    return response.job;
  },

  deleteJob: async (jobId: string): Promise<void> => {
    await apiRequest(`/jobs/${jobId}`, {
      method: "DELETE",
    });
  },

  getRecruiterJobs: async (page = 1, limit = 10): Promise<{ jobs: Job[]; pagination: any }> => {
    const response = await apiRequest(`/jobs/my/jobs?page=${page}&limit=${limit}`, {
      method: "GET",
    });
    return response;
  },

  updateJobStatus: async (jobId: string, status: string): Promise<Job> => {
    const response = await apiRequest(`/jobs/${jobId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return response.job;
  },

  duplicateJob: async (jobId: string): Promise<Job> => {
    const response = await apiRequest(`/jobs/${jobId}/duplicate`, {
      method: "POST",
    });
    return response.job;
  },

  applyToJob: async (
    jobId: string,
    applicationData: {
      coverLetter?: string;
      resumeUrl?: string;
      additionalInfo?: string;
    }
  ): Promise<void> => {
    await apiRequest(`/jobs/${jobId}/apply`, {
      method: "POST",
      body: JSON.stringify(applicationData),
    });
  },
};

// Candidates API functions (for recruiters)
export const candidatesAPI = {
  // Search candidates
  searchCandidates: async (filters?: {
    search?: string;
    location?: string;
    skills?: string[];
    page?: number;
    limit?: number;
  }): Promise<{ candidates: any[]; pagination: any }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiRequest(`/candidates/search?${params.toString()}`, {
      method: "GET",
    });
    return response;
  },

  // Shortlist candidate
  shortlistCandidate: async (candidateId: string): Promise<{ isShortlisted: boolean }> => {
    const response = await apiRequest(`/candidates/${candidateId}/shortlist`, {
      method: "POST",
    });
    return { isShortlisted: response.isShortlisted };
  },

  // Contact candidate
  contactCandidate: async (candidateId: string, message: string): Promise<void> => {
    await apiRequest(`/candidates/${candidateId}/contact`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },
};

// Messages API functions
export const messagesAPI = {
  // Get conversations
  getConversations: async (): Promise<any[]> => {
    const response = await apiRequest("/messages/conversations");
    return response.conversations;
  },

  // Get messages for a conversation
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await apiRequest(`/messages/conversations/${conversationId}`, {
      method: "GET",
    });
    return response.messages || [];
  },

  // Send a message
  sendMessage: async (recipientId: string, content: string): Promise<any> => {
    const response = await apiRequest("/messages", {
      method: "POST",
      body: JSON.stringify({ recipientId, content }),
    });
    return response.message;
  },
};

import { tool } from "langchain";
import { z } from "zod";
import { User } from "../models/User";
import { JobPost } from "../models/JobPost";
import { JobApplication } from "../models/JobApplication";
import { SavedJob } from "../models/SavedJob";
import { UserSkill } from "../models/UserSkill";
import { Skill } from "../models/Skill";
import { ProficiencyLevel } from "../models/ProficiencyLevel";
import { UserExperience } from "../models/UserExperience";
import { UserEducation } from "../models/UserEducation";
import { UserCertification } from "../models/UserCertification";
import { JobApplicationStatus } from "../models/JobApplicationStatus";
import { ToolExecutionContext } from "../types/agent.types";
import { invalidateCache } from "../utils/cache";

export const createUpdateProfileTool = (context: ToolExecutionContext) => {
  return tool(
    async ({ firstName, lastName, username, bio, position, location, phone, linkedinUrl, portfolioUrl, publicEmail, companyName, companyWebsite, preferredLocations }) => {
      const updates: any = {};
      if (firstName !== undefined && firstName !== null) updates.firstName = firstName;
      if (lastName !== undefined && lastName !== null) updates.lastName = lastName;
      if (username !== undefined && username !== null) updates.username = username;
      if (bio !== undefined && bio !== null) updates.bio = bio;
      if (position !== undefined && position !== null) updates.position = position;
      if (location !== undefined && location !== null) updates.location = location;
      if (phone !== undefined && phone !== null) updates.phone = phone;
      if (linkedinUrl !== undefined && linkedinUrl !== null) updates.linkedinUrl = linkedinUrl;
      if (portfolioUrl !== undefined && portfolioUrl !== null) updates.portfolioUrl = portfolioUrl;
      if (publicEmail !== undefined && publicEmail !== null) updates.publicEmail = publicEmail;
      if (companyName !== undefined && companyName !== null) updates.companyName = companyName;
      if (companyWebsite !== undefined && companyWebsite !== null) updates.companyWebsite = companyWebsite;
      if (preferredLocations !== undefined && preferredLocations !== null) {
        const cleaned = Array.from(new Set([...preferredLocations, "Remote"]));
        updates.preferredLocations = cleaned;
      }

      console.log(`[TOOL] update_user_profile called with updates`);
      console.log(`[TOOL] Updates to apply:`, updates);

      if (Object.keys(updates).length === 0) {
        return "No fields to update. Please provide at least one field to update.";
      }

      const user = await User.findByIdAndUpdate(
        context.userId, 
        updates, 
        { new: true }
      );
      
      if (!user) {
        return "Failed to update profile: User not found";
      }

      await invalidateCache([`users:${context.userId}`, "users:*"]);
      console.log(`[TOOL] Profile updated successfully for user ${context.userId}`);
      return `Profile updated successfully! Updated fields: ${Object.keys(updates).join(", ")}.`;
    },
    {
      name: "update_user_profile",
      description: "Update the user's profile information including name, bio, position, location, contact details, and social links",
      schema: z.object({
        firstName: z.string().max(50).optional().describe("User's first name"),
        lastName: z.string().max(50).optional().describe("User's last name"),
        username: z.string().max(50).optional().describe("User's username"),
        bio: z.string().max(500).optional().describe("User's bio/about section (max 500 characters)"),
        position: z.string().max(100).optional().describe("User's current job position/title"),
        location: z.string().max(100).optional().describe("User's location/city"),
        phone: z.string().max(20).optional().describe("User's phone number"),
        linkedinUrl: z.string().url().optional().describe("User's LinkedIn profile URL"),
        portfolioUrl: z.string().url().optional().describe("User's portfolio website URL"),
        publicEmail: z.string().email().optional().describe("User's public contact email"),
        companyName: z.string().max(100).optional().describe("Company name (for recruiters)"),
        companyWebsite: z.string().url().optional().describe("Company website URL (for recruiters)"),
        preferredLocations: z.array(z.string()).optional().describe("Preferred job locations (Remote is always included)"),
      }),
    }
  );
};

export const createGetProfileTool = (context: ToolExecutionContext) => {
  return tool(
    async () => {
      console.log(`[TOOL] get_user_profile called for user ${context.userId}`);
      
      const user = await User.findById(context.userId)
        .populate("roleId", "name")
        .lean();

      if (!user) {
        return "Failed to fetch profile: User not found";
      }

      const { passwordHash, stripeCustomerId, stripeSubscriptionId, ...safeUser } = user;

      console.log(`[TOOL] Profile fetched successfully for user ${context.userId}`);
      return `User Profile:
Name: ${user.firstName} ${user.lastName}
Email: ${user.email}
Position: ${user.position || "Not set"}
Location: ${user.location || "Not set"}
Bio: ${user.bio || "Not set"}
Phone: ${user.phone || "Not set"}
LinkedIn: ${user.linkedinUrl || "Not set"}
Portfolio: ${user.portfolioUrl || "Not set"}
Preferred Locations: ${user.preferredLocations.join(", ")}
Subscription: ${user.subscriptionTier}`;
    },
    {
      name: "get_user_profile",
      description: "Get the current user's profile information",
      schema: z.object({}),
    }
  );
};

export const createSearchJobsTool = (context: ToolExecutionContext) => {
  return tool(
    async ({ query, location, limit = 10 }) => {
      console.log(`[TOOL] search_jobs called with:`, { query, location, limit });
      const filter: any = { isActive: true };

      if (query) {
        filter.$or = [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ];
      }

      if (location && location !== "Remote") {
        filter.location = { $regex: location, $options: "i" };
      }

      const jobs = await JobPost.find(filter)
        .populate("recruiter", "firstName lastName companyName")
        .populate("jobType", "name")
        .populate("workMode", "name")
        .populate("experienceLevel", "name")
        .populate("requiredSkills", "name")
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      if (jobs.length === 0) {
        return "No jobs found matching your criteria.";
      }

      const jobsList = jobs.map((job: any, idx) => {
        return `${idx + 1}. ${job.title} at ${job.recruiter?.companyName || "Company"}
   Location: ${job.location || "Remote"}
   Type: ${job.jobType?.name || "N/A"} | Mode: ${job.workMode?.name || "N/A"}
   Experience: ${job.experienceLevel?.name || "N/A"}
   Salary: $${job.salaryMin} - $${job.salaryMax}
   Skills: ${job.requiredSkills?.map((s: any) => s.name).join(", ") || "None"}
   Job ID: ${job._id}`;
      }).join("\n\n");

      return `Found ${jobs.length} job(s):\n\n${jobsList}`;
    },
    {
      name: "search_jobs",
      description: "Search for job postings based on keywords, location, and other criteria",
      schema: z.object({
        query: z.string().optional().describe("Search keywords for job title or description"),
        location: z.string().optional().describe("Preferred job location"),
        limit: z.number().min(1).max(50).optional().describe("Maximum number of results to return (default 10)"),
      }),
    }
  );
};

export const createGetJobDetailsTool = (context: ToolExecutionContext) => {
  return tool(
    async ({ jobId }) => {
      console.log(`[TOOL] get_job_details called for jobId: ${jobId}`);
      const job = await JobPost.findById(jobId)
        .populate("recruiter", "firstName lastName companyName companyWebsite email")
        .populate("jobType", "name")
        .populate("workMode", "name")
        .populate("experienceLevel", "name")
        .populate("requiredSkills", "name")
        .lean();

      if (!job) {
        return "Job not found with the provided ID.";
      }

      console.log(`[TOOL] Job details fetched successfully for jobId: ${jobId}`);
      return `Job Details:
Title: ${job.title}
Company: ${(job.recruiter as any)?.companyName || "N/A"}
Location: ${job.location || "Remote"}
Type: ${(job.jobType as any)?.name || "N/A"}
Work Mode: ${(job.workMode as any)?.name || "N/A"}
Experience Level: ${(job.experienceLevel as any)?.name || "N/A"}
Salary Range: $${job.salaryMin} - $${job.salaryMax}
Required Skills: ${(job.requiredSkills as any[])?.map((s: any) => s.name).join(", ") || "None"}
Application Email: ${job.applicationEmail || "Apply through platform"}
Description: ${job.description}
Posted: ${new Date(job.createdAt).toLocaleDateString()}`;
    },
    {
      name: "get_job_details",
      description: "Get detailed information about a specific job posting using its ID",
      schema: z.object({
        jobId: z.string().describe("The MongoDB ObjectId of the job post"),
      }),
    }
  );
};

export const createApplyToJobTool = (context: ToolExecutionContext) => {
  return tool(
    async ({ jobId, coverLetter }) => {
      console.log(`[TOOL] apply_to_job called for jobId: ${jobId}`);
      const existing = await JobApplication.findOne({
        user: context.userId,
        job: jobId,
      });

      if (existing) {
        return "You have already applied to this job.";
      }

      const job = await JobPost.findById(jobId);
      if (!job) {
        return "Job not found with the provided ID.";
      }

      const status = await JobApplicationStatus.findOne({ name: /pending/i });

      const application = new JobApplication({
        user: context.userId,
        job: jobId,
        coverLetter: coverLetter || null,
        status: status?._id,
        appliedAt: new Date(),
      });

      await application.save();
      console.log(`[TOOL] Job application created successfully`);

      return `Successfully applied to the job! Your application has been submitted.`;
    },
    {
      name: "apply_to_job",
      description: "Submit a job application for a specific job posting",
      schema: z.object({
        jobId: z.string().describe("The MongoDB ObjectId of the job post to apply to"),
        coverLetter: z.string().max(1000).optional().describe("Optional cover letter (max 1000 characters)"),
      }),
    }
  );
};

export const createGetSavedJobsTool = (context: ToolExecutionContext) => {
  return tool(
    async () => {
      console.log(`[TOOL] get_saved_jobs called for user ${context.userId}`);
      const savedJobs = await SavedJob.find({ user: context.userId })
        .populate({
          path: "job",
          populate: [
            { path: "recruiter", select: "firstName lastName companyName" },
            { path: "jobType", select: "name" },
            { path: "workMode", select: "name" },
          ],
        })
        .sort({ createdAt: -1 })
        .lean();

      if (savedJobs.length === 0) {
        return "You have no saved jobs.";
      }

      console.log(`[TOOL] Saved jobs fetched successfully for user ${context.userId}`);
      const jobsList = savedJobs.map((saved: any, idx) => {
        const job = saved.job;
        return `${idx + 1}. ${job.title} at ${job.recruiter?.companyName || "Company"}
   Location: ${job.location || "Remote"}
   Salary: $${job.salaryMin} - $${job.salaryMax}
   Saved on: ${new Date(saved.createdAt).toLocaleDateString()}
   Job ID: ${job._id}`;
      }).join("\n\n");

      return `You have ${savedJobs.length} saved job(s):\n\n${jobsList}`;
    },
    {
      name: "get_saved_jobs",
      description: "Get all jobs that the user has saved for later",
      schema: z.object({}),
    }
  );
};

export const createSaveJobTool = (context: ToolExecutionContext) => {
  return tool(
    async ({ jobId }) => {
      console.log(`[TOOL] save_job called for jobId: ${jobId}`);
      const existing = await SavedJob.findOne({
        user: context.userId,
        job: jobId,
      });

      if (existing) {
        return "This job is already in your saved jobs.";
      }

      const job = await JobPost.findById(jobId);
      if (!job) {
        return "Job not found with the provided ID.";
      }

      const savedJob = new SavedJob({
        user: context.userId,
        job: jobId,
      });

      await savedJob.save();
      console.log(`[TOOL] Job saved successfully`);

      return `Job saved successfully! You can view it in your saved jobs.`;
    },
    {
      name: "save_job",
      description: "Save a job posting for later review",
      schema: z.object({
        jobId: z.string().describe("The MongoDB ObjectId of the job post to save"),
      }),
    }
  );
};

export const createAddSkillTool = (context: ToolExecutionContext) => {
  return tool(
    async ({ skillName, proficiencyLevel }) => {
      console.log(`[TOOL] add_skill called with:`, { skillName, proficiencyLevel });
      const skill = await Skill.findOne({ name: { $regex: new RegExp(`^${skillName}$`, "i") } });

      if (!skill) {
        return `Skill "${skillName}" not found in the system. Please use an existing skill name.`;
      }

      const existing = await UserSkill.findOne({
        user: context.userId,
        skillId: skill._id,
      });

      if (existing) {
        return `You already have "${skillName}" in your skills.`;
      }

      let proficiencyLevelId = null;
      if (proficiencyLevel) {
        const profLevel = await ProficiencyLevel.findOne({ 
          name: { $regex: new RegExp(`^${proficiencyLevel}$`, "i") } 
        });
        if (profLevel) {
          proficiencyLevelId = profLevel._id;
        }
      }

      const userSkill = new UserSkill({
        user: context.userId,
        skillId: skill._id,
        proficiencyLevelId: proficiencyLevelId,
      });

      await userSkill.save();
      await invalidateCache([`users:${context.userId}`, "users:*", `user-skills:${context.userId}`]);
      console.log(`[TOOL] Skill added successfully`);

      return `Successfully added ${skillName} skill${proficiencyLevel ? ` with ${proficiencyLevel} proficiency` : ''} to your profile!`;
    },
    {
      name: "add_skill",
      description: "Add a skill to the user's profile",
      schema: z.object({
        skillName: z.string().describe("Name of the skill to add"),
        proficiencyLevel: z.string().optional().describe("Proficiency level (Beginner, Intermediate, Advanced, Expert)"),
      }),
    }
  );
};

export const createAddExperienceTool = (context: ToolExecutionContext) => {
  return tool(
    async ({ company, position, location, startDate, endDate, isCurrent, description }) => {
      console.log(`[TOOL] add_experience called with:`, { company, position });
      try {
      const experience = new UserExperience({
        user: context.userId,
        jobTitle: position,
        company,
        location: location || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        description: description || null,
      });

      await experience.save();
    }catch(ex) {
      console.log("error: ", ex)
      throw ex;
    }
      
      // Refetch to verify
      const verifyExp = await UserExperience.findById(experience._id).lean();
      console.log(`[TOOL] Experience saved to DB:`, verifyExp);
      
      await invalidateCache([`users:${context.userId}`, "users:*", `user-experiences:${context.userId}`]);
      console.log(`[TOOL] Experience added successfully`);

      return `Successfully added work experience at ${company} as ${position} to your profile!`;
    },
    {
      name: "add_experience",
      description: "Add work experience to the user's profile",
      schema: z.object({
        company: z.string().describe("Company name"),
        position: z.string().describe("Job position/title"),
        location: z.string().optional().describe("Job location (city, state/country)"),
        startDate: z.string().describe("Start date (YYYY-MM-DD format)"),
        endDate: z.string().optional().describe("End date (YYYY-MM-DD format). Leave empty if current position"),
        isCurrent: z.boolean().optional().describe("Whether this is the current position"),
        description: z.string().max(500).optional().describe("Job description and responsibilities"),
      }),
    }
  );
};

export const createAddEducationTool = (context: ToolExecutionContext) => {
  return tool(
    async ({ institution, degree, fieldOfStudy, startDate, endDate, description }) => {
      console.log(`[TOOL] add_education called with:`, { institution, degree, fieldOfStudy });
      const education = new UserEducation({
        user: context.userId,
        institution,
        degree,
        fieldOfStudy,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description: description || null,
      });

      await education.save();
      await invalidateCache([`users:${context.userId}`, "users:*", `user-educations:${context.userId}`]);
      console.log(`[TOOL] Education added successfully`);

      return `Successfully added ${degree} in ${fieldOfStudy} from ${institution} to your profile!`;
    },
    {
      name: "add_education",
      description: "Add education entry to the user's profile",
      schema: z.object({
        institution: z.string().describe("Educational institution name"),
        degree: z.string().describe("Degree obtained (e.g., Bachelor's, Master's)"),
        fieldOfStudy: z.string().describe("Field of study or major"),
        startDate: z.string().describe("Start date (YYYY-MM-DD format)"),
        endDate: z.string().optional().describe("End date (YYYY-MM-DD format). Leave empty if currently studying"),
        description: z.string().optional().describe("Optional description of achievements or coursework"),
      }),
    }
  );
};

export const createAddCertificationTool = (context: ToolExecutionContext) => {
  return tool(
    async ({ name, issuingOrganization, issueDate, expiryDate, credentialUrl }) => {
      console.log(`[TOOL] add_certification called with:`, { name, issuingOrganization });
      const certification = new UserCertification({
        user: context.userId,
        name,
        issuingOrganization,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialUrl: credentialUrl || null,
      });

      await certification.save();
      await invalidateCache([`users:${context.userId}`, "users:*", `user-certifications:${context.userId}`]);
      console.log(`[TOOL] Certification added successfully`);

      return `Successfully added ${name} certification from ${issuingOrganization} to your profile!`;
    },
    {
      name: "add_certification",
      description: "Add a professional certification to the user's profile",
      schema: z.object({
        name: z.string().describe("Certification name"),
        issuingOrganization: z.string().describe("Organization that issued the certification"),
        issueDate: z.string().describe("Issue date (YYYY-MM-DD format)"),
        expiryDate: z.string().optional().describe("Expiry date (YYYY-MM-DD format) if applicable"),
        credentialUrl: z.string().url().optional().describe("URL to verify the credential"),
      }),
    }
  );
};

export const createGetMyApplicationsTool = (context: ToolExecutionContext) => {
  return tool(
    async () => {
      console.log(`[TOOL] get_my_applications called for user ${context.userId}`);
      const applications = await JobApplication.find({ user: context.userId })
        .populate({
          path: "job",
          populate: [
            { path: "recruiter", select: "firstName lastName companyName" },
          ],
        })
        .populate("status", "name")
        .sort({ appliedAt: -1 })
        .lean();

      if (applications.length === 0) {
        return "You have not applied to any jobs yet.";
      }

      const appsList = applications.map((app: any, idx) => {
        const job = app.job;
        return `${idx + 1}. ${job.title} at ${job.recruiter?.companyName || "Company"}
   Status: ${app.status?.name || "Pending"}
   Applied on: ${new Date(app.appliedAt).toLocaleDateString()}
   Application ID: ${app._id}`;
      }).join("\n\n");

      return `You have applied to ${applications.length} job(s):\n\n${appsList}`;
    },
    {
      name: "get_my_applications",
      description: "Get all job applications submitted by the user",
      schema: z.object({}),
    }
  );
};

export const getAllTools = (context: ToolExecutionContext) => {
  return [
    createGetProfileTool(context),
    createUpdateProfileTool(context),
    createSearchJobsTool(context),
    createGetJobDetailsTool(context),
    createApplyToJobTool(context),
    createSaveJobTool(context),
    createGetSavedJobsTool(context),
    createAddSkillTool(context),
    createAddExperienceTool(context),
    createAddEducationTool(context),
    createAddCertificationTool(context),
    createGetMyApplicationsTool(context),
  ];
};

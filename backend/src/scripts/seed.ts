import bcrypt from "bcryptjs";
import "dotenv/config";
import mongoose from "mongoose";
import {
  certificationsData,
  chatData,
  educationsData,
  experienceLevelsData,
  experiencesData,
  jobApplicationsData,
  jobApplicationStatusesData,
  jobPostsData,
  jobTypesData,
  postsData,
  proficiencyLevelsData,
  rolesData,
  savedJobsData,
  shortlistStatusesData,
  skillCategoriesData,
  skillsData,
  usersData,
  workModesData,
} from "../data";

import {
  Chat,
  ExperienceLevel,
  JobApplication,
  JobApplicationStatus,
  JobPost,
  JobType,
  Post,
  ProficiencyLevel,
  Role,
  SavedJob,
  ShortlistStatus,
  Skill,
  SkillCategory,
  User,
  UserCertification,
  UserEducation,
  UserExperience,
  WorkMode,
} from "../models";

export async function seedChats() {
  for (const chat of chatData) {
    const recruiter = await User.findOne({ email: chat.recruiterEmail });
    const candidate = await User.findOne({ email: chat.candidateEmail });

    if (!recruiter || !candidate) {
      console.error("Recruiter or Candidate not found. Seed users first.");
      continue;
    }

    const exists = await Chat.findOne({ recruiter: recruiter._id, candidate: candidate._id });
    if (exists) {
      console.log(
        `Chat between ${chat.recruiterEmail} and ${chat.candidateEmail} already exists. Skipping.`
      );
      continue;
    }

    const messages = chat.messages.map((m) => ({
      sender: m.senderType === "recruiter" ? recruiter._id : candidate._id,
      content: m.content,
      isRead: m.isRead,
      createdAt: m.createdAt,
      updatedAt: m.createdAt,
    }));

    await Chat.create({
      recruiter: recruiter._id,
      candidate: candidate._id,
      messages,
    });

    console.log(`Chat created between ${chat.recruiterEmail} and ${chat.candidateEmail}`);
  }

  console.log("Chat seeding complete.");
}

async function seedExperienceLevels() {
  for (const name of experienceLevelsData) {
    const exists = await ExperienceLevel.findOne({ name });
    if (exists) {
      console.log(`Experience Level '${name}' already exists. Skipping.`);
      continue;
    }
    await ExperienceLevel.create({ name });
    console.log(`Created Experience Level '${name}'.`);
  }
}

export async function seedJobApplications() {
  for (const app of jobApplicationsData) {
    const user = await User.findOne({ email: app.userEmail });
    const job = await JobPost.findOne({ title: app.jobTitle });
    const status = await JobApplicationStatus.findOne({ name: app.statusName });

    if (!user || !job || !status) {
      console.error(`Cannot seed application for ${app.userEmail} - missing user, job, or status.`);
      continue;
    }

    const exists = await JobApplication.findOne({ user: user._id, job: job._id });
    if (exists) {
      console.log(
        `Job application for ${app.userEmail} on job '${app.jobTitle}' already exists. Skipping.`
      );
      continue;
    }

    await JobApplication.create({
      user: user._id,
      job: job._id,
      coverLetter: app.coverLetter,
      resumeUrl: app.resumeUrl,
      status: status._id,
      appliedAt: app.appliedAt,
    });

    console.log(`Created job application for ${app.userEmail} on job '${app.jobTitle}'`);
  }

  console.log("Job applications seeding complete.");
}

async function seedJobApplicationStatuses() {
  for (const name of jobApplicationStatusesData) {
    const exists = await JobApplicationStatus.findOne({ name });
    if (exists) {
      console.log(`Job Application Status '${name}' already exists. Skipping.`);
      continue;
    }
    await JobApplicationStatus.create({ name });
    console.log(`Created Job Application Status '${name}'.`);
  }
}

export async function seedJobPosts() {
  for (const jp of jobPostsData) {
    const recruiter = await User.findOne({ email: jp.recruiterEmail });
    const jobType = await JobType.findOne({ name: jp.jobTypeName });
    const workMode = await WorkMode.findOne({ name: jp.workModeName });
    const experienceLevel = await ExperienceLevel.findOne({ name: jp.experienceLevelName });

    if (!recruiter) {
      console.error(`Recruiter ${jp.recruiterEmail} not found. Seed users first.`);
      continue;
    }

    const exists = await JobPost.findOne({ recruiter: recruiter._id, title: jp.title });
    if (exists) {
      console.log(`Job post '${jp.title}' already exists. Skipping.`);
      continue;
    }

    // Convert skill names to ObjectIds
    const skills = await Skill.find({ name: { $in: jp.requiredSkills } });
    const skillIds = skills.map((s) => s._id);

    await JobPost.create({
      recruiter: recruiter._id,
      title: jp.title,
      description: jp.description,
      location: jp.location,
      jobType: jobType?._id || null,
      workMode: workMode?._id || null,
      experienceLevel: experienceLevel?._id || null,
      salaryMin: jp.salaryMin,
      salaryMax: jp.salaryMax,
      isActive: jp.isActive,
      requiredSkills: skillIds,
    });

    console.log(`Created job post: '${jp.title}' with ${skillIds.length} required skills`);
  }

  console.log("Job posts seeding complete.");
}

async function seedJobTypes() {
  for (const name of jobTypesData) {
    const exists = await JobType.findOne({ name });
    if (exists) {
      console.log(`Job Type '${name}' already exists. Skipping.`);
      continue;
    }
    await JobType.create({ name });
    console.log(`Created Job Type '${name}'.`);
  }
}

export async function seedPosts() {
  for (const p of postsData) {
    const user = await User.findOne({ email: p.userEmail });
    if (!user) {
      console.error(`User ${p.userEmail} not found. Seed users first.`);
      continue;
    }

    const exists = await Post.findOne({ user: user._id, content: p.content });
    if (exists) {
      console.log(`Post by ${p.userEmail} already exists. Skipping.`);
      continue;
    }

    const comments = [];
    for (const c of p.comments) {
      const commenter = await User.findOne({ email: c.commenterEmail });
      if (!commenter) {
        console.warn(`Commenter ${c.commenterEmail} not found. Skipping comment.`);
        continue;
      }
      comments.push({
        user: commenter._id,
        content: c.content,
        createdAt: p.createdAt,
        updatedAt: p.createdAt,
      });
    }

    await Post.create({
      user: user._id,
      content: p.content,
      imageUrl: p.imageUrl,
      likes: p.likes,
      comments,
      createdAt: p.createdAt,
      updatedAt: p.createdAt,
    });

    console.log(`Created post for user ${p.userEmail}`);
  }

  console.log("Posts seeding complete.");
}

async function seedProficiencyLevels() {
  for (const name of proficiencyLevelsData) {
    const exists = await ProficiencyLevel.findOne({ name });
    if (exists) {
      console.log(`Proficiency Level '${name}' already exists. Skipping.`);
      continue;
    }
    await ProficiencyLevel.create({ name });
    console.log(`Created Proficiency Level '${name}'.`);
  }
}

async function seedShortlistStatuses() {
  for (const name of shortlistStatusesData) {
    const exists = await ShortlistStatus.findOne({ name });
    if (exists) {
      console.log(`Shortlist Status '${name}' already exists. Skipping.`);
      continue;
    }
    await ShortlistStatus.create({ name });
    console.log(`Created Shortlist Status '${name}'.`);
  }
}

async function seedRoles() {
  const rolesMap: Record<string, mongoose.Types.ObjectId> = {};

  for (const name of rolesData) {
    let role = await Role.findOne({ name });
    if (!role) {
      role = await Role.create({ name });
      console.log(`Created role '${name}'.`);
    } else {
      console.log(`Role '${name}' already exists.`);
    }

    rolesMap[name] = role._id as mongoose.Types.ObjectId;
  }

  return rolesMap;
}

export async function seedSavedJobs() {
  for (const sj of savedJobsData) {
    const user = await User.findOne({ email: sj.userEmail });
    const job = await JobPost.findOne({ title: sj.jobTitle });

    if (!user || !job) {
      console.error(
        `Cannot save job '${sj.jobTitle}' for user '${sj.userEmail}'. Missing user or job.`
      );
      continue;
    }

    const exists = await SavedJob.findOne({ user: user._id, job: job._id });
    if (exists) {
      console.log(`User '${sj.userEmail}' already saved job '${sj.jobTitle}'. Skipping.`);
      continue;
    }

    await SavedJob.create({ user: user._id, job: job._id });
    console.log(`User '${sj.userEmail}' saved job '${sj.jobTitle}'.`);
  }

  console.log("Saved jobs seeding complete.");
}

async function seedSkills(categoriesMap: Record<string, mongoose.Types.ObjectId>) {
  for (const [categoryName, skills] of Object.entries(skillsData)) {
    const categoryId = categoriesMap[categoryName];

    for (const name of skills) {
      const exists = await Skill.findOne({ name });
      if (exists) {
        console.log(`Skill '${name}' already exists. Skipping.`);
        continue;
      }

      await Skill.create({ name, category: categoryId });
      console.log(`Created skill '${name}' under category '${categoryName}'.`);
    }
  }

  console.log("Skill seeding complete.");
}

async function seedSkillCategories() {
  const categoriesMap: Record<string, mongoose.Types.ObjectId> = {};

  for (const name of skillCategoriesData) {
    let category = await SkillCategory.findOne({ name });
    if (!category) {
      category = await SkillCategory.create({ name });
      console.log(`Created skill category '${name}'.`);
    } else {
      console.log(`Skill category '${name}' already exists.`);
    }
    categoriesMap[name] = category._id as mongoose.Types.ObjectId;
  }

  return categoriesMap;
}

async function seedUsers(roles: Record<string, mongoose.Types.ObjectId>) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  for (const u of usersData) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`User ${u.email} already exists. Skipping.`);
      continue;
    }

    const user = await User.create({
      ...u,
      passwordHash,
      roleId: roles[u.role],
      publicEmail: null,
      location: "Remote",
      phone: null,
      linkedinUrl: null,
      portfolioUrl: null,
      companyName: null,
      companyWebsite: null,
      imageUrl: null,
    });

    console.log(`Created user: ${user.email}`);
  }

  console.log("User seeding complete.");
}

export async function seedUserCertifications() {
  for (const cert of certificationsData) {
    const user = await User.findOne({ email: cert.userEmail });
    if (!user) {
      console.error(`User '${cert.userEmail}' not found. Seed users first.`);
      continue;
    }

    const exists = await UserCertification.findOne({
      user: user._id,
      name: cert.name,
      issuingOrganization: cert.issuingOrganization,
    });

    if (exists) {
      console.log(
        `Certification '${cert.name}' for user '${cert.userEmail}' already exists. Skipping.`
      );
      continue;
    }

    await UserCertification.create({
      user: user._id,
      name: cert.name,
      issuingOrganization: cert.issuingOrganization,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate,
      credentialUrl: cert.credentialUrl,
      imageUrl: cert.imageUrl,
    });

    console.log(`Added certification '${cert.name}' for user '${cert.userEmail}'`);
  }

  console.log("User certifications seeding complete.");
}

async function seedUserEducation() {
  for (const edu of educationsData) {
    const user = await User.findOne({ email: edu.userEmail });
    if (!user) {
      console.log(`User ${edu.userEmail} not found. Skipping education.`);
      continue;
    }

    const exists = await UserEducation.findOne({
      user: user._id,
      degree: edu.degree,
      institution: edu.institution,
    });
    if (exists) {
      console.log(`Education '${edu.degree}' for ${edu.userEmail} already exists.`);
      continue;
    }

    await UserEducation.create({ ...edu, user: user._id });
    console.log(`Added education: ${edu.degree} for ${edu.userEmail}`);
  }

  console.log("User education seeding complete.");
}

async function seedUserExperience() {
  for (const exp of experiencesData) {
    const user = await User.findOne({ email: exp.userEmail });
    if (!user) {
      console.log(`User ${exp.userEmail} not found. Skipping experience.`);
      continue;
    }

    const exists = await UserExperience.findOne({
      user: user._id,
      jobTitle: exp.jobTitle,
      company: exp.company,
    });

    if (exists) {
      console.log(`Experience '${exp.jobTitle}' for ${exp.userEmail} already exists.`);
      continue;
    }

    await UserExperience.create({ ...exp, user: user._id });
    console.log(`Added experience: ${exp.jobTitle} for ${exp.userEmail}`);
  }

  console.log("User experience seeding complete.");
}

export async function seedWorkModes() {
  for (const name of workModesData) {
    const exists = await WorkMode.findOne({ name });
    if (exists) {
      console.log(`Work mode '${name}' already exists. Skipping.`);
      continue;
    }

    await WorkMode.create({ name });
    console.log(`Created work mode '${name}'.`);
  }

  console.log("Work modes seeding complete.");
}

export async function runSeed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("Missing MONGODB_URI in environment.");

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const roles = await seedRoles();
    const categoriesMap = await seedSkillCategories();

    await seedChats();
    await seedJobApplications();
    await seedJobApplicationStatuses();
    await seedJobPosts();
    await seedJobTypes();
    await seedPosts();
    await seedProficiencyLevels();
    await seedUsers(roles);
    await seedUserEducation();
    await seedUserExperience();
    await seedExperienceLevels();
    await seedShortlistStatuses();
    await seedSkills(categoriesMap);
    await seedWorkModes();

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

if (process.argv[1].includes("seed.ts") || process.argv[1].includes("seed.js")) {
  runSeed();
}

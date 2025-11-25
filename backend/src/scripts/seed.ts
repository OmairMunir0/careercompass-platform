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
  interviewQuestionsData,
  followsData,
  userSkillsData,
  notificationsData,
  blogsData,
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
  InterviewQuestion,
} from "../models";
import { Follow } from "../models/Follow";
import { UserSkill } from "../models/UserSkill";
import { Notification } from "../models/Notification";
import { Blog } from "../models/Blog";

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

    const job = await JobPost.create({
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

    // Create corresponding timeline post (matching createJobPost controller logic)
    try {
      const baseUrl = process.env.FRONTEND_URL || process.env.APP_BASE_URL || "http://localhost:3000";
      const skillsText = skills.map((s) => s.name).join(", ");
      const viewUrl = `${baseUrl}/find-jobs/${job._id}`;

      const content = [
        `New Job: ${jp.title}`,
        `Description: ${jp.description}`,
      ].filter(Boolean).join("\n");

      const timelinePost = await Post.create({
        user: recruiter._id,
        content,
        imageUrl: null,
        type: "job",
        jobPostId: job._id,
        jobMeta: {
          title: jp.title,
          location: jp.location ?? null,
          salaryMin: jp.salaryMin,
          salaryMax: jp.salaryMax,
          jobType: jobType?.name ?? null,
          workMode: workMode?.name ?? null,
          experienceLevel: experienceLevel?.name ?? null,
          requiredSkills: skills.map((s) => s.name),
          url: viewUrl,
          applicationEmail: jp.applicationEmail ?? null,
        },
      });

      // Update job post with timeline post reference
      job.timelinePostId = timelinePost._id as any;
      await job.save();

      console.log(`Created timeline post for job: '${jp.title}'`);
    } catch (postErr) {
      console.error(`Failed to create timeline post for job '${jp.title}':`, postErr);
    }
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
      likes: [], // Initialize as empty array, will be populated later if needed
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


export async function seedInterviewQuestions() {
  // Map skill categories to their ObjectIds
  const categories = await SkillCategory.find({});
  const categoriesMap: Record<string, mongoose.Types.ObjectId> = {};
  categories.forEach((c) => {
    categoriesMap[c.name] = c._id || c.id;
  });

  // Loop through the interviewQuestionsData
  for (const [categoryName, questions] of Object.entries(interviewQuestionsData)) {
    const categoryId = categoriesMap[categoryName];
    if (!categoryId) {
      console.warn(`Category '${categoryName}' not found. Skipping questions.`);
      continue;
    }

    for (const q of questions) {
      const exists = await InterviewQuestion.findOne({
        question: q.question,
        categoryId: categoryId,
      });

      if (exists) {
        console.log(`Question already exists in category '${categoryName}'. Skipping.`);
        continue;
      }

      await InterviewQuestion.create({
        question: q.question,
        answer: q.answer,
        categoryId: categoryId,
      });

      console.log(`Created question in category '${categoryName}': ${q.question}`);
    }
  }

  console.log("Interview questions seeding complete.");
}

export async function seedFollows() {
  for (const follow of followsData) {
    const follower = await User.findOne({ email: follow.followerEmail });
    const following = await User.findOne({ email: follow.followingEmail });

    if (!follower || !following) {
      console.error(
        `Cannot create follow relationship. Follower: ${follow.followerEmail}, Following: ${follow.followingEmail}`
      );
      continue;
    }

    const exists = await Follow.findOne({
      follower: follower._id,
      following: following._id,
    });

    if (exists) {
      console.log(
        `Follow relationship already exists: ${follow.followerEmail} -> ${follow.followingEmail}. Skipping.`
      );
      continue;
    }

    await Follow.create({
      follower: follower._id,
      following: following._id,
    });

    // Update follower and following counts
    await User.findByIdAndUpdate(follower._id, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(following._id, { $inc: { followersCount: 1 } });

    console.log(`Created follow: ${follow.followerEmail} -> ${follow.followingEmail}`);
  }

  console.log("Follow relationships seeding complete.");
}

export async function seedUserSkills() {
  for (const us of userSkillsData) {
    const user = await User.findOne({ email: us.userEmail });
    const skill = await Skill.findOne({ name: us.skillName });
    const proficiencyLevel = await ProficiencyLevel.findOne({ name: us.proficiencyLevel });

    if (!user || !skill) {
      console.error(
        `Cannot create user skill. User: ${us.userEmail}, Skill: ${us.skillName}`
      );
      continue;
    }

    const exists = await UserSkill.findOne({
      user: user._id,
      skillId: skill._id,
    });

    if (exists) {
      console.log(
        `User skill already exists: ${us.userEmail} - ${us.skillName}. Skipping.`
      );
      continue;
    }

    await UserSkill.create({
      user: user._id,
      skillId: skill._id,
      proficiencyLevelId: proficiencyLevel?._id || null,
    });

    console.log(`Created user skill: ${us.userEmail} - ${us.skillName}`);
  }

  console.log("User skills seeding complete.");
}

export async function seedNotifications() {
  for (const notif of notificationsData) {
    const user = await User.findOne({ email: notif.userEmail });

    if (!user) {
      console.error(`User ${notif.userEmail} not found. Skipping notification.`);
      continue;
    }

    await Notification.create({
      user: user._id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
    });

    console.log(`Created notification for ${notif.userEmail}: ${notif.title}`);
  }

  console.log("Notifications seeding complete.");
}

export async function seedBlogs() {
  for (const blog of blogsData) {
    const author = await User.findOne({ email: blog.authorEmail });

    if (!author) {
      console.error(`Author ${blog.authorEmail} not found. Skipping blog.`);
      continue;
    }

    const exists = await Blog.findOne({
      author: author._id,
      title: blog.title,
    });

    if (exists) {
      console.log(`Blog '${blog.title}' already exists. Skipping.`);
      continue;
    }

    await Blog.create({
      title: blog.title,
      content: blog.content,
      author: author._id,
      authorName: `${author.firstName} ${author.lastName}`,
      authorAvatar: author.imageUrl,
      image: blog.image,
      tags: blog.tags,
      likes: [],
      comments: [],
      createdAt: blog.createdAt,
    });

    console.log(`Created blog: ${blog.title} by ${blog.authorEmail}`);
  }

  console.log("Blogs seeding complete.");
}

export async function runSeed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("Missing MONGODB_URI in environment.");

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const roles = await seedRoles();
    const categoriesMap = await seedSkillCategories();

    // Seed reference data first
    await seedExperienceLevels();
    await seedJobApplicationStatuses();
    await seedJobTypes();
    await seedProficiencyLevels();
    await seedShortlistStatuses();
    await seedSkills(categoriesMap);
    await seedWorkModes();

    // Seed users
    await seedUsers(roles);

    // Seed user-related data
    await seedUserEducation();
    await seedUserExperience();
    await seedUserCertifications();
    await seedUserSkills();

    // Seed posts and jobs
    await seedPosts();
    await seedJobPosts();
    await seedBlogs();

    // Seed interactions
    await seedFollows();
    await seedChats();
    await seedJobApplications();
    await seedSavedJobs();
    await seedNotifications();

    // Seed interview questions
    await seedInterviewQuestions();

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

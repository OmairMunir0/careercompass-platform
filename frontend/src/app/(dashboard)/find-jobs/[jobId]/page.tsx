"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { ArrowLeft, Building, CheckCircle, DollarSign, Heart, MapPin, Send, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Job {
  id: string;
  title: string;
  company?: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  skills: { id: string; skillName: string }[];
  isSaved: boolean;
  hasApplied: boolean;
  jobType?: { id: string; name: string };
  experienceLevel?: { id: string; name: string };
  workMode?: { id: string; name: string };
  isRemote?: boolean;
}

const JobDetail = () => {
  const { jobId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);

  useEffect(() => {
    if (jobId) loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      const res = await axiosInstance.get(`/job-posts/${jobId}`);
      const data = res.data;

      const mapped: Job = {
        id: data._id,
        title: data.title,
        company: data.recruiter?.name || "Unknown Recruiter",
        location: data.location,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        description: data.description,
        skills: (data.requiredSkills || []).map((s: any) => ({
          id: s._id,
          skillName: s.name,
        })),
        jobType: data.jobType ? { id: data.jobType._id, name: data.jobType.name } : undefined,
        experienceLevel: data.experienceLevel
          ? { id: data.experienceLevel._id, name: data.experienceLevel.name }
          : undefined,
        workMode: data.workMode ? { id: data.workMode._id, name: data.workMode.name } : undefined,
        isSaved: !!data.isSaved,
        hasApplied: !!data.hasApplied,
      };

      setJob(mapped);
      setIsSaved(!!data.isSaved);
      setHasApplied(!!data.hasApplied);
    } catch {
      toast.error("Failed to load job details.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async () => {
    if (!user) return toast.error("Please sign in to save jobs.");
    if (!job) return;

    try {
      if (isSaved) {
        await axiosInstance.delete(`/saved-jobs/${job.id}`);
        setIsSaved(false);
        toast.success("Job removed from saved list.");
      } else {
        await axiosInstance.post("/saved-jobs", { job: job.id });
        setIsSaved(true);
        toast.success("Job saved successfully!");
      }
    } catch {
      toast.error("Could not update saved jobs.");
    }
  };

  const applyJob = async () => {
    if (!job) return;
    try {
      const form = new FormData();
      form.append("jobId", job.id);
      form.append("coverLetter", coverLetter);
      if (resume) form.append("resume", resume);

      await axiosInstance.post("/job-applications", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setHasApplied(true);
      setDrawerOpen(false);
      toast.success("Application submitted successfully!");
    } catch {
      toast.error("Application failed. Try again later.");
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (min && max) return `$${(min / 1000).toFixed(0)}k – $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${(max! / 1000).toFixed(0)}k`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );

  if (!job)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Job not found</h2>
        <button
          onClick={() => router.push("/find-jobs")}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Back to Jobs
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push("/find-jobs")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-2">
                {job.company && (
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4 text-purple-600" />
                    {job.company}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  {job.location}
                  {job.isRemote && <span className="text-green-600 ml-1">(Remote)</span>}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
              </div>
            </div>

            {user && (
              <button
                onClick={toggleSave}
                className={`p-2 rounded-md border transition ${
                  isSaved
                    ? "text-red-600 bg-red-50 border-red-200"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            {job.jobType?.name && (
              <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                {job.jobType.name}
              </span>
            )}
            {job.experienceLevel?.name && (
              <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {job.experienceLevel.name}
              </span>
            )}
            {job.workMode?.name && (
              <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                {job.workMode.name}
              </span>
            )}
          </div>

          {user && (
            <div className="mt-6">
              {hasApplied ? (
                <div className="flex items-center gap-2 px-5 py-3 bg-green-100 text-green-800 rounded-md">
                  <CheckCircle className="w-5 h-5" />
                  <span>Application Submitted</span>
                </div>
              ) : (
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <Send className="w-5 h-5" />
                  Apply Now
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {job.skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span
                  key={s.id}
                  className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                >
                  {s.skillName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-lg font-semibold">Apply for {job.title}</h3>
            <button onClick={() => setDrawerOpen(false)} className="text-gray-600 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write your cover letter..."
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              rows={6}
            />
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              className="w-full mb-4"
            />
            <button
              onClick={applyJob}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Submit Application
            </button>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDrawerOpen(false)} />
      )}
    </div>
  );
};

export default JobDetail;

"use client";

import axiosInstance from "@/lib/axiosInstance";
import { Pen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { PrimaryButton, SecondaryButton, TextAreaInput, TextInput } from "./ui";

export interface JobPostFormData {
  _id?: string;
  title: string;
  description: string;
  location?: string;
  jobType?: string;
  workMode?: string;
  experienceLevel?: string;
  salaryMin: number;
  salaryMax: number;
  requiredSkills?: string[];
  applicationEmail?: string;
}

interface JobPost {
  _id: string;
  title: string;
  description: string;
  location?: string;
  jobType?: { _id: string; name: string };
  workMode?: { _id: string; name: string };
  experienceLevel?: { _id: string; name: string };
  salaryMin: number;
  salaryMax: number;
  isActive: boolean;
  createdAt: string;
  requiredSkills?: { _id: string; name: string }[];
  applicationEmail?: string | null;
}

export default function JobPostManager() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [selected, setSelected] = useState<JobPostFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get<JobPost[]>("/job-posts/me");
      setJobs(data);
    } catch {
      toast.error("Failed to load job posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSuccess = () => {
    setSelected(null);
    setIsDrawerOpen(false);
    fetchJobs();
  };

  const handleAddNew = () => {
    setSelected({
      title: "",
      description: "",
      location: "",
      jobType: "",
      workMode: "",
      experienceLevel: "",
      salaryMin: 0,
      salaryMax: 0,
      requiredSkills: [],
      applicationEmail: "",
    });
    setIsDrawerOpen(true);
  };

  const handleEdit = (job: JobPost) => {
    setSelected({
      _id: job._id,
      title: job.title,
      description: job.description,
      location: job.location ?? "",
      jobType: job.jobType?._id,
      workMode: job.workMode?._id,
      experienceLevel: job.experienceLevel?._id,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      requiredSkills: (job.requiredSkills || []).map((s) => s._id),
      applicationEmail: job.applicationEmail ?? "",
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job post?")) return;
    try {
      await axiosInstance.delete(`/job-posts/${id}`);
      toast.success("Job post deleted!");
      fetchJobs();
    } catch {
      toast.error("Failed to delete job post.");
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await axiosInstance.put(`/job-posts/${id}/toggle`);
      toast.success("Job post status updated!");
      fetchJobs();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="p-4 bg-white space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Job Posts</h2>
        <PrimaryButton onClick={handleAddNew}>+ New Job Post</PrimaryButton>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[120px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-gray-600">No job posts yet.</p>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li
              key={job._id}
              className="border border-gray-300 rounded-md p-4 flex justify-between items-center hover:bg-gray-50"
            >
              <div className="cursor-pointer" onClick={() => handleEdit(job)}>
                <div className="font-medium">{job.title}</div>
                <div className="text-sm text-gray-700">
                  {job.location ?? "Location not specified"} |{" "}
                  {job.isActive ? "Active" : "Inactive"}
                </div>
                <div className="text-xs text-gray-500">
                  Posted: {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleStatus(job._id)}
                  className="p-1 rounded hover:bg-gray-200 text-sm"
                >
                  {job.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => handleEdit(job)} className="p-1 rounded hover:bg-gray-200">
                  <Pen className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(job._id)}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-end border-b-2 border-gray-200 px-4 py-3">
            <SecondaryButton onClick={() => setIsDrawerOpen(false)}>Close</SecondaryButton>
          </div>
          <div className="px-4 pb-3 overflow-y-auto">
            {selected && (
              <JobPostForm
                key={selected._id || "new"}
                data={selected}
                onSuccess={handleSuccess}
                onCancel={() => setIsDrawerOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsDrawerOpen(false)} />
      )}
    </div>
  );
}

// Form component
interface JobPostFormProps {
  data: JobPostFormData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function JobPostForm({ data, onSuccess, onCancel }: JobPostFormProps) {
  const isEdit = !!data._id;
  const [form, setForm] = useState<JobPostFormData>(data);
  const [loading, setLoading] = useState(false);
  const [jobTypes, setJobTypes] = useState<{ _id: string; name: string }[]>([]);
  const [workModes, setWorkModes] = useState<{ _id: string; name: string }[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<{ _id: string; name: string }[]>([]);
  const [skills, setSkills] = useState<{ _id: string; name: string }[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name.includes("salary") ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && data._id) {
        await axiosInstance.put(`/job-posts/${data._id}`, form);
        toast.success("Job post updated!");
      } else {
        await axiosInstance.post(`/job-posts`, form);
        toast.success("Job post created!");
      }
      onSuccess?.();
    } catch {
      toast.error("Failed to save job post.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [types, modes, levels, skillsRes] = await Promise.all([
          axiosInstance.get("/job-types"),
          axiosInstance.get("/work-modes"),
          axiosInstance.get("/experience-levels"),
          axiosInstance.get("/skills"),
        ]);
        setJobTypes(types.data);
        setWorkModes(modes.data);
        setExperienceLevels(levels.data);
        setSkills(skillsRes.data);
      } catch {
        toast.error("Failed to load job configuration data.");
      }
    };
    loadDropdowns();
  }, []);

  const handleSkillsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setForm((prev) => ({ ...prev, requiredSkills: values }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 w-[400px]">
      <TextInput
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Job Title"
        required
      />
      <TextAreaInput
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Job Description"
        rows={4}
        required
      />
      <TextInput
        name="location"
        value={form.location ?? ""}
        onChange={handleChange}
        placeholder="Location"
      />
      <TextInput
        name="applicationEmail"
        value={form.applicationEmail ?? ""}
        onChange={handleChange}
        placeholder="Application Email (optional)"
        type="email"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Job Type</label>
          <select
            name="jobType"
            value={form.jobType ?? ""}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm w-full  mt-1"
          >
            <option value="">Select Job Type</option>
            {jobTypes.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Work Mode</label>
          <select
            name="workMode"
            value={form.workMode ?? ""}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm w-full  mt-1"
          >
            <option value="">Select Work Mode</option>
            {workModes.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Experience Level</label>
          <select
            name="experienceLevel"
            value={form.experienceLevel ?? ""}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm w-full mt-1"
          >
            <option value="">Select Experience Level</option>
            {experienceLevels.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Required Skills</label>
        <select
          name="requiredSkills"
          multiple
          value={form.requiredSkills ?? []}
          onChange={handleSkillsChange}
          className="border border-gray-300 rounded-md px-2 py-2 text-sm w-full mt-1 h-32"
        >
          {skills.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple skills</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <TextInput
          type="number"
          name="salaryMin"
          value={form.salaryMin}
          onChange={handleChange}
          placeholder="Salary Min"
          required
        />
        <TextInput
          type="number"
          name="salaryMax"
          value={form.salaryMax}
          onChange={handleChange}
          placeholder="Salary Max"
          required
        />
      </div>

      <div className="flex gap-2 mt-2">
        <PrimaryButton type="submit" isLoading={loading}>
          {isEdit ? "Update" : "Create"}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
      </div>
    </form>
  );
}

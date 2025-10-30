"use client";

import { PrimaryButton, TextInput } from "@/components/ui";
import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import {
  Banknote,
  Bookmark,
  BookmarkMinus,
  Briefcase,
  CheckCircle,
  Eye,
  MapPin,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

interface IJobSkill {
  id: string;
  jobId: string;
  skillName: string;
}

interface IJobMeta {
  id: string;
  name: string;
}

interface IJobPost {
  _id: string;
  recruiter?: {
    _id: string;
    name?: string;
    email?: string;
  };
  title: string;
  description: string;
  location: string;
  jobType?: IJobMeta;
  workMode?: IJobMeta;
  experienceLevel?: IJobMeta;
  salaryMin?: number | null;
  salaryMax?: number | null;
  isActive?: boolean;
  skills?: IJobSkill[];
  requirements?: string | null;
  hasApplied?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const CandidateJobsPage: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [jobs, setJobs] = useState<IJobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [salaryRange, setSalaryRange] = useState({ min: 0, max: 200000 });
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/job-posts");
        const payload = res.data;
        const data = Array.isArray(payload?.results) ? payload.results : [];

        const normalized: IJobPost[] = data.map((j: any) => ({
          ...j,
          location: j.location ?? "Work From Home / Location Undisclosed",
          skills: (j.skills || []).map((s: any) => ({
            id: s.id,
            jobId: s.jobId,
            skillName: s.skillName,
          })) as IJobSkill[],
          jobType: j.jobType ? { id: j.jobType.id, name: j.jobType.name } : undefined,
          workMode: j.workMode ? { id: j.workMode.id, name: j.workMode.name } : undefined,
          experienceLevel: j.experienceLevel
            ? { id: j.experienceLevel.id, name: j.experienceLevel.name }
            : undefined,
          requirements: Array.isArray(j.requirements)
            ? j.requirements.join(", ")
            : j.requirements ?? null,
        }));

        setJobs(normalized);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const clearFilters = () => {
    setSelectedLocation("");
    setSelectedType("");
    setSelectedExperience("");
    setSalaryRange({ min: 0, max: 200000 });
    setIsRemoteOnly(false);
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "Not specified";
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}k`;
    return "Not specified";
  };

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase();

    return jobs.filter((job) => {
      if (isRemoteOnly && !job.workMode?.name.toLowerCase().includes("remote")) return false;
      if (selectedLocation && !job.location?.toLowerCase().includes(selectedLocation.toLowerCase()))
        return false;
      if (selectedType && !job.jobType?.name.toLowerCase().includes(selectedType.toLowerCase()))
        return false;
      if (
        selectedExperience &&
        !job.experienceLevel?.name.toLowerCase().includes(selectedExperience.toLowerCase())
      )
        return false;
      if (salaryRange.min > 0 && (job.salaryMax ?? job.salaryMin ?? 0) < salaryRange.min)
        return false;
      if (salaryRange.max < 200000 && (job.salaryMin ?? 0) > salaryRange.max) return false;

      if (term) {
        const hay =
          `${job.title} ${job.description} ${job.location} ${job.jobType?.name} ${job.experienceLevel?.name}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }

      return true;
    });
  }, [
    jobs,
    debouncedSearch,
    selectedLocation,
    selectedType,
    selectedExperience,
    salaryRange,
    isRemoteOnly,
  ]);

  const visibleJobs = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const loadMore = () => setVisibleCount((v) => v + 10);

  const handleSaveJob = async (jobId: string) => {
    if (!user) {
      setError("You must be signed in to save jobs.");
      return;
    }

    try {
      const isAlreadySaved = savedJobs.includes(jobId);

      if (isAlreadySaved) {
        await axiosInstance.delete(`/saved-jobs/${jobId}`);
        setSavedJobs((prev) => prev.filter((id) => id !== jobId));
      } else {
        await axiosInstance.post("/saved-jobs", { job: jobId });
        setSavedJobs((prev) => [...prev, jobId]);
      }
    } catch (err) {
      console.error("Failed to save job:", err);
      setError("Unable to save this job. Try again later.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );

  const handleNavigation = (jobId: string) => {
    router.push(`/find-jobs/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-purple-700 mb-2 sm:mb-0">Find Jobs</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded w-64"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="bg-white border-b border-gray-200 p-6 rounded-lg shadow-sm mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TextInput
              name="location"
              placeholder="Location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            />
            <TextInput
              name="jobType"
              placeholder="Job Type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            />
            <TextInput
              name="experienceLevel"
              placeholder="Experience Level"
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
              <input
                type="number"
                value={salaryRange.min}
                onChange={(e) =>
                  setSalaryRange((prev) => ({ ...prev, min: Number(e.target.value) }))
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
              <input
                type="number"
                value={salaryRange.max}
                onChange={(e) =>
                  setSalaryRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="remoteOnly"
                type="checkbox"
                checked={isRemoteOnly}
                onChange={(e) => setIsRemoteOnly(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="remoteOnly" className="text-sm text-gray-700">
                Remote Only
              </label>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <PrimaryButton onClick={clearFilters}>Clear Filters</PrimaryButton>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 p-3 m-4 rounded">{error}</div>
      )}

      <main className="p-6 max-w-3xl mx-auto flex flex-col gap-5">
        {visibleJobs.map((job) => (
          <div
            key={job._id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all duration-200 group"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-purple-700 transition">
                    {job.title}
                  </h2>
                  {job.hasApplied && (
                    <button title="Already Applied">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <span>{job.location}</span>
                  </div>
                  {job.jobType?.name && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                      <span>{job.jobType.name}</span>
                    </div>
                  )}
                  {job.experienceLevel?.name && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-purple-600" />
                      <span>{job.experienceLevel.name}</span>
                    </div>
                  )}
                  {(job.salaryMin || job.salaryMax) && (
                    <div className="flex items-center gap-1">
                      <Banknote className="h-4 w-4 text-purple-600" />
                      <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleSaveJob(job._id)}
                  className="cursor-pointer p-2 rounded-full hover:bg-purple-50 border border-gray-200 transition"
                  title={savedJobs.includes(job._id) ? "Unsave Job" : "Save Job"}
                >
                  {savedJobs.includes(job._id) ? (
                    <BookmarkMinus className="h-5 w-5 text-purple-600" />
                  ) : (
                    <Bookmark className="h-5 w-5 text-purple-600" />
                  )}
                </button>

                <button
                  onClick={() => handleNavigation(job._id)}
                  className="cursor-pointer p-2 rounded-full hover:bg-purple-50 border border-gray-200 transition"
                  title="View Details"
                >
                  <Eye className="h-5 w-5 text-purple-600" />
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm mt-4 leading-relaxed">
              {job.description.length > 200
                ? `${job.description.slice(0, 200)}...`
                : job.description}
            </p>

            {/* Footer */}
            <div className="flex justify-between items-center mt-5 text-xs text-gray-500">
              <span>
                Posted{" "}
                {new Date(job.createdAt || "").toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-purple-600 font-medium">
                <span className="text-gray-600">Job Mode:</span> {job.workMode?.name || "—"}
              </span>
            </div>
          </div>
        ))}
      </main>

      {hasMore && (
        <div className="text-center p-6">
          <button
            onClick={loadMore}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
          >
            Load More
          </button>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="p-10 text-center text-gray-500 text-lg">No jobs found.</div>
      )}
    </div>
  );
};

export default CandidateJobsPage;

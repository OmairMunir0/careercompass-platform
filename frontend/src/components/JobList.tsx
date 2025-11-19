// src/components/jobs/JobList.tsx
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/date";
import axiosInstance from "@/lib/axiosInstance";

// match API payload from listJobPostings
interface JobListItem {
  id: string;
  title: string;
  description: string;
  location: string | null;
  salaryMin: number;
  salaryMax: number;
  isActive: boolean;
  createdAt: string;
  recruiterProfileId: string;
  jobType: string | null;
  workMode: string | null;
  experienceLevel: string | null;
}

interface JobResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: JobListItem[];
}

export default function JobList() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axiosInstance.get<JobResponse>("/api/jobs");
        if (res.data.success && res.data.data) {
          setJobs(res.data.data);
        } else {
          setError(res.data.error || "Failed to load jobs");
        }
      } catch {
        setError("Server error while fetching jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <p className="text-gray-500 text-sm">Loading jobs...</p>;
  if (error) return <p className="text-red-600 text-sm">{error}</p>;
  if (!jobs.length) return <p className="text-gray-500 text-sm">No active job postings.</p>;

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition"
        >
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-3">{job.description}</p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
            {job.location && <span>📍 {job.location}</span>}
            {job.workMode && <span>🏠 {job.workMode}</span>}
            {job.experienceLevel && <span>🎯 {job.experienceLevel}</span>}
            <span>
              💰 ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
            </span>
          </div>

          <div className="mt-2 text-xs text-gray-400">Posted {formatDate(job.createdAt)}</div>
        </div>
      ))}
    </div>
  );
}

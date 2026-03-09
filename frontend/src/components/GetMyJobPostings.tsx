"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Clock, XCircle, CheckCircle, Briefcase } from "lucide-react";
import { Job, jobsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import JobPostingsStats from "@/components/JobPostingsStats";
import JobFilters from "@/components/JobFilters";
import JobCard from "@/components/JobCard";
import { formatDate } from "@/lib/date";

type JobStatus = "ALL" | "ACTIVE" | "PAUSED" | "CLOSED" | "DRAFT";

const ManageJobsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus>("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await jobsAPI.getMyJobs();
        setJobs(response.data || []);
      } catch (error) {
        console.error("Failed to load jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [user]);

  useEffect(() => {
    const filtered = jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "ALL" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, statusFilter]);

  const handleDeleteJob = async (jobId: string) => {
    try {
      await jobsAPI.deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      setShowDeleteModal(null);
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: Job["status"]) => {
    try {
      await jobsAPI.updateJobStatus(jobId, newStatus);
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job))
      );
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  const handleDuplicateJob = async (job: Job) => {
    try {
      const duplicatedJob = await jobsAPI.duplicateJob(job.id);
      setJobs((prev) => [duplicatedJob, ...prev]);
    } catch (error) {
      console.error("Failed to duplicate job:", error);
    }
  };

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      case "CLOSED":
        return "bg-red-100 text-red-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Job["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4" />;
      case "PAUSED":
        return <Clock className="w-4 h-4" />;
      case "CLOSED":
        return <XCircle className="w-4 h-4" />;
      case "DRAFT":
        return <Edit className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${(max! / 1000).toFixed(0)}k`;
  };

  const getJobTypeLabel = (type: string) => {
    const labels = {
      FULL_TIME: "Full Time",
      PART_TIME: "Part Time",
      CONTRACT: "Contract",
      INTERNSHIP: "Internship",
      FREELANCE: "Freelance",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatPostedDate = (dateString: string) => formatDate(dateString);

  const stats = {
    active: jobs.filter((job) => job.status === "ACTIVE").length,
    totalApplications: jobs.reduce((sum, job) => sum + job.applicationsCount, 0),
    totalViews: jobs.reduce((sum, job) => sum + job.viewsCount, 0),
    drafts: jobs.filter((job) => job.status === "DRAFT").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Jobs</h1>
              <p className="text-gray-600">Create and manage your job postings</p>
            </div>
            <Link
              href="/job-postings/create"
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              <span>Post New Job</span>
            </Link>
          </div>

          <JobPostingsStats {...stats} />
        </div>

        <JobFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== "ALL"
                ? "No jobs match your filters"
                : "No jobs posted yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your search criteria or filters."
                : "Create your first job posting to start attracting candidates."}
            </p>
            <Link
              href="/job-postings/create"
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                formatDate={formatPostedDate}
                formatSalary={formatSalary}
                getJobTypeLabel={getJobTypeLabel}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                handleDuplicateJob={handleDuplicateJob}
                handleStatusChange={handleStatusChange}
                setEditingJob={setEditingJob}
                setShowDeleteModal={setShowDeleteModal}
              />
            ))}
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Job</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this job? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteJob(showDeleteModal)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobsPage;

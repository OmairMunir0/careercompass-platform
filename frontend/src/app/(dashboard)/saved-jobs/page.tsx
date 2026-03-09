"use client";

import axiosInstance from "@/lib/axiosInstance";
import {
  BookmarkX,
  Building,
  Calendar,
  DollarSign,
  Eye,
  Heart,
  MapPin,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { formatDate } from "@/lib/date";

interface SavedJob {
  _id: string;
  job: {
    _id: string;
    title: string;
    description: string;
    location: string;
    salaryMin?: number;
    salaryMax?: number;
    isActive?: boolean;
    createdAt: string;
    recruiter?: {
      companyName?: string | null;
    } | null;
  };
  createdAt: string;
}

type SortOption = "savedAt" | "createdAt" | "title";
type SortOrder = "asc" | "desc";

const SavedJobsPage: React.FC = () => {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("savedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/saved-jobs");
      setSavedJobs(res.data);
      setFilteredJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch saved jobs:", err);
      setSavedJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = savedJobs.filter((sj) =>
      sj.job.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal =
        sortBy === "savedAt"
          ? new Date(a.createdAt).getTime()
          : sortBy === "createdAt"
          ? new Date(a.job.createdAt).getTime()
          : a.job.title.toLowerCase();
      const bVal =
        sortBy === "savedAt"
          ? new Date(b.createdAt).getTime()
          : sortBy === "createdAt"
          ? new Date(b.job.createdAt).getTime()
          : b.job.title.toLowerCase();

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" ? +aVal - +bVal : +bVal - +aVal;
    });

    setFilteredJobs(filtered);
  }, [savedJobs, searchQuery, sortBy, sortOrder]);

  const handleUnsave = async (savedId: string) => {
    try {
      await axiosInstance.delete(`/saved-jobs/${savedId}`);
      setSavedJobs((prev) => prev.filter((s) => s._id !== savedId));
    } catch (err) {
      console.error("Failed to unsave job:", err);
    }
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs((prev) => {
      const next = new Set(prev);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(filteredJobs.map((s) => s.job._id)));
    }
  };

  const handleBulkUnsave = async () => {
    if (selectedJobs.size === 0) return;
    try {
      const toDelete = savedJobs.filter((s) => selectedJobs.has(s.job._id)).map((s) => s._id);

      await Promise.all(toDelete.map((id) => axiosInstance.delete(`/saved-jobs/${id}`)));

      setSavedJobs((prev) => prev.filter((s) => !selectedJobs.has(s.job._id)));
      setSelectedJobs(new Set());
    } catch (err) {
      console.error("Bulk unsave failed:", err);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${(max! / 1000).toFixed(0)}k`;
  };

  const formatSavedDate = (date: string) => formatDate(date);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-16 w-16 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
          <p className="text-gray-600">
            You have {savedJobs.length} saved job{savedJobs.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search saved jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="savedAt">Saved Date</option>
                <option value="createdAt">Posted Date</option>
                <option value="title">Title</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="w-5 h-5" />
                ) : (
                  <SortDesc className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {selectedJobs.size > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex justify-between items-center">
            <span className="text-purple-800">
              {selectedJobs.size} job{selectedJobs.size > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={handleBulkUnsave}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Remove Selected
            </button>
          </div>
        )}

        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? "No jobs match your search" : "No saved jobs yet"}
            </h3>
            <button
              onClick={() => router.push("/find-jobs")}
              className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select all ({filteredJobs.length})
                </span>
              </label>
            </div>

            {filteredJobs.map((sj) => (
              <div
                key={sj._id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedJobs.has(sj.job._id)}
                    onChange={() => handleSelectJob(sj.job._id)}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{sj.job.title}</h3>
                        <div className="flex items-center gap-4 text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            <span>{sj.job.recruiter?.companyName || "Unknown Company"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{sj.job.location}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnsave(sj._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Remove from saved jobs"
                      >
                        <BookmarkX className="w-5 h-5" />
                      </button>
                    </div>

                    {(sj.job.salaryMin || sj.job.salaryMax) && (
                      <div className="flex items-center gap-1 text-green-600 font-medium mb-3">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatSalary(sj.job.salaryMin, sj.job.salaryMax)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <div className="flex gap-6">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Posted {formatDate(sj.job.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          <span>Saved {formatSavedDate(sj.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/find-jobs/${sj.job._id}`)}
                          className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobsPage;

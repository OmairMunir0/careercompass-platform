"use client";

import React from "react";
import {
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Users,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  RefreshCw,
  MoreVertical,
} from "lucide-react";

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  status: "ACTIVE" | "PAUSED" | "CLOSED" | "DRAFT";
  jobType: string;
  skills: string[];
  applicationsCount: number;
  viewsCount: number;
  isUrgent?: boolean;
  isRemote?: boolean;
  postedAt: string;
  applicationDeadline?: string;
}

interface JobCardProps {
  job: Job;
  formatDate: (dateString: string) => string;
  formatSalary: (min?: number, max?: number) => string;
  getJobTypeLabel: (type: string) => string;
  getStatusColor: (status: Job["status"]) => string;
  getStatusIcon: (status: Job["status"]) => React.ReactNode;
  handleDuplicateJob: (job: Job) => void;
  handleStatusChange: (jobId: string, newStatus: Job["status"]) => void;
  setEditingJob: (job: Job) => void;
  setShowDeleteModal: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  formatDate,
  formatSalary,
  getJobTypeLabel,
  getStatusColor,
  getStatusIcon,
  handleDuplicateJob,
  handleStatusChange,
  setEditingJob,
  setShowDeleteModal,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                {job.isUrgent && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Urgent
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-gray-600 mb-2">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                  {job.isRemote && <span className="text-green-600">(Remote)</span>}
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Posted {formatDate(job.postedAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  job.status
                )}`}
              >
                {getStatusIcon(job.status)}
                <span>{job.status}</span>
              </span>

              <button className="p-2 hover:bg-gray-100 rounded">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              {getJobTypeLabel(job.jobType)}
            </span>
            {(job.salaryMin || job.salaryMax) && (
              <div className="flex items-center space-x-1 text-green-600 font-medium">
                <DollarSign className="w-4 h-4" />
                <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
              </div>
            )}
            {job.applicationDeadline && (
              <div className="flex items-center space-x-1 text-orange-600">
                <Clock className="w-4 h-4" />
                <span>Deadline {formatDate(job.applicationDeadline)}</span>
              </div>
            )}
          </div>

          <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                +{job.skills.length - 5} more
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{job.applicationsCount} applications</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                <span>{job.viewsCount} views</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => window.open(`/jobs/${job.id}`, "_blank")}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>

              <button
                onClick={() => handleDuplicateJob(job)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Copy className="w-4 h-4" />
                <span>Duplicate</span>
              </button>

              <button
                onClick={() => setEditingJob(job)}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>

              {job.status === "ACTIVE" && (
                <button
                  onClick={() => handleStatusChange(job.id, "PAUSED")}
                  className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  <Clock className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              )}
              {job.status === "PAUSED" && (
                <button
                  onClick={() => handleStatusChange(job.id, "ACTIVE")}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Activate</span>
                </button>
              )}
              {job.status === "DRAFT" && (
                <button
                  onClick={() => handleStatusChange(job.id, "ACTIVE")}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Publish</span>
                </button>
              )}

              <button
                onClick={() => setShowDeleteModal(job.id)}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;

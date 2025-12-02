"use client";

import React from "react";
import { CheckCircle, Users, TrendingUp, Edit } from "lucide-react";

interface JobStatsProps {
  active: number;
  totalApplications: number;
  totalViews: number;
  drafts: number;
}

const JobPostingsStats: React.FC<JobStatsProps> = ({
  active,
  totalApplications,
  totalViews,
  drafts,
}) => {
  const statsData = [
    {
      label: "Active Jobs",
      value: active,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      bg: "bg-green-100",
    },
    {
      label: "Total Applications",
      value: totalApplications,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      label: "Total Views",
      value: totalViews,
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-100",
    },
    {
      label: "Draft Jobs",
      value: drafts,
      icon: <Edit className="w-6 h-6 text-gray-600" />,
      bg: "bg-gray-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {statsData.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.bg}`}>{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobPostingsStats;

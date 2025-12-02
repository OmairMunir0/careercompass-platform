"use client";

import CandidateDashboard from "@/components/CandidateDashboard";
import RecruiterDashboard from "@/components/RecruiterDashboard";
import { useAuthStore } from "@/store/authStore";
import React from "react";

const Dashboard: React.FC = () => {
  const { role } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {role === "candidate" ? <CandidateDashboard /> : <RecruiterDashboard />}
    </div>
  );
};

export default Dashboard;

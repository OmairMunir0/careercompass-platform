"use client";

import CertificationManager from "@/components/CertificationManager";
import EducationManager from "@/components/EducationManager";
import ExperienceManager from "@/components/ExperienceManager";
import Loader from "@/components/Loader";
import ProfileForm from "@/components/ProfileForm";
import SkillManager from "@/components/SkillManager";
import { useAuthStore } from "@/store/authStore";
import { Award, Briefcase, FileText, GraduationCap, User } from "lucide-react";
import React, { useEffect, useState } from "react";

const Profile: React.FC = () => {
  const { user, fetchCurrentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "personal" | "experience" | "education" | "certifications" | "skills"
  >("personal");

  useEffect(() => {
    if (!user) fetchCurrentUser();
  }, [user, fetchCurrentUser]);

  if (!user) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">Role: {user.role || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Content */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-auto text-nowrap">
              {[
                { id: "personal", name: "Personal Info", icon: User },
                { id: "experience", name: "Experience", icon: Briefcase },
                { id: "education", name: "Education", icon: GraduationCap },
                { id: "certifications", name: "Certifications", icon: Award },
                { id: "skills", name: "Skills", icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "personal" && <ProfileForm />}
            {activeTab === "experience" && <ExperienceManager />}
            {activeTab === "education" && <EducationManager />}
            {activeTab === "certifications" && <CertificationManager />}
            {activeTab === "skills" && <SkillManager />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

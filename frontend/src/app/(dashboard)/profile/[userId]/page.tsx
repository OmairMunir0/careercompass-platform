"use client";

import CertificationManager from "@/components/CertificationManager";
import EducationManager from "@/components/EducationManager";
import ExperienceManager from "@/components/ExperienceManager";
import Loader from "@/components/Loader";
import ProfileForm from "@/components/ProfileForm";
import SkillManager from "@/components/SkillManager";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";
import { Award, Briefcase, FileText, GraduationCap, User, FileCheck, Download } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axiosInstance from "@/lib/axiosInstance";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";


interface ProfileUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  imageUrl?: string;
  bio?: string;
  location?: string;
  phone?: string;
  publicEmail?: string;
  companyName?: string;
  companyWebsite?: string;
  position?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
}

const UserProfilePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "personal" | "experience" | "education" | "certifications" | "skills" | "resume"
  >("personal");
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});


  const userId = params.userId as string;
  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      // If viewing own profile, redirect to /profile
      if (isOwnProfile) {
        router.replace("/profile");
        return;
      }

      setLoading(true);
      try {
        const response = await userService.getUser(userId);
        setProfileUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, isOwnProfile, router]);


  useEffect(() => {
    const loadFollowStatus = async () => {
      if (!currentUser?._id || !profileUser?._id || isOwnProfile) return;

      try {
        const { data } = await axiosInstance.get(`/follows/status/${profileUser._id}`);
        setFollowStatus({ [profileUser._id]: data.isFollowing || false });
      } catch (err) {
        console.error("Failed to load follow status:", err);
      }
    };

    loadFollowStatus();
  }, [profileUser?._id, currentUser?._id, isOwnProfile]);

  const handleFollowToggle = async (targetUserId: string) => {
    if (!currentUser?._id) return;

    try {
      const isCurrentlyFollowing = followStatus[targetUserId];

      if (isCurrentlyFollowing) {
        await axiosInstance.delete(`/follows/${targetUserId}`);
        setFollowStatus((prev) => ({ ...prev, [targetUserId]: false }));
        toast.success("Unfollowed successfully");
      } else {
        await axiosInstance.post(`/follows/${targetUserId}`);
        setFollowStatus((prev) => ({ ...prev, [targetUserId]: true }));
        toast.success("Following successfully");
      }
    } catch (err: any) {
      console.error("Failed to toggle follow:", err);
      toast.error(err?.response?.data?.message || "Failed to update follow status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
            <button
              onClick={() => router.push("/profile")}
              className="text-purple-600 hover:underline"
            >
              Back to your profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 ring-4 ring-purple-100">
                {profileUser.imageUrl ? (
                  <Image
                    src={profileUser.imageUrl.startsWith('http') ? profileUser.imageUrl : `http://localhost:3001${profileUser.imageUrl}`}
                    alt={`${profileUser.firstName} ${profileUser.lastName}`}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xl sm:text-2xl font-semibold">
                    {profileUser.firstName?.[0] || ""}{profileUser.lastName?.[0] || ""}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {profileUser.firstName} {profileUser.lastName}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 truncate">{profileUser.email}</p>
                <p className="text-xs sm:text-sm text-gray-500">Role: {profileUser.role || "—"}</p>
                {profileUser.bio && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{profileUser.bio}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleFollowToggle(profileUser._id)}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto sm:min-w-[140px] ${followStatus[profileUser._id]
                ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800"
                }`}
            >
              {followStatus[profileUser._id] ? "Unfollow" : "Follow"}
            </button>
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
                { id: "resume", name: "Resume", icon: FileCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
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
            {/* Read-only view for other users' profiles */}
            {activeTab === "personal" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <p className="text-gray-900">{profileUser.firstName || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <p className="text-gray-900">{profileUser.lastName || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{profileUser.publicEmail || profileUser.email || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{profileUser.phone || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <p className="text-gray-900">{profileUser.location || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <p className="text-gray-900">{profileUser.position || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <p className="text-gray-900">{profileUser.companyName || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Website
                    </label>
                    {profileUser.companyWebsite ? (
                      <a
                        href={profileUser.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        {profileUser.companyWebsite}
                      </a>
                    ) : (
                      <p className="text-gray-900">—</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    {profileUser.linkedinUrl ? (
                      <a
                        href={profileUser.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        {profileUser.linkedinUrl}
                      </a>
                    ) : (
                      <p className="text-gray-900">—</p>
                    )}
                  </div>
                </div>
                {profileUser.bio && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{profileUser.bio}</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === "experience" && (
              <div className="text-center text-gray-500 py-8">
                Experience information is only visible to the profile owner.
              </div>
            )}
            {activeTab === "education" && (
              <div className="text-center text-gray-500 py-8">
                Education information is only visible to the profile owner.
              </div>
            )}
            {activeTab === "certifications" && (
              <div className="text-center text-gray-500 py-8">
                Certifications are only visible to the profile owner.
              </div>
            )}
            {activeTab === "skills" && (
              <div className="text-center text-gray-500 py-8">
                Skills are only visible to the profile owner.
              </div>
            )}
            {activeTab === "resume" && (
              <div className="space-y-4">
                {profileUser.resumeUrl ? (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileText size={24} className="text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Resume.pdf</h3>
                          <p className="text-sm text-gray-500">Available for download</p>
                        </div>
                      </div>
                      <a
                        href={`http://localhost:3001/api/users/${profileUser._id}/resume`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        <Download size={18} />
                        Download Resume
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    This user has not uploaded a resume yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;


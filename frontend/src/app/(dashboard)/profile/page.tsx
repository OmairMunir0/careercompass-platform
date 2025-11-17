"use client";

import CertificationManager from "@/components/CertificationManager";
import EducationManager from "@/components/EducationManager";
import ExperienceManager from "@/components/ExperienceManager";
import Loader from "@/components/Loader";
import ProfileForm from "@/components/ProfileForm";
import SkillManager from "@/components/SkillManager";
import ResumeManager from "@/components/ResumeManager";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";
import { Award, Briefcase, FileText, GraduationCap, User, Camera, X, FileCheck } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

const Profile: React.FC = () => {
  const { user, fetchCurrentUser, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "personal" | "experience" | "education" | "certifications" | "skills" | "resume"
  >("personal");
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) fetchCurrentUser();
  }, [user, fetchCurrentUser]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const response = await userService.addProfileImage(file);
      const imageUrl = response.data.imageUrl;
      
      // Update user in store
      if (user) {
        setUser({ ...user, imageUrl: imageUrl || (user as any).imageUrl });
      }
      
      // Refresh user data
      await fetchCurrentUser();
      toast.success("Profile picture updated successfully!");
    } catch (error: any) {
      console.error("Failed to upload profile image:", error);
      toast.error(error.response?.data?.message || "Failed to upload profile picture");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) return;

    try {
      await userService.removeProfileImage();
      
      // Update user in store
      if (user) {
        setUser({ ...user, imageUrl: null });
      }
      
      // Refresh user data
      await fetchCurrentUser();
      toast.success("Profile picture removed successfully!");
    } catch (error: any) {
      console.error("Failed to remove profile image:", error);
      toast.error(error.response?.data?.message || "Failed to remove profile picture");
    }
  };

  if (!user) return <Loader />;

  const userImageUrl = (user as any).imageUrl;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-purple-100 cursor-pointer group"
                onMouseEnter={() => setIsHoveringProfile(true)}
                onMouseLeave={() => setIsHoveringProfile(false)}
                onClick={handleImageClick}
              >
                {userImageUrl ? (
                  <Image
                    src={userImageUrl.startsWith("http") ? userImageUrl : `http://localhost:3001${userImageUrl}`}
                    alt={`${user.firstName} ${user.lastName}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                
                {/* Hover Overlay */}
                {isHoveringProfile && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center flex-col gap-1 transition-opacity">
                    {isUploading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-white" />
                        <span className="text-xs text-white font-medium">Change</span>
                      </>
                    )}
                  </div>
                )}

                {/* Remove button (only show if image exists) */}
                {userImageUrl && isHoveringProfile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                    title="Remove profile picture"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

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
                { id: "resume", name: "Resume", icon: FileCheck },
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
            {activeTab === "resume" && <ResumeManager />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

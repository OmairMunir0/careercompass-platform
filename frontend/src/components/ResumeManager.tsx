"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { Download, FileText, Upload, X, ArrowUp10 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ResumeManager() {
  const { user, fetchCurrentUser } = useAuthStore();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setResumeUrl((user as any).resumeUrl || null);
    }
  }, [user]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Resume size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profileResume", file);

      const response = await axiosInstance.post("/users/me/resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResumeUrl(response.data.data.resumeUrl);
      await fetchCurrentUser();
      toast.success("Resume uploaded successfully!");
    } catch (error: any) {
      console.error("Failed to upload resume:", error);
      toast.error(error.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove your resume?")) return;

    setLoading(true);
    try {
      await axiosInstance.delete("/users/me/resume");
      setResumeUrl(null);
      await fetchCurrentUser();
      toast.success("Resume removed successfully!");
    } catch (error: any) {
      console.error("Failed to remove resume:", error);
      toast.error(error.response?.data?.message || "Failed to remove resume");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!user?._id) return;

    // Use the download endpoint which serves the file with proper headers
    const downloadUrl = `http://localhost:3001/api/users/${user._id}/resume`;
    window.open(downloadUrl, "_blank");
  };

  const handleATSSelect = () => {
    router.push('/resume-ats');
  };

  console.log(user);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Resume</h2>
        <p className="text-sm text-gray-600">
          Upload your resume in PDF format. It will be visible to other users and can be downloaded.
          You can find your ATS Scores and find recommendations based on your resume.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {resumeUrl ? (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Resume.pdf</h3>
                <p className="text-sm text-gray-500">Your resume is uploaded and visible to others</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={handleRemove}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove resume"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No resume uploaded</h3>
          <p className="text-sm text-gray-600 mb-6">
            Upload your resume in PDF format to make it available for download
          </p>
          <button
            onClick={handleFileSelect}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={20} />
                <span>Upload Resume</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Upload new resume button (if resume exists) */}
      {resumeUrl && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleATSSelect}
            className="inline-flex items-center gap-2 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {
              <>
                <ArrowUp10 size={18} />
                <span>Calculate ATS</span>
              </>
            }
          </button>

          <button
            onClick={handleFileSelect}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Replace Resume</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}


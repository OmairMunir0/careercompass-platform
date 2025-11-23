"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { UserMinus, Users, MapPin, Briefcase, MessageSquare } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FollowerData {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  position?: string;
  location?: string;
  imageUrl?: string;
  followedAt: string;
}

const FollowersPage: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [followers, setFollowers] = useState<FollowerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadFollowers = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/follows/followers/${user._id}`, {
          params: { page, limit: 20 },
        });

        setFollowers(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        console.error("Failed to load followers:", err);
        toast.error("Failed to load followers");
      } finally {
        setLoading(false);
      }
    };

    loadFollowers();
  }, [user?._id, page]);

  const handleRemoveFollower = async (followerId: string) => {
    // Note: This would require a backend endpoint to remove a follower
    // For now, we'll just show a message
    toast.error("Remove follower feature not yet implemented");
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Followers</h1>
          <span className="text-gray-600">{followers.length} followers</span>
        </div>

        {followers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No followers yet</h3>
            <p className="text-gray-600">When people follow you, they'll appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {followers.map((follower) => (
              <div
                key={follower._id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={
                        follower.imageUrl ||
                        `https://ui-avatars.com/api/?name=${follower.firstName}+${follower.lastName}&background=7c3aed&color=fff`
                      }
                      alt={`${follower.firstName} ${follower.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <Link
                        href={`/profile/${follower._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-purple-600"
                      >
                        {follower.firstName} {follower.lastName}
                      </Link>
                      {follower.position && (
                        <p className="text-purple-600">{follower.position}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        {follower.location && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{follower.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/chats?userId=${follower._id}`)}
                      className="flex items-center space-x-2 px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat</span>
                    </button>
                    <button
                      onClick={() => handleRemoveFollower(follower._id)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowersPage;

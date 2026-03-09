"use client";

import { analyticsService, AnalyticsData } from "@/services/analyticsService";
import { useAuthStore } from "@/store/authStore";
import { BarChart3, Users, FileText, Heart, MessageSquare, TrendingUp, UserPlus, BookOpen, Briefcase, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

export default function AnalyticsDashboard() {
  const { role, token } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    // Redirect if not admin
    if (role !== "admin") {
      router.push("/dashboard");
      return;
    }

    fetchAnalytics();
  }, [role, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardAnalytics();
      setAnalytics(data);
    } catch (error: any) {
      console.error("Failed to fetch analytics:", error);
      toast.error(error.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-gray-600">No analytics data available</p>
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, trend, color = "purple" }: {
    title: string;
    value: number | string;
    icon: any;
    trend?: string;
    color?: "purple" | "blue" | "green" | "red" | "yellow";
  }) => {
    const colorClasses = {
      purple: "bg-purple-100 text-purple-600",
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      red: "bg-red-100 text-red-600",
      yellow: "bg-yellow-100 text-yellow-600",
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
            {trend && (
              <p className="text-sm text-gray-500 mt-1">{trend}</p>
            )}
          </div>
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon size={24} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="text-purple-600" size={32} />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Comprehensive metrics on user behavior and site performance</p>
            </div>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* User Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} />
            User Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={analytics.users.total}
              icon={Users}
              color="purple"
            />
            <StatCard
              title="Candidates"
              value={analytics.users.candidates}
              icon={UserPlus}
              color="blue"
            />
            <StatCard
              title="Recruiters"
              value={analytics.users.recruiters}
              icon={Briefcase}
              color="green"
            />
            <StatCard
              title="Admins"
              value={analytics.users.admins}
              icon={Users}
              color="yellow"
            />
            <StatCard
              title="New Users (7 days)"
              value={analytics.users.newLast7Days}
              icon={TrendingUp}
              color="green"
              trend={`${analytics.users.newLast30Days} in last 30 days`}
            />
            <StatCard
              title="Active Users"
              value={analytics.users.active}
              icon={Activity}
              color="purple"
            />
          </div>
        </div>

        {/* Content Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} />
            Content Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Posts"
              value={analytics.content.posts.total}
              icon={FileText}
              color="blue"
              trend={`${analytics.content.posts.last7Days} in last 7 days`}
            />
            <StatCard
              title="Total Blogs"
              value={analytics.content.blogs.total}
              icon={BookOpen}
              color="purple"
              trend={`${analytics.content.blogs.last7Days} in last 7 days`}
            />
            <StatCard
              title="Job Posts"
              value={analytics.content.jobPosts}
              icon={Briefcase}
              color="green"
            />
            <StatCard
              title="Job Applications"
              value={analytics.content.jobApplications}
              icon={FileText}
              color="yellow"
            />
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart size={20} />
            Engagement Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Likes"
              value={analytics.engagement.totalLikes}
              icon={Heart}
              color="red"
            />
            <StatCard
              title="Post Likes"
              value={analytics.engagement.postLikes}
              icon={Heart}
              color="red"
            />
            <StatCard
              title="Blog Likes"
              value={analytics.engagement.blogLikes}
              icon={Heart}
              color="red"
            />
            <StatCard
              title="Total Comments"
              value={analytics.engagement.totalComments}
              icon={MessageSquare}
              color="blue"
            />
            <StatCard
              title="Post Comments"
              value={analytics.engagement.postComments}
              icon={MessageSquare}
              color="blue"
            />
            <StatCard
              title="Blog Comments"
              value={analytics.engagement.blogComments}
              icon={MessageSquare}
              color="blue"
            />
          </div>
        </div>

        {/* Top Users */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Active Users</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blogs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Activity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.postCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.blogCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">{user.totalActivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Posts */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Most Liked Posts</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                {analytics.topPosts.map((post) => (
                  <div key={post._id} className="border-b border-gray-200 pb-4 last:border-0">
                    <p className="text-sm text-gray-900 mb-2 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart size={14} />
                        {post.likesCount} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        {post.commentsCount} comments
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Blogs */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Most Liked Blogs</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                {analytics.topBlogs.map((blog) => (
                  <div key={blog._id} className="border-b border-gray-200 pb-4 last:border-0">
                    <p className="text-sm font-medium text-gray-900 mb-2">{blog.title}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart size={14} />
                        {blog.likesCount} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        {blog.commentsCount} comments
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import axiosInstance from "@/lib/axiosInstance";

export interface AnalyticsData {
  users: {
    total: number;
    candidates: number;
    recruiters: number;
    admins: number;
    newLast7Days: number;
    newLast30Days: number;
    active: number;
  };
  content: {
    posts: {
      total: number;
      last7Days: number;
      last30Days: number;
    };
    blogs: {
      total: number;
      last7Days: number;
      last30Days: number;
    };
    jobPosts: number;
    jobApplications: number;
  };
  engagement: {
    totalLikes: number;
    postLikes: number;
    blogLikes: number;
    totalComments: number;
    postComments: number;
    blogComments: number;
  };
  growth: {
    userGrowth: Array<{
      month: string;
      count: number;
    }>;
  };
  topUsers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    postCount: number;
    blogCount: number;
    totalActivity: number;
  }>;
  topPosts: Array<{
    _id: string;
    content: string;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
  }>;
  topBlogs: Array<{
    _id: string;
    title: string;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
  }>;
}

export const analyticsService = {
  getDashboardAnalytics: async (): Promise<AnalyticsData> => {
    const response = await axiosInstance.get("/analytics/dashboard");
    return response.data.data;
  },
};


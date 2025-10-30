// src/constants/api-routes.ts

// axiosInstance already handle "/api"
// const axiosInstance = axios.create({ baseURL: API_URL + "/api" });

export const API_ROUTES = {
  // ===== AUTH =====
  AUTH_REGISTER: "/auth/register",
  AUTH_LOGIN: "/auth/login",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_ME: "/auth/me",
  AUTH_CHANGE_EMAIL: "/auth/change-email",
  AUTH_CHANGE_PASSWORD: "/auth/change-password",

  // ===== USERS =====
  USER_BY_ID: (userId: string) => `/users/${userId}`,

  // ===== JOBS =====
  JOBS: "/jobs",
  JOB_BY_ID: (jobId: string) => `/jobs/${jobId}`,

  // ===== POSTS =====
  POSTS: "/posts",
  POST_BY_ID: (postId: string) => `/posts/${postId}`,
  POST_MY: "/posts/me",
  POST_LIKE: (postId: string) => `/posts/${postId}/like`,

  // ===== COMMENTS =====
  COMMENTS: "/comments",
  COMMENTS_BY_POST: (postId: string) => `/comments/${postId}`,

  // ===== PROFILES =====
  PROFILES: "/profiles",
  PROFILE_BY_ID: (profileId: string) => `/profiles/${profileId}`,

  // ===== SAVED JOBS =====
  SAVED_JOBS: "/saved-jobs",
  SAVED_JOB_BY_ID: (jobId: string) => `/saved-jobs/${jobId}`,

  // ===== SHORTLISTS =====
  SHORTLISTS: "/shortlists",
  SHORTLIST_BY_ID: (shortlistId: string) => `/shortlists/${shortlistId}`,

  // ===== CHAT / MESSAGES =====
  CONVERSATIONS: "/conversations",
  MY_CONVERSATIONS: "/conversations/me",
  CONVERSATION_BY_ID: (conversationId: string) => `/conversations/${conversationId}`,
  CONVERSATION_MARK_READ: (conversationId: string) => `/conversations/${conversationId}/read`,
  MESSAGES: "/messages",
  MESSAGES_BY_CONVERSATION: (conversationId: string) => `/messages/${conversationId}`,
};

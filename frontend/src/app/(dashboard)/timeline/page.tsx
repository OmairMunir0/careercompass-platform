"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import TimelinePost from "@/components/TimelinePost";
import PostComposer from "@/components/PostComposer";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserProfileCard from "@/components/UserProfileCard";
import RightSidebar from "@/components/RightSidebar";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

interface Reply {
  _id?: string;
  user: User;
  content: string;
  createdAt?: string;
}

interface Comment {
  _id?: string;
  user: User;
  content: string;
  replies?: Reply[];
  createdAt?: string;
}

interface Post {
  _id: string;
  user: User;
  content: string;
  imageUrl?: string | null;
  likes: number;
  comments: Comment[];
  createdAt: string;
}

const Timeline: React.FC = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const token = useAuthStore.getState().token;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/posts");
      setPosts(res.data);
    } catch {
      toast.error("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (content: string, imageFile: File | null) => {
    if (!content.trim() && !imageFile) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      if (imageFile) formData.append("postImage", imageFile);

      const res = await axiosInstance.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      setPosts((prev) => [res.data, ...prev]);
      toast.success("Post created!");
    } catch {
      toast.error("Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await axiosInstance.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success("Post deleted!");
    } catch {
      toast.error("Failed to delete post.");
    }
  };

  const toggleLike = async (postId: string) => {
    const isLiked = likedPosts[postId];

    try {
      const res = await axiosInstance.put(`/posts/${postId}/${isLiked ? "unlike" : "like"}`);
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likes: res.data.likes } : p)));
      setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
    } catch {
      toast.error("Failed to update like.");
    }
  };

  const handleCommentSubmit = async (postId: string, content: string) => {
    if (!content.trim() || !user) return;

    // Optimistic update - add comment immediately
    const optimisticComment: Comment = {
      _id: `temp-${Date.now()}`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
      },
      content: content.trim(),
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setPosts((prev) =>
      prev.map((p) => 
        p._id === postId 
          ? { ...p, comments: [...p.comments, optimisticComment] }
          : p
      )
    );

    try {
      const res = await axiosInstance.post(`/posts/${postId}/comments`, { content });

      // Replace optimistic comment with real one from server
      const updatedPost = res.data.post;
      const normalizedPost = {
        ...updatedPost,
        comments: updatedPost.comments.map((comment: Comment) => ({
          ...comment,
          user: {
            ...comment.user,
            firstName: comment.user?.firstName || "",
            lastName: comment.user?.lastName || "",
            email: comment.user?.email || "",
          },
          replies: (comment.replies || []).map((reply: Reply) => ({
            ...reply,
            user: {
              ...reply.user,
              firstName: reply.user?.firstName || "",
              lastName: reply.user?.lastName || "",
              email: reply.user?.email || "",
            },
          })),
        })),
      };

      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? normalizedPost : p))
      );

      toast.success("Comment added!");
    } catch {
      // Remove optimistic comment on error
      setPosts((prev) =>
        prev.map((p) => 
          p._id === postId 
            ? { ...p, comments: p.comments.filter(c => c._id !== optimisticComment._id) }
            : p
        )
      );
      toast.error("Failed to add comment.");
    }
  };

  const handleReplySubmit = async (postId: string, commentId: string, content: string) => {
    if (!content.trim() || !user) return;

    // Optimistic update - add reply immediately
    const optimisticReply: Reply = {
      _id: `temp-reply-${Date.now()}`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
      },
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) => 
        p._id === postId 
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c._id === commentId
                  ? { ...c, replies: [...(c.replies || []), optimisticReply] }
                  : c
              ),
            }
          : p
      )
    );

    try {
      const res = await axiosInstance.post(`/posts/${postId}/comments/${commentId}/replies`, { content });

      // Replace optimistic reply with real one from server
      const updatedPost = res.data.post;
      const normalizedPost = {
        ...updatedPost,
        comments: updatedPost.comments.map((comment: Comment) => ({
          ...comment,
          user: {
            ...comment.user,
            firstName: comment.user?.firstName || "",
            lastName: comment.user?.lastName || "",
            email: comment.user?.email || "",
          },
          replies: (comment.replies || []).map((reply: Reply) => ({
            ...reply,
            user: {
              ...reply.user,
              firstName: reply.user?.firstName || "",
              lastName: reply.user?.lastName || "",
              email: reply.user?.email || "",
            },
          })),
        })),
      };

      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? normalizedPost : p))
      );

      toast.success("Reply added!");
    } catch {
      // Remove optimistic reply on error
      setPosts((prev) =>
        prev.map((p) => 
          p._id === postId 
            ? {
                ...p,
                comments: p.comments.map((c) =>
                  c._id === commentId
                    ? { ...c, replies: (c.replies || []).filter(r => r._id !== optimisticReply._id) }
                    : c
                ),
              }
            : p
        )
      );
      toast.error("Failed to add reply.");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Please log in to view the timeline.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 hidden lg:block">
          <UserProfileCard />
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Timeline</h1>
          
          {/* Post Composer */}
          <PostComposer 
            user={user} 
            onSubmit={handlePost} 
            isSubmitting={submitting} 
          />
          
          {/* Posts List */}
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <TimelinePost
                  key={post._id}
                  id={post._id}
                  user={post.user}
                  content={post.content}
                  imageUrl={post.imageUrl}
                  likes={post.likes}
                  comments={post.comments}
                  createdAt={post.createdAt}
                  isLiked={!!likedPosts[post._id]}
                  currentUser={user}
                  onLike={toggleLike}
                  onComment={handleCommentSubmit}
                  onReply={handleReplySubmit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="lg:col-span-3 hidden lg:block">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
};

export default Timeline;

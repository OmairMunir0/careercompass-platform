"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { Heart, Image, MessageSquare, Pencil, Trash } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

interface Post {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  content: string;
  imageUrl?: string | null;
  likes: number;
  comments: Array<{
    _id?: string;
    user: { _id: string; firstName?: string; lastName?: string; email: string };
    content: string;
  }>;
  createdAt: string;
}

const Timeline: React.FC = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handlePost = async () => {
    if (!newPost.trim() && !imageFile) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", newPost.trim());
      if (imageFile) formData.append("postImage", imageFile);

      const res = await axiosInstance.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      setPosts((prev) => [res.data, ...prev]);
      setNewPost("");
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      const res = await axiosInstance.post(`/posts/${postId}/comments`, { content });

      // Assuming the API returns the post object with updated comments
      const newComment = res.data.post.comments[res.data.post.comments.length - 1];

      // merge current user info if needed
      const mergedComment = {
        ...newComment,
        user: {
          ...newComment.user,
          firstName: user?.firstName ?? "",
          lastName: user?.lastName ?? "",
          email: user?.email ?? "",
        },
      };

      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments: [...p.comments, mergedComment] } : p))
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      toast.success("Comment added!");
    } catch {
      toast.error("Failed to add comment.");
    }
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );

  const getImageUrl = (url?: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const getDisplayName = (u?: any) =>
    u ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email.split("@")[0] : "U";

  const getInitial = (u?: any) => getDisplayName(u).charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Create Post */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
              {getInitial(user)}
            </div>
            <textarea
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
          </div>

          {imageFile && (
            <div className="mt-3">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="rounded-lg max-h-64 object-cover"
              />
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <button
              type="button"
              className="flex items-center text-gray-600 hover:text-purple-600"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="h-5 w-5 mr-1" /> Add Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileSelect}
            />
            <button
              disabled={submitting}
              onClick={handlePost}
              className={`bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition ${
                submitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="text-center text-gray-500">Loading posts...</div>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="relative bg-white rounded-lg shadow p-5 mb-6 hover:shadow-md transition"
            >
              {post.user._id === user._id && (
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Pencil className="h-4 w-4 text-gray-400 cursor-pointer hover:text-purple-600" />
                  <Trash
                    onClick={() => handleDelete(post._id)}
                    className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700"
                  />
                </div>
              )}

              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                  {getInitial(post.user)}
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">
                    {post.user.firstName} {post.user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{post.user.email}</p>
                </div>
              </div>

              <p className="text-gray-800 mb-3">{post.content}</p>

              {post.imageUrl && (
                <img
                  src={getImageUrl(post.imageUrl)}
                  alt="post"
                  className="rounded-lg mb-3 max-h-96 object-cover"
                />
              )}

              <div className="flex space-x-6 text-gray-600 mb-2">
                <button
                  className={`flex items-center ${
                    likedPosts[post._id] ? "text-red-500" : "text-gray-600"
                  } hover:text-purple-600`}
                  onClick={() => toggleLike(post._id)}
                >
                  <Heart className="h-5 w-5 mr-1" /> {post.likes}
                </button>

                <button
                  className="flex items-center hover:text-purple-600"
                  onClick={() => toggleComments(post._id)}
                >
                  <MessageSquare className="h-5 w-5 mr-1" /> {post.comments.length}
                </button>
              </div>

              {showComments[post._id] && (
                <div className="mt-3 border-t pt-3 space-y-2">
                  <ul className="space-y-2">
                    {post.comments.map((c, idx) => {
                      const commentUser = c.user || { firstName: "", lastName: "", email: "U" };
                      return (
                        <li key={c._id || idx} className="flex items-start space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
                            {commentUser.firstName?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div className="pb-2 rounded-lg flex-1">
                            <p className="text-sm font-semibold">
                              {`${commentUser.firstName ?? ""} ${
                                commentUser.lastName ?? ""
                              }`.trim() || commentUser.email}
                            </p>
                            <p className="text-sm mt-1">{c.content}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="flex items-start space-x-2 mt-2">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                      {getInitial(user)}
                    </div>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post._id] || ""}
                      onChange={(e) => handleCommentChange(post._id, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit(post._id)}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Timeline;

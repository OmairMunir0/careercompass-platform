'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, MessageSquare, Calendar, User, Edit, Trash, Tag } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Comment {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl?: string;
  };
  text: string;
  name: string;
  avatar: string;
  date: string;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl?: string;
  };
  authorName: string;
  authorAvatar?: string;
  image?: string;
  tags: string[];
  likes: Array<{ _id: string; firstName: string; lastName: string }>;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

const BlogDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchBlog();
    }
  }, [params.id]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/blogs/${params.id}`);
      setBlog(res.data);
    } catch (error) {
      console.error('Failed to fetch blog:', error);
      toast.error('Failed to load blog');
      router.push('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!token) {
      toast.error('Please log in to like blogs');
      return;
    }

    setLiking(true);
    try {
      const res = await axiosInstance.put(`/blogs/${params.id}/like`);
      if (blog) {
        setBlog({ ...blog, likes: res.data.likes || blog.likes });
      }
    } catch (error) {
      toast.error('Failed to like blog');
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please log in to comment');
      return;
    }

    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await axiosInstance.post(`/blogs/${params.id}/comments`, { text: commentText });
      setBlog(res.data);
      setCommentText('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      await axiosInstance.delete(`/blogs/${params.id}`);
      toast.success('Blog deleted successfully');
      router.push('/blogs');
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  const isLiked = () => {
    if (!user || !blog) return false;
    return blog.likes.some((like) => like._id === user._id);
  };

  const isOwner = () => {
    return user && blog && blog.author._id === user._id;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog not found</h2>
          <Link href="/blogs" className="text-purple-600 hover:underline">
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link
        href="/blogs"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Blogs
      </Link>

      {/* Blog Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        {/* Title and Actions */}
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex-1">{blog.title}</h1>
          {isOwner() && (
            <div className="flex items-center gap-2 ml-4">
              <Link
                href={`/blogs/${blog._id}/edit`}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Edit size={20} />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 text-sm font-medium rounded-full"
              >
                <Tag size={14} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Author and Date */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {blog.author?.imageUrl || blog.authorAvatar ? (
              <Image
                src={(blog.author?.imageUrl || blog.authorAvatar) as string}
                alt={blog.authorName}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 text-white text-lg font-semibold">
                {blog.authorName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className="flex-grow">
            <div className="font-semibold text-gray-900">{blog.authorName}</div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar size={14} />
              {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isLiked()
                ? 'bg-red-50 text-red-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Heart size={18} className={isLiked() ? 'fill-red-600' : ''} />
            <span className="font-medium">{blog.likes?.length || 0} Likes</span>
          </button>
          <div className="flex items-center gap-2 text-gray-600">
            <MessageSquare size={18} />
            <span className="font-medium">{blog.comments?.length || 0} Comments</span>
          </div>
        </div>
      </div>

      {/* Blog Image */}
      {blog.image && (
        <div className="relative h-96 w-full rounded-xl overflow-hidden mb-6 shadow-md">
          <img
            src={blog.image.startsWith('http') ? blog.image : `http://localhost:3001${blog.image}`}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Blog Content */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-6">
        <div
          className="blog-content prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-purple-600 prose-strong:text-gray-900 prose-code:text-purple-600"
          dangerouslySetInnerHTML={{ __html: blog.content }}
          style={{
            lineHeight: '1.75',
          }}
        />
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageSquare size={24} className="text-purple-600" />
          Comments ({blog.comments?.length || 0})
        </h2>

        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleComment} className="mb-6">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {(user as any).imageUrl ? (
                  <Image
                    src={(user as any).imageUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-semibold">
                    {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className="mt-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600 mb-2">Please log in to comment</p>
            <Link href="/login" className="text-purple-600 hover:underline font-medium">
              Log In
            </Link>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {blog.comments && blog.comments.length > 0 ? (
            blog.comments.map((comment) => (
              <div key={comment._id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {comment.user?.imageUrl || comment.avatar ? (
                    <Image
                      src={(comment.user?.imageUrl || comment.avatar) as string}
                      alt={comment.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                      {comment.name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="font-semibold text-gray-900 mb-1">{comment.name}</div>
                  <p className="text-gray-700 mb-2">{comment.text}</p>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.date), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No comments yet. Be the first to comment!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;


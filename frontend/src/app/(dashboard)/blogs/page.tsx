'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Search, Plus, Heart, MessageSquare, Calendar } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

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
  comments: Array<{ _id: string; text: string; name: string }>;
  createdAt: string;
  updatedAt: string;
}

const BlogsPage: React.FC = () => {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchBlogs();
  }, [page, searchTerm, selectedTag]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      if (searchTerm) params.append('search', searchTerm);
      if (selectedTag) params.append('tag', selectedTag);

      const res = await axiosInstance.get(`/blogs?${params.toString()}`);
      setBlogs(res.data.blogs || []);
      setTotalPages(res.data.pagination?.pages || 1);

      // Extract unique tags
      const tags = new Set<string>();
      (res.data.blogs || []).forEach((blog: Blog) => {
        blog.tags?.forEach((tag) => tags.add(tag));
      });
      setAllTags(Array.from(tags));
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blogId: string) => {
    if (!token) {
      toast.error('Please log in to like blogs');
      return;
    }

    try {
      const res = await axiosInstance.put(`/blogs/${blogId}/like`);
      setBlogs((prev) =>
        prev.map((blog) =>
          blog._id === blogId
            ? { ...blog, likes: res.data.likes || blog.likes }
            : blog
        )
      );
    } catch (error) {
      toast.error('Failed to like blog');
    }
  };

  const isLiked = (blog: Blog) => {
    if (!user) return false;
    return blog.likes.some((like) => like._id === user._id);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="text-purple-600" size={32} />
            Blogs
          </h1>
          <p className="text-gray-600 mt-2">Discover and share knowledge</p>
        </div>
        {user && (
          <Link
            href="/blogs/create"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-md"
          >
            <Plus size={20} />
            Write Blog
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedTag('');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedTag
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Blogs Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedTag ? 'Try adjusting your search or filters' : 'Be the first to write a blog!'}
          </p>
          {user && (
            <Link
              href="/blogs/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={20} />
              Write Your First Blog
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {blogs.map((blog) => (
              <Link
                key={blog._id}
                href={`/blogs/${blog._id}`}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden group"
              >
                {/* Blog Image */}
                {blog.image && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={blog.image.startsWith('http') ? blog.image : `http://localhost:3001${blog.image}`}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Blog Content */}
                <div className="p-5">
                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {blog.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {blog.title}
                  </h2>

                  {/* Content Preview */}
                  <div
                    className="text-gray-600 text-sm mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: blog.content.substring(0, 150) + (blog.content.length > 150 ? '...' : ''),
                    }}
                  />

                  {/* Author and Date */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {blog.author?.imageUrl || blog.authorAvatar ? (
                        <Image
                          src={(blog.author?.imageUrl || blog.authorAvatar) as string}
                          alt={blog.authorName}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xs font-semibold">
                          {blog.authorName?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{blog.authorName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleLike(blog._id);
                      }}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        isLiked(blog) ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                      }`}
                    >
                      <Heart size={16} className={isLiked(blog) ? 'fill-red-600' : ''} />
                      <span>{blog.likes?.length || 0}</span>
                    </button>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MessageSquare size={16} />
                      <span>{blog.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogsPage;


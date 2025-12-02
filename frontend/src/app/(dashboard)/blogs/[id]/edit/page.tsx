'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon, X } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import dynamic from 'next/dynamic';
import RichTextEditor from '@/components/RichTextEditor';

// Dynamically import RichTextEditor to avoid SSR issues
const DynamicRichTextEditor = dynamic(() => Promise.resolve(RichTextEditor), { ssr: false });

const EditBlogPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.id) {
      fetchBlog();
    }
  }, [params.id]);

  useEffect(() => {
    if (!token || !user) {
      toast.error('Please log in to edit blogs');
      router.push('/login');
    }
  }, [token, user, router]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/blogs/${params.id}`);
      const blog = res.data;

      // Check if user is owner
      if (blog.author._id !== user?._id) {
        toast.error('You are not authorized to edit this blog');
        router.push(`/blogs/${params.id}`);
        return;
      }

      setTitle(blog.title);
      setContent(blog.content);
      setTags(blog.tags?.join(', ') || '');
      if (blog.image) {
        setExistingImage(blog.image);
      }
    } catch (error) {
      console.error('Failed to fetch blog:', error);
      toast.error('Failed to load blog');
      router.push('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      setExistingImage(null); // Clear existing image when new one is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content);
      if (tags.trim()) {
        formData.append('tags', tags.trim());
      }
      if (imageFile) {
        formData.append('blogImage', imageFile);
      }

      await axiosInstance.put(`/blogs/${params.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      toast.success('Blog updated successfully!');
      router.push(`/blogs/${params.id}`);
    } catch (error: any) {
      console.error('Failed to update blog:', error);
      toast.error(error.response?.data?.message || 'Failed to update blog');
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/blogs/${params.id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Blog
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Blog</h1>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
            id="blog-image-upload"
          />
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ) : existingImage ? (
            <div className="relative">
              <img
                src={existingImage.startsWith('http') ? existingImage : `http://localhost:3001${existingImage}`}
                alt="Current"
                className="w-full h-64 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-500 hover:border-purple-500 hover:text-purple-600 transition-colors"
            >
              <ImageIcon size={24} />
              <span>Click to upload image</span>
            </button>
          )}
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter tags separated by commas (e.g., technology, programming, tips)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
        </div>

        {/* Content */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          {typeof window !== 'undefined' && (
            <DynamicRichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your blog content here..."
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <Link
            href={`/blogs/${params.id}`}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
          >
            <Save size={18} />
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBlogPage;


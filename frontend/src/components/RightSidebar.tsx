'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Briefcase, BarChart3, ExternalLink, MessageSquare, ThumbsUp } from 'lucide-react';
import Image from 'next/image';
import axiosInstance from '@/lib/axiosInstance';
import { useInterviewStore } from '@/store/interviewStore';
import { formatDistanceToNow } from 'date-fns';

interface TrendingPost {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl?: string;
  };
  content: string;
  likes: number;
  comments: Array<{ _id: string }>;
  createdAt: string;
}

interface JobRecommendation {
  _id: string;
  title: string;
  location: string | null;
  salaryMin: number;
  salaryMax: number;
  recruiter?: {
    firstName: string;
    lastName: string;
  };
  jobType?: { name: string };
  workMode?: { name: string };
}

const RightSidebar: React.FC = () => {
  const router = useRouter();
  const { analysis } = useInterviewStore();
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [jobs, setJobs] = useState<JobRecommendation[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const res = await axiosInstance.get('/posts/trending');
        setTrendingPosts(res.data);
      } catch (error) {
        console.error('Failed to fetch trending posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    const fetchJobRecommendations = async () => {
      try {
        const res = await axiosInstance.get('/job-posts/recommendations');
        setJobs(res.data.results || []);
      } catch (error) {
        console.error('Failed to fetch job recommendations:', error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchTrendingPosts();
    fetchJobRecommendations();
  }, []);

  const latestAnalysis = analysis.length > 0 ? analysis[analysis.length - 1] : null;
  const avgScore = latestAnalysis?.overall_score || 0;

  return (
    <div className="space-y-5 sticky top-4">
      {/* Trending Posts */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-purple-600" size={20} />
          <h3 className="font-semibold text-gray-900">Trending Posts</h3>
        </div>
        {loadingPosts ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : trendingPosts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No trending posts yet</p>
        ) : (
          <div className="space-y-3">
            {trendingPosts.slice(0, 3).map((post) => (
              <div
                key={post._id}
                onClick={() => router.push(`/timeline#post-${post._id}`)}
                className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {post.user.imageUrl ? (
                      <Image
                        src={(post.user as any).imageUrl.startsWith('http') ? (post.user as any).imageUrl : `http://localhost:3000${(post.user as any).imageUrl}`}
                        alt={`${post.user.firstName} ${post.user.lastName}`}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                        {post.user.firstName?.[0] || ''}{post.user.lastName?.[0] || ''}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 ml-10">
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    <span>{post.comments.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Recommendations */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="text-orange-500" size={20} />
          <h3 className="font-semibold text-gray-900">Jobs for You</h3>
        </div>
        {loadingJobs ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No job recommendations</p>
        ) : (
          <div className="space-y-3">
            {jobs.slice(0, 3).map((job) => (
              <div
                key={job._id}
                onClick={() => router.push(`/find-jobs/${job._id}`)}
                className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
              >
                <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">
                  {job.title}
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  {job.location && <div>📍 {job.location}</div>}
                  <div>
                    💰 ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                  </div>
                  {job.workMode && <div>🏢 {job.workMode.name}</div>}
                </div>
              </div>
            ))}
            <button
              onClick={() => router.push('/find-jobs')}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
            >
              View All Jobs
              <ExternalLink size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Interview Stats */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-md border border-purple-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-purple-600" size={20} />
          <h3 className="font-semibold text-gray-900">Your Stats</h3>
        </div>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Average Interview Score</div>
            <div className="text-3xl font-bold text-purple-600">{avgScore}%</div>
            {analysis.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Based on {analysis.length} interview{analysis.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          {analysis.length === 0 && (
            <button
              onClick={() => router.push('/interviews/record')}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium text-sm"
            >
              Start Practice Interview
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;


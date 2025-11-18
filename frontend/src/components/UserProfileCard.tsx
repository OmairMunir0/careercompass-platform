'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Edit, FileText, Video } from 'lucide-react';
import Image from 'next/image';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';

interface UserStats {
  postsCount: number;
  interviewsCount: number;
}

const UserProfileCard: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({ postsCount: 0, interviewsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const res = await axiosInstance.get('/users/me/stats');
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 sticky top-4">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-4">
        <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 ring-4 ring-purple-100 mb-3">
          {(user as any).imageUrl ? (
            <Image
              src={(user as any).imageUrl.startsWith('http') ? (user as any).imageUrl : `http://localhost:3001${(user as any).imageUrl}`}
              alt={`${user.firstName} ${user.lastName}`}
              width={80}
              height={80}
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 text-white text-2xl font-semibold">
              {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
            </div>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 text-lg">
          {user.firstName} {user.lastName}
        </h3>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      {/* Stats */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
              <FileText size={18} />
            </div>
            {loading ? (
              <div className="h-5 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              <div className="text-xl font-bold text-gray-900">{stats.postsCount}</div>
            )}
            <div className="text-xs text-gray-500">Posts</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <Video size={18} />
            </div>
            {loading ? (
              <div className="h-5 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
            ) : (
              <div className="text-xl font-bold text-gray-900">{stats.interviewsCount}</div>
            )}
            <div className="text-xs text-gray-500">Interviews</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={() => router.push('/profile')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium text-sm"
        >
          <Edit size={16} />
          Edit Profile
        </button>
        <button
          onClick={() => router.push('/profile')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
        >
          <User size={16} />
          View Profile
        </button>
      </div>
    </div>
  );
};

export default UserProfileCard;


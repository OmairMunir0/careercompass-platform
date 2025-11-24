"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { Briefcase, Eye, MapPin, MessageSquare, Users, UserPlus, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatDate, formatDateTime } from "@/lib/date";

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roleId: { name: string };
  position?: string;
  location?: string;
  companyName?: string;
}

interface UserExperienceData {
  _id: string;
  user: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  description?: string;
  isCurrent: boolean;
}

interface IMessage {
  _id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isRead: boolean;
}

interface JobApplication {
  _id: string;
  user: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  job: {
    _id: string;
    title: string;
  };
  coverLetter?: string | null;
  resumeUrl?: string | null;
  status: { _id: string; name: string };
  appliedAt: string;
}

interface IChat {
  _id: string;
  participantId: string;
  participantName: string;
  participantRole: "candidate" | "recruiter";
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
  isOnline: boolean;
}

const CandidateSearch: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();

  const [users, setUsers] = useState<UserData[]>([]);
  const [experiences, setExperiences] = useState<Record<string, UserExperienceData[]>>({});
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [chats, setConversations] = useState<IChat[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [statuses, setStatuses] = useState<Array<{ _id: string; name: string }>>([]);
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});

  console.log(applications);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get("/users/candidates", {
          params: { search: searchQuery, page: 1, limit: 10 },
        });
        setUsers(data.data);
        setFilteredUsers(data.data);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [searchQuery]);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setAppsLoading(true);
        const { data } = await axiosInstance.get<JobApplication[]>("/job-applications");
        setApplications(data || []);
      } catch (err) {
        console.error("Failed to load job applications:", err);
        setApplications([]);
      } finally {
        setAppsLoading(false);
      }
    };
    loadApplications();
  }, []);

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const { data } = await axiosInstance.get<Array<{ _id: string; name: string }>>(
          "/job-application-statuses"
        );
        setStatuses(data || []);
      } catch (err) {
        console.error("Failed to load statuses:", err);
      }
    };
    loadStatuses();
  }, []);

  useEffect(() => {
    const loadFollowStatuses = async () => {
      if (!user?._id || filteredUsers.length === 0) return;
      
      try {
        const statusMap: Record<string, boolean> = {};
        
        for (const candidate of filteredUsers) {
          if (candidate._id === user._id) continue;
          
          const { data } = await axiosInstance.get(`/follows/status/${candidate._id}`);
          statusMap[candidate._id] = data.isFollowing || false;
        }
        
        setFollowStatus(statusMap);
      } catch (err) {
        console.error("Failed to load follow statuses:", err);
      }
    };

    loadFollowStatuses();
  }, [filteredUsers, user?._id]);

  const handleChangeApplicationStatus = async (appId: string, statusId: string) => {
    try {
      const res = await axiosInstance.put(`/job-applications/${appId}/status`, { statusId });
      const updated = res.data?.data as JobApplication;
      setApplications((prev) => prev.map((a) => (a._id === appId ? updated : a)));
      toast.success("Application status updated");
    } catch (err: any) {
      console.error("Failed to update application status:", err);
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  console.log(applications);

  // Load experiences for users
  useEffect(() => {
    const loadExperiences = async () => {
      try {
        const exps: Record<string, UserExperienceData[]> = {};
        for (const u of users) {
          const { data } = await axiosInstance.get(`/user-experiences/user/${u._id}`);
          exps[u._id] = data;
        }
        setExperiences(exps);
      } catch (err) {
        console.error("Failed to load user experiences:", err);
      }
    };
    if (users.length > 0) loadExperiences();
  }, [users]);

  // Filter by location
  useEffect(() => {
    const filtered = users.filter((u) => {
      const matchesSearch =
        u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.position?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesLocation =
        !locationFilter ||
        (u.location?.toLowerCase().includes(locationFilter.toLowerCase()) ?? false);

      return matchesSearch && matchesLocation;
    });

    setFilteredUsers(filtered);
  }, [users, searchQuery, locationFilter]);

  const handleFollowToggle = async (targetUserId: string) => {
    if (!user?._id) return;

    try {
      const isCurrentlyFollowing = followStatus[targetUserId];

      if (isCurrentlyFollowing) {
        await axiosInstance.delete(`/follows/${targetUserId}`);
        setFollowStatus((prev) => ({ ...prev, [targetUserId]: false }));
        toast.success("Unfollowed successfully");
      } else {
        await axiosInstance.post(`/follows/${targetUserId}`);
        setFollowStatus((prev) => ({ ...prev, [targetUserId]: true }));
        toast.success("Following successfully");
      }
    } catch (err: any) {
      console.error("Failed to toggle follow:", err);
      toast.error(err?.response?.data?.message || "Failed to update follow status");
    }
  };

  const handleStartConversation = (candidateId: string) => {
    router.push(`/chats?userId=${candidateId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Candidates</h1>

        {/* Search & Location */}
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full lg:flex-1 pl-3 pr-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="pl-3 pr-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Applications Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Job Applications</h2>
            <span className="text-sm text-gray-600">
              Total: {applications.length}
            </span>
          </div>

          {appsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full" />
            </div>
          ) : applications.length === 0 ? (
            <p className="text-gray-600">No job applications yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Candidate</div>
                      <div className="font-semibold text-gray-900">
                        {(app.user.firstName || app.user.lastName)
                          ? `${app.user.firstName || ""} ${app.user.lastName || ""}`.trim()
                          : app.user._id}
                      </div>
                      {app.user.email && (
                        <div className="text-sm text-gray-600">{app.user.email}</div>
                      )}
                    </div>

                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        /pending/i.test(app.status.name)
                          ? "bg-yellow-100 text-yellow-800"
                          : /accepted|approved/i.test(app.status.name)
                          ? "bg-green-100 text-green-800"
                          : /rejected|declined/i.test(app.status.name)
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {app.status.name}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm text-gray-500">Job</div>
                    <div className="text-gray-900 font-medium">{app.job.title}</div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                    <div>Applied {formatDate(app.appliedAt)}</div>
                    <div className="text-gray-500">{formatDateTime(app.appliedAt, "EEE, h:mm a")}</div>
                  </div>

                  {app.coverLetter && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-500 mb-1">Cover Letter</div>
                      <p className="text-sm text-gray-800 line-clamp-4 whitespace-pre-wrap">{app.coverLetter}</p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center space-x-2">
                    {app.resumeUrl ? (<>
                      {console.log(app.resumeUrl)}
                      <a
                      href={app.resumeUrl.startsWith("http") ? app.resumeUrl : `http://localhost:3001/${app.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        View Resume
                      </a></>
                    ) : (
                      <span className="text-sm text-gray-500">No resume attached</span>
                    )}
                    <button
                      onClick={() => handleStartConversation(app.user._id)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Message
                    </button>
                    {statuses.length > 0 && (
                      <div className="ml-auto flex items-center gap-1">
                        <select
                          value={app.status?._id || ""}
                          onChange={(e) => handleChangeApplicationStatus(app._id, e.target.value)}
                          className="p-1 border border-gray-300 rounded-md text-sm"
                        >
                          {statuses.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No candidates found</h3>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={`https://ui-avatars.com/api/?name=${u.firstName}+${u.lastName}&background=7c3aed&color=fff`}
                      alt={`${u.firstName} ${u.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {u.firstName} {u.lastName}
                      </h3>
                      {u.position && (
                        <p className="text-lg font-medium text-purple-600">{u.position}</p>
                      )}
                      <div className="flex items-center space-x-2 text-gray-600 mt-2">
                        {u.location && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{u.location}</span>
                          </span>
                        )}
                        {u.companyName && (
                          <span className="flex items-center space-x-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{u.companyName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    {u._id !== user?._id && (
                      <button
                        onClick={() => handleFollowToggle(u._id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                          followStatus[u._id]
                            ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {followStatus[u._id] ? (
                          <>
                            <UserMinus className="w-4 h-4" />
                            <span>Unfollow</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleStartConversation(u._id)}
                      className="flex items-center text-white bg-purple-600 space-x-2 px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat</span>
                    </button>

                    <button
                      onClick={() => setExpandedUser(expandedUser === u._id ? null : u._id)}
                      className="flex items-center text-gray-900 space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Experience</span>
                    </button>
                  </div>
                </div>

                {expandedUser === u._id && experiences[u._id]?.length > 0 && (
                  <div className="border-t pt-4 space-y-4">
                    {experiences[u._id].map((exp) => (
                      <div key={exp._id} className="border-l-2 border-purple-200 pl-4">
                        <h5 className="font-medium text-gray-900">{exp.jobTitle}</h5>
                        <p className="text-purple-600">{exp.company}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(exp.startDate, "MMM yyyy")} - {exp.endDate ? formatDate(exp.endDate, "MMM yyyy") : "Present"}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateSearch;

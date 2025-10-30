"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { Briefcase, Eye, MapPin, MessageSquare, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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

  // Start or get chat
  const handleStartConversation = async (candidateId: string) => {
    if (!user?._id) return;

    try {
      // Call backend to get or create a chat
      const { data } = await axiosInstance.post("/chats/get-or-create", {
        recruiterId: user._id,
        candidateId,
      });

      // Transform returned chat into your Conversation shape
      const newChat: IChat = {
        _id: data._id,
        participantId: candidateId,
        participantName: data.candidate?.firstName
          ? `${data.candidate.firstName} ${data.candidate.lastName}`
          : `User ${candidateId}`,
        participantRole: "candidate",
        lastMessage: data.messages.length
          ? {
              content: data.messages[data.messages.length - 1].content,
              createdAt: data.messages[data.messages.length - 1].createdAt,
              senderId: data.messages[data.messages.length - 1].sender,
            }
          : { content: "No messages yet", createdAt: data.updatedAt, senderId: "" },
        unreadCount: 0,
        isOnline: false,
      };

      // Add to local state if it’s a new chat
      setConversations((prev) => {
        const exists = prev.find((c) => c._id === newChat._id);
        if (exists) return prev;
        return [newChat, ...prev];
      });

      // Open the chat
      setSelectedConversation(newChat._id);
    } catch (err) {
      console.error("Failed to start conversation:", err);
      alert("Failed to open chat.");
    }
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
                          {new Date(exp.startDate).getFullYear()} -{" "}
                          {exp.endDate ? new Date(exp.endDate).getFullYear() : "Present"}
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

"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { ArrowLeft, Building, Check, CheckCheck, Search, Send, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface Message {
  _id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
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

const ChatsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [chats, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch chats
  useEffect(() => {
    const loadConversations = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/chats`);

        const transformed: Conversation[] = data.map((chat: any) => {
          const otherParticipant =
            chat.participantId === user._id ? chat.participant : chat.participant;

          return {
            _id: chat._id,
            participantId: chat.participantId,
            participantName: chat.participantName,
            participantRole: chat.participantRole,
            lastMessage: chat.lastMessage || {
              content: "No messages yet",
              createdAt: chat.updatedAt,
              senderId: "",
            },
            unreadCount: chat.unreadCount ?? 0,
            isOnline: chat.isOnline ?? false,
          };
        });

        setConversations(transformed);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user?._id]);

  // Fetch messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) {
        setMessages([]);
        return;
      }
      try {
        const { data } = await axiosInstance.get(`/chats/${selectedConversation}/messages`);
        const mapped: Message[] = data.map((m: any) => ({
          id: m._id,
          content: m.content,
          senderId: m.sender._id,
          receiverId: m.sender._id === user?._id ? "" : user?._id || "",
          createdAt: m.createdAt,
          isRead: m.isRead,
        }));
        setMessages(mapped);

        // Mark all messages as read
        await axiosInstance.patch(`/chats/${selectedConversation}/messages/read/${user?._id}`);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    loadMessages();
  }, [selectedConversation, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    const receiverId = chats.find((c) => c._id === selectedConversation)?.participantId;
    if (!receiverId) return;

    const content = newMessage;
    setNewMessage("");

    const tempMessage: Message = {
      _id: Date.now().toString(),
      content,
      senderId: user?._id || "",
      receiverId,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const { data } = await axiosInstance.post(`/chats/${selectedConversation}/message`, {
        sender: user?._id,
        content,
      });

      const newMsg: Message = {
        _id: data._id,
        content: data.content,
        senderId: data.sender._id,
        receiverId,
        createdAt: data.createdAt,
        isRead: data.isRead,
      };

      setMessages((prev) => [...prev.filter((m) => m._id !== tempMessage._id), newMsg]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
      setNewMessage(content);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileAttachment = () => fileInputRef.current?.click();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffHours < 168) return date.toLocaleDateString([], { weekday: "short" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredConversations = chats.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = chats.find((c) => c._id === selectedConversation);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 flex flex-col ${
          isMobileView && selectedConversation ? "hidden" : "w-full md:w-80"
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Chats</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? "No chats found" : "No chats yet"}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => setSelectedConversation(conv._id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conv._id ? "bg-purple-50 border-purple-200" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      {conv.participantRole === "recruiter" ? (
                        <Building className="w-6 h-6 text-purple-600" />
                      ) : (
                        <User className="w-6 h-6 text-purple-600" />
                      )}
                    </div>
                    {conv.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conv.participantName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage.senderId === user?._id ? "You: " : ""}
                        {conv.lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-purple-600 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col ${isMobileView && !selectedConversation ? "hidden" : ""}`}
      >
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isMobileView && (
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  {selectedConv.participantRole === "recruiter" ? (
                    <Building className="w-5 h-5 text-purple-600" />
                  ) : (
                    <User className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {selectedConv.participantName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedConv.isOnline ? "Online" : "Offline"} • {selectedConv.participantRole}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2"></div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderId === user?._id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwn ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div
                        className={`flex items-center justify-end mt-1 space-x-1 ${
                          isOwn ? "text-purple-200" : "text-gray-500"
                        }`}
                      >
                        <span className="text-xs">{formatTime(message.createdAt)}</span>
                        {isOwn &&
                          (message.isRead ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 p-4 flex items-end space-x-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                style={{ minHeight: "40px", maxHeight: "120px" }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={`p-2 rounded transition-colors ${
                  newMessage.trim()
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => console.log("Files selected:", e.target.files)}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a chat</h3>
              <p className="text-gray-500">Choose a chat from the sidebar to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPage;

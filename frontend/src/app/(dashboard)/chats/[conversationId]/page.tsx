"use client";

import React, { useEffect, useState, useRef } from "react";
import { Send, User as UserIcon, Loader2, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import type { Conversation, Message } from "@/lib/schema.type";
import axiosInstance from "@/lib/axiosInstance";
import { useParams } from "next/navigation";

interface ProfileSummary {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
}

const ChatDetailPage = () => {
  const params = useParams();
  const conversationId = params?.conversationId as string;
  const { user } = useAuthStore();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherProfile, setOtherProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessageContent, setNewMessageContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Load conversation + messages
  useEffect(() => {
    if (!conversationId || !user?._id) return;

    const fetchConversation = async () => {
      try {
        setLoading(true);

        const { data: convRes } = await axiosInstance.get(
          `/api/conversations/${conversationId}`
        );
        const conv: Conversation = convRes.data;
        setConversation(conv);

        const otherId =
          conv.recruiterProfileId === user._id
            ? conv.candidateProfileId
            : conv.recruiterProfileId;

        const { data: otherRes } = await axiosInstance.get(
          `/api/profiles/${otherId}`
        );
        const other = otherRes.data;

        setOtherProfile({
          id: other.id,
          firstName: other.user.firstName,
          lastName: other.user.lastName,
          position: other.position,
        });

        await loadMessages(conv.id);
        await markConversationAsRead(conv.id);
      } catch (error) {
        console.error("Conversation load error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId, user?._id]);

  const loadMessages = async (id: string) => {
    try {
      const { data: res } = await axiosInstance.get(`/api/messages/${id}`);
      const msgs: Message[] = res.data.reverse(); // API returns DESC order
      setMessages(msgs);
    } catch (error) {
      console.error("Load messages error:", error);
    }
  };

  const markConversationAsRead = async (id: string) => {
    try {
      await axiosInstance.put(`/api/conversations/${id}/read`);
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageContent.trim() || !conversationId || !user?._id) return;

    const content = newMessageContent.trim();
    setNewMessageContent("");

    const tempId = Date.now().toString();
    const optimistic: Message = {
      id: tempId,
      conversationId,
      senderProfileId: user._id,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom();

    try {
      await axiosInstance.post("/api/messages", { conversationId, content });
      await loadMessages(conversationId);
    } catch (error) {
      console.error("Send message error:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessageContent(content);
    }
  };

  return (
    <div className="d-flex flex-column h-100 p-3">
      {loading ? (
        <div className="text-center mt-5">
          <Loader2 className="animate-spin" /> Loading chat...
        </div>
      ) : conversation && otherProfile ? (
        <>
          <div className="d-flex align-items-center mb-3 border-bottom pb-2">
            <UserIcon className="me-2" />
            <div>
              <div className="fw-bold">
                {otherProfile.firstName} {otherProfile.lastName}
              </div>
              <div className="text-muted small">
                {otherProfile.position || "No title"}
              </div>
            </div>
          </div>

          <div
            className="flex-grow-1 overflow-auto mb-3"
            style={{ minHeight: "400px" }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 d-flex ${
                  msg.senderProfileId === user?._id
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className={`p-2 rounded ${
                    msg.senderProfileId === user?._id
                      ? "bg-primary text-white"
                      : "bg-light"
                  }`}
                  style={{ maxWidth: "70%" }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Type a message..."
              value={newMessageContent}
              onChange={(e) => setNewMessageContent(e.target.value)}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!newMessageContent.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </>
      ) : (
        <div className="text-center text-muted mt-5">
          <MessageSquare className="mb-2" />
          Conversation not found.
        </div>
      )}
    </div>
  );
};

export default ChatDetailPage;

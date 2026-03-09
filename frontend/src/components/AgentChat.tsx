"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Trash2, MessageCircle, Minimize2, X } from "lucide-react";
import { agentService } from "@/services/agentService";
import toast from "react-hot-toast";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadHistory = async () => {
      if (isOpen && messages.length === 0) {
        try {
          const data = await agentService.getHistory();
          if (data.history && data.history.length > 0) {
            const last20 = data.history.slice(-20);
            setMessages(last20.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
            })));
            setSessionId(data.sessionId);
          }
        } catch (error) {
          console.error("Failed to load history:", error);
        }
      }
    };
    loadHistory();
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await agentService.sendMessage(userMessage);
      
      if (!sessionId) {
        setSessionId(response.sessionId);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.response },
      ]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    try {
      await agentService.clearHistory(sessionId);
      setMessages([]);
      setSessionId(undefined);
      toast.success("Chat history cleared");
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all z-50"
        title="Open AI Assistant"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 flex flex-col bg-white dark:bg-gray-900 border rounded-lg shadow-2xl z-50 transition-all ${
      isMinimized ? 'h-14 w-80' : 'h-[600px] w-96'
    }`}>
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-blue-500" />
          <div>
            <h2 className="text-lg font-semibold dark:text-white">AI Assistant</h2>
            {!isMinimized && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ask about jobs, profile, or career advice
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isMinimized && messages.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              title="Clear chat"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p className="text-lg mb-2">👋 Welcome!</p>
            <p>Start a conversation by asking me something like:</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>&quot;Show me my profile&quot;</li>
              <li>&quot;Search for software engineer jobs in New York&quot;</li>
              <li>&quot;What jobs have I applied to?&quot;</li>
              <li>&quot;Add Python to my skills&quot;</li>
            </ul>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <Streamdown>{message.content}</Streamdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <Loader2 className="animate-spin text-gray-500 dark:text-gray-400" size={20} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
            rows={2}
            maxLength={2000}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {input.length}/2000 characters
        </p>
      </div>
      </>
      )}
    </div>
  );
}

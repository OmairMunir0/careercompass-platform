import axiosInstance from "../lib/axiosInstance";

export interface AgentChatRequest {
  message: string;
  sessionId?: string;
}

export interface AgentChatResponse {
  response: string;
  sessionId: string;
  toolsUsed?: string[];
}

export const agentService = {
  sendMessage: async (message: string): Promise<AgentChatResponse> => {
    const response = await axiosInstance.post("/agent/chat", {
      message,
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await axiosInstance.get(`/agent/history`);
    return response.data;
  },

  clearHistory: async () => {
    const response = await axiosInstance.delete(`/agent/history`);
    return response.data;
  },
};

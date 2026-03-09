import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface AgentChatRequest {
  message: string;
  sessionId?: string;
}

export interface AgentChatResponse {
  response: string;
  sessionId: string;
  toolsUsed?: string[];
}

export interface ToolExecutionContext {
  userId: string;
  userEmail: string;
  userRole: string;
}

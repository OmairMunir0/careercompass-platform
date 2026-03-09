import { Response } from "express";
import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { AuthenticatedRequest, AgentChatRequest, AgentChatResponse } from "../types/agent.types";
import { getAllTools } from "../services/agentTools";
import { validateUserMessage, sanitizeMessage, createSystemPrompt } from "../utils/agentSecurity";
import { User } from "../models/User";
import { AgentSession } from "../models/AgentSession";

const model = new ChatOpenAI({
  modelName: "gpt-5-nano",
});

let agentInstance: any = null;

const getAgent = (systemPrompt: string, tools: any[]) => {
  if (!agentInstance) {
    agentInstance = createAgent({
      model,
      tools,
      systemPrompt,
    });
  }
  return agentInstance;
};

export const chat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { message, sessionId } = req.body as AgentChatRequest;

    const validation = validateUserMessage(message);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    const sanitizedMessage = sanitizeMessage(message);

    const user = await User.findById(req.user.id).populate("roleId", "name").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = user.roleId as any;
    const userContext = {
      firstName: user.firstName,
      role: role?.name || "user",
    };

    const toolContext = {
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
    };

    const tools = getAllTools(toolContext);
    const systemPrompt = createSystemPrompt(userContext);

    const agent = getAgent(systemPrompt, tools);

    let session = await AgentSession.findOne({ userId: req.user.id });
    if (!session) {
      session = await AgentSession.create({
        userId: req.user.id,
        messages: [],
      });
      console.log(`[AGENT] Created new session for user ${req.user.id}`);
    }

    const history = session.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    history.push({
      role: "user",
      content: sanitizedMessage,
    });

    console.log(`[AGENT] User ${req.user.id} sent message: "${sanitizedMessage.substring(0, 50)}..."`);  
    console.log(`[AGENT] Invoking agent with ${history.length} messages in history`);

    const result = await agent.invoke({
      messages: history,
    });

    console.log(`[AGENT] Agent returned ${result.messages.length} messages`);

    const assistantMessage = result.messages[result.messages.length - 1];
    const responseContent = assistantMessage.content as string;

    const toolsUsed = result.messages
      .filter((msg: any) => msg.tool_calls && msg.tool_calls.length > 0)
      .flatMap((msg: any) => msg.tool_calls.map((tc: any) => tc.name));

    if (toolsUsed.length > 0) {
      console.log(`[AGENT] Tools called: ${toolsUsed.join(", ")}`);
      result.messages.forEach((msg: any, idx: number) => {
        if (msg.tool_calls && msg.tool_calls.length > 0) {
          msg.tool_calls.forEach((tc: any) => {
            console.log(`[AGENT] Tool Call #${idx}: ${tc.name}`);
            console.log(`[AGENT] Tool Args: ${JSON.stringify(tc.args, null, 2)}`);
          });
        }
      });
    } else {
      console.log(`[AGENT] No tools were called for this request`);
    }

    session.messages.push({
      role: "user",
      content: sanitizedMessage,
      timestamp: new Date(),
    });

    session.messages.push({
      role: "assistant",
      content: responseContent,
      timestamp: new Date(),
    });

    if (session.messages.length > 100) {
      session.messages = session.messages.slice(-100);
    }

    await session.save();
    console.log(`[AGENT] Session saved with ${session.messages.length} total messages`);

    const response: AgentChatResponse = {
      response: responseContent,
      sessionId: (session._id as any).toString(),
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
    };

    return res.status(200).json(response);
  } catch (err: any) {
    console.error("Agent chat error:", err);
    return res.status(500).json({ 
      message: "An error occurred while processing your request",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const getHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log(`[AGENT] Fetching history for user ${req.user.id}`);
    const session = await AgentSession.findOne({ userId: req.user.id });
    
    if (!session) {
      return res.status(200).json({ sessionId: null, history: [] });
    }

    return res.status(200).json({ 
      sessionId: (session._id as any).toString(), 
      history: session.messages 
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const clearHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await AgentSession.findOne({ userId: req.user.id });
    
    if (session) {
      session.messages = [];
      await session.save();
      console.log(`[AGENT] Cleared history for user ${req.user.id}`);
    }

    return res.status(200).json({ message: "Chat history cleared" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

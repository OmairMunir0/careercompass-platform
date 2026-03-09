# Agentic AI Chat Implementation Plan
## Using LangChain.js with Express Backend

---

## Overview
This document outlines the implementation plan for adding agentic AI chat functionality to the CareerCompass platform using **LangChain.js** (JavaScript/TypeScript version).

---

## Technology Stack

### LangChain.js
- **Package**: `langchain` (JavaScript/TypeScript)
- **Version**: Latest stable
- **Documentation**: https://docs.langchain.com/oss/javascript/langchain/overview
- **Why LangChain.js**:
  - Native TypeScript support (matches our Express backend)
  - Built-in tool calling and agent creation
  - Model-agnostic (can use OpenAI, Anthropic, etc.)
  - Simple `createAgent` API for quick setup
  - Built on top of LangGraph for advanced features

---

## Architecture

### Integration Point
- **Location**: Express Backend (`/home/kali/Desktop/careercompass-platform-main/backend`)
- **New Route**: `/api/agent/chat`
- **Port**: 3001 (existing Express server)

### Flow
```
Frontend (React)
    ↓
    POST /api/agent/chat
    ↓
Express Backend (Agent Route)
    ↓
LangChain.js Agent
    ↓
Tool Calls → Internal API Calls
    ↓
Response to Frontend
```

---

## Implementation Steps

### Phase 1: Setup & Dependencies (30 mins)

#### 1.1 Install Required Packages
```bash
cd backend
npm install langchain @langchain/openai zod
```

**Packages**:
- `langchain` - Core LangChain.js library
- `@langchain/openai` - OpenAI integration (or use `@langchain/anthropic` for Claude)
- `zod` - Schema validation for tool parameters

#### 1.2 Environment Variables
Add to `backend/.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

---

### Phase 2: Create Tools (1-2 hours)

#### 2.1 Define API Tools
Create `backend/src/services/agentTools.ts`

Tools to implement:
1. **User Profile Management**
   - `updateUserProfile` - Update user bio, position, location
   - `addUserSkill` - Add skills to user profile
   - `getUserProfile` - Get current user profile info

2. **Job Search & Applications**
   - `searchJobs` - Search for job posts based on criteria
   - `getJobDetails` - Get details of a specific job
   - `applyToJob` - Submit job application
   - `getSavedJobs` - Get user's saved jobs
   - `saveJob` - Save a job for later

3. **Resume Management**
   - `uploadResume` - Upload/update resume
   - `getResumeAnalysis` - Get ATS analysis of resume

4. **Experience & Education**
   - `addExperience` - Add work experience
   - `addEducation` - Add education entry
   - `addCertification` - Add certification

Each tool will:
- Use Zod schema for parameter validation
- Call internal API endpoints or controllers directly
- Return structured responses

---

### Phase 3: Create Agent Route (1 hour)

#### 3.1 Create Agent Controller
Create `backend/src/controllers/agentController.ts`

Features:
- Initialize LangChain agent with tools
- Handle structured responses (no streaming)
- Maintain conversation history
- Error handling
- Input validation and sanitization
- Rate limiting enforcement

#### 3.2 Create Agent Routes
Create `backend/src/routes/agentRoutes.ts`

Endpoints:
- `POST /api/agent/chat` - Send message to agent
- `GET /api/agent/history/:sessionId` - Get chat history (optional)
- `DELETE /api/agent/history/:sessionId` - Clear chat history (optional)

#### 3.3 Register Routes
Update `backend/src/routes/index.ts`:
```typescript
import agentRoutes from "./agentRoutes";
router.use("/agent", agentRoutes);
```

---

### Phase 4: Agent Configuration (30 mins)

#### 4.1 System Prompt
Create a comprehensive system prompt that:
- Defines the agent's role (CareerCompass AI Assistant)
- Explains available capabilities
- Sets tone and personality
- Provides context about the platform

#### 4.2 Agent Initialization
```typescript
import { createAgent, tool } from "langchain";
import { z } from "zod";

const agent = createAgent({
  model: "gpt-4o", // or "claude-sonnet-4-6"
  tools: [
    updateProfileTool,
    searchJobsTool,
    applyToJobTool,
    // ... other tools
  ],
  systemPrompt: "You are a helpful AI assistant for CareerCompass...",
});
```

---

### Phase 5: Frontend Integration (1-2 hours)

#### 5.1 Create Agent Service
Create `frontend/src/services/agentService.ts`

Functions:
- `sendMessage(message: string, sessionId?: string)`
- `getChatHistory(sessionId: string)`
- `clearHistory(sessionId: string)`

#### 5.2 Create Chat UI Component
Create `frontend/src/components/AgentChat.tsx`

Features:
- Chat interface with message history
- Input field for user messages
- Display agent responses
- Show loading states
- Handle tool execution feedback

#### 5.3 Add to Navigation
Add chat icon/button to main navigation or create dedicated chat page

---

### Phase 6: Testing & Refinement (1-2 hours)

#### 6.1 Test Scenarios
- User asks to update profile
- User searches for jobs
- User applies to a job
- User asks about their saved jobs
- User requests resume analysis
- Multi-turn conversations
- Error handling (invalid requests, API failures)

#### 6.2 Refinements
- Improve tool descriptions for better agent decision-making
- Optimize system prompt
- Add conversation memory/context
- Implement rate limiting
- Add authentication checks

---

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── agentController.ts          # NEW: Agent logic
│   ├── routes/
│   │   ├── agentRoutes.ts              # NEW: Agent routes
│   │   └── index.ts                    # MODIFY: Register agent routes
│   ├── services/
│   │   └── agentTools.ts               # NEW: Tool definitions
│   └── types/
│       └── agent.types.ts              # NEW: TypeScript types
│
frontend/
├── src/
│   ├── components/
│   │   └── AgentChat.tsx               # NEW: Chat UI
│   ├── services/
│   │   └── agentService.ts             # NEW: Agent API calls
│   └── pages/
│       └── ChatPage.tsx                # NEW: Chat page (optional)
```

---

## Tool Implementation Example

```typescript
import { tool } from "langchain";
import { z } from "zod";

export const updateProfileTool = tool(
  async ({ bio, position, location }, config) => {
    // Get user from auth context
    const userId = config.configurable?.userId;
    
    // Call internal API or controller
    const result = await updateUserProfile(userId, {
      bio,
      position,
      location,
    });
    
    return `Profile updated successfully: ${JSON.stringify(result)}`;
  },
  {
    name: "update_user_profile",
    description: "Update the user's profile information including bio, position, and location",
    schema: z.object({
      bio: z.string().optional().describe("User's bio/about section"),
      position: z.string().optional().describe("User's job position/title"),
      location: z.string().optional().describe("User's location"),
    }),
  }
);
```

---

## Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Setup & Dependencies | 30 mins |
| 2 | Create Tools | 1-2 hours |
| 3 | Create Agent Route | 1 hour |
| 4 | Agent Configuration | 30 mins |
| 5 | Frontend Integration | 1-2 hours |
| 6 | Testing & Refinement | 1-2 hours |
| **Total** | | **5-8 hours** |

---

## Key Considerations

### Authentication
- All agent routes must use `authenticated` middleware
- Pass user context to tools for authorization
- Tools should respect user permissions

### Rate Limiting
- Implement rate limiting on agent endpoints
- Consider token usage costs
- Add request throttling

### Error Handling
- Graceful degradation when tools fail
- Clear error messages to users
- Logging for debugging

### Security

#### Input Validation & Sanitization
- **Zod Schema Validation**: All tool parameters must be validated using Zod schemas
- **System Prompt Protection**: Use delimiters to separate system instructions from user input
- **Input Length Limits**: Enforce maximum message length (e.g., 2000 characters)
- **Blacklist Dangerous Patterns**: Block attempts to override system instructions (e.g., "ignore previous instructions")

#### Rate Limiting & Abuse Prevention
- **Request Rate Limiting**: Max 10 requests per minute per user
- **Token Usage Monitoring**: Track and limit API token consumption per user
- **Session Throttling**: Prevent rapid-fire requests from same session

#### Additional Security Measures
- Validate all tool inputs with strict Zod schemas
- Sanitize user messages before processing
- Prevent prompt injection attacks
- Don't expose sensitive API details in responses
- Log suspicious activity for review

### Performance
- Consider caching for frequently accessed data
- Optimize tool execution
- Use structured responses (no streaming)
- Return complete, formatted responses in single payload

---

## Optional Enhancements

### 1. Conversation Memory
- Store chat history in MongoDB
- Implement session management
- Allow users to view past conversations

### 2. Enhanced Structured Responses
- Rich formatting for responses (markdown support)
- Structured data for tool execution results
- Clear status indicators for multi-step operations

### 3. Multi-Agent System
- Separate agents for different tasks (job search, profile, etc.)
- Route requests to specialized agents

### 4. Advanced Features
- File upload handling in chat
- Image generation for resumes
- Voice input/output
- Integration with interview video analysis

---

## Resources

- **LangChain.js Docs**: https://docs.langchain.com/oss/javascript/langchain/overview
- **Tool Calling Guide**: https://docs.langchain.com/oss/javascript/langchain/tools
- **Agent Guide**: https://docs.langchain.com/oss/javascript/langchain/agents
- **API Reference**: https://reference.langchain.com/javascript

---

## Next Steps

1. Review this plan
2. Set up OpenAI/Anthropic API key
3. Install dependencies
4. Start with Phase 1 (Setup)
5. Implement tools incrementally
6. Test each tool before moving to next phase

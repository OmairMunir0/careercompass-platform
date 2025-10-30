import { Request, Response } from "express";
import { Chat, IMessage } from "../models/Chat";

/**
 * @desc Create a new chat between recruiter and candidate
 * @route POST /api/chats
 * @access Private
 */
export const createChat = async (req: Request, res: Response) => {
  try {
    const { recruiter, candidate } = req.body;

    let chat = await Chat.findOne({ recruiter, candidate }).populate(
      "recruiter candidate messages.sender"
    );

    if (!chat) {
      chat = new Chat({ recruiter, candidate, messages: [] });
      await chat.save();
      await chat.populate("recruiter candidate");
    }

    res.status(201).json(chat);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Check for exisiting chat or start a new one
 * @route POST /api/chats/get-or-create
 * @access Private
 */
export const getOrCreateChat = async (req: Request, res: Response) => {
  try {
    const { recruiterId, candidateId } = req.body;
    if (!recruiterId || !candidateId)
      return res.status(400).json({ message: "Both recruiterId and candidateId are required" });

    // Check if chat already exists
    let chat = await Chat.findOne({
      recruiter: recruiterId,
      candidate: candidateId,
    });

    if (!chat) {
      chat = new Chat({ recruiter: recruiterId, candidate: candidateId, messages: [] });
      await chat.save();
    }

    res.status(200).json(chat);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all chats for the logged-in user (optimized: only last message)
 * @route GET /api/chats
 * @access Private
 */
export const getMyChats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const chats = await Chat.find({
      $or: [{ recruiter: userId }, { candidate: userId }],
    })
      .populate("recruiter candidate")
      .lean();

    const transformed = chats.map((chat) => {
      const otherParticipant =
        chat.recruiter._id.toString() === userId ? chat.candidate : chat.recruiter;

      const lastMsg = chat.messages?.[chat.messages.length - 1] || null;

      return {
        _id: chat._id,
        participantId: otherParticipant._id,
        participantName: otherParticipant.firstName + " " + otherParticipant.lastName,
        participantRole:
          chat.recruiter._id.toString() === otherParticipant._id.toString()
            ? "recruiter"
            : "candidate",
        lastMessage: lastMsg
          ? { content: lastMsg.content, createdAt: lastMsg.createdAt, senderId: lastMsg.sender }
          : { content: "No messages yet", createdAt: chat.updatedAt, senderId: null },
        unreadCount:
          chat.messages?.filter((m: { isRead: any; sender: { toString: () => string | undefined; }; }) => !m.isRead && m.sender.toString() !== userId).length || 0,
        isOnline: false,
      };
    });

    res.status(200).json(transformed);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a single chat by ID
 * @route GET /api/chats/:chatId
 * @access Private
 */
export const getChat = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate(
      "recruiter candidate messages.sender"
    );
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    res.status(200).json(chat);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Add a new message to a chat
 * @route POST /api/chats/:chatId/message
 * @access Private
 */
export const addMessage = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate("messages.sender");
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const message: IMessage = {
      sender: req.body.sender,
      content: req.body.content,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IMessage;

    chat.messages.push(message);
    await chat.save();

    // Fetch the last message again with populated sender
    const newMsg = chat.messages[chat.messages.length - 1];

    res.status(201).json(newMsg);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a chat by ID
 * @route DELETE /api/chats/:chatId
 * @access Private
 */
export const deleteChat = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    res.json({ message: "Chat deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Mark a single message as read
 * @route PATCH /api/chats/:chatId/messages/:messageId/read
 * @access Private
 */
export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const message = chat.messages.id(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.isRead = true;
    message.updatedAt = new Date();
    await chat.save();

    res.json({ message: "Message marked as read", updatedMessage: message });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Mark all messages as read for a specific user in a chat
 * @route PATCH /api/chats/:chatId/messages/read/:userId
 * @access Private
 */
export const markAllMessagesAsReadForUser = async (req: Request, res: Response) => {
  try {
    const { chatId, userId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.messages.forEach((msg: IMessage) => {
      if (!msg.isRead && msg.sender.toString() !== userId) {
        msg.isRead = true;
        msg.updatedAt = new Date();
      }
    });

    await chat.save();
    res.json({ message: "All messages marked as read", chatId });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a specific message from a chat
 * @route DELETE /api/chats/:chatId/messages/:messageId
 * @access Private
 */
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const message = chat.messages.id(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.remove();
    await chat.save();

    res.json({ message: "Message deleted successfully", messageId: req.params.messageId });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all messages for a chat
 * @route GET /api/chats/:chatId/messages
 * @access Private
 */
export const getMessagesForChat = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate("messages.sender");
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    res.json(chat.messages);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

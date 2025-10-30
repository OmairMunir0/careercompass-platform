import { Router } from "express";
import {
  addMessage,
  createChat,
  deleteChat,
  deleteMessage,
  getChat,
  getMessagesForChat,
  getMyChats,
  getOrCreateChat,
  markAllMessagesAsReadForUser,
  markMessageAsRead,
} from "../controllers/chatController";
import { authenticated } from "../middleware/auth";

const router = Router();
router.use(authenticated);

// @route   POST /api/chats
// @desc    Create a new chat between recruiter and candidate
// @access  Private
router.post("/", authenticated, createChat);

router.post("/get-or-create", authenticated, getOrCreateChat);

// @route   GET /api/chats/user/:userId
// @desc    Get all chats for a user
// @access  Private
router.get("/", authenticated, getMyChats);

// @route   GET /api/chats/:chatId
// @desc    Get a single chat by ID
// @access  Private
router.get("/:chatId", authenticated, getChat);

// @route   POST /api/chats/:chatId/message
// @desc    Add a new message to a chat
// @access  Private
router.post("/:chatId/message", authenticated, addMessage);

// @route   DELETE /api/chats/:chatId
// @desc    Delete a chat by ID
// @access  Private
router.delete("/:chatId", authenticated, deleteChat);

// @route   PATCH /api/chats/:chatId/messages/:messageId/read
// @desc    Mark a single message as read
// @access  Private
router.patch("/:chatId/messages/:messageId/read", authenticated, markMessageAsRead);

// @route   PATCH /api/chats/:chatId/messages/read/:userId
// @desc    Mark all messages as read for a specific user
// @access  Private
router.patch("/:chatId/messages/read/:userId", authenticated, markAllMessagesAsReadForUser);

// @route   DELETE /api/chats/:chatId/messages/:messageId
// @desc    Delete a specific message from a chat
// @access  Private
router.delete("/:chatId/messages/:messageId", authenticated, deleteMessage);

// @route   GET /api/chats/:chatId/messages
// @desc    Get all messages for a chat
// @access  Private
router.get("/:chatId/messages", authenticated, getMessagesForChat);

export default router;

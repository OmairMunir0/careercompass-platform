import React, { useState, useEffect } from "react";
import { Heart, MessageSquare, Share2, ThumbsUp, Trash } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

interface Reply {
  _id?: string;
  user: User;
  content: string;
  createdAt?: string;
}

interface Comment {
  _id?: string;
  user: User;
  content: string;
  replies?: Reply[];
  createdAt?: string;
}

interface TimelinePostProps {
  id: string;
  user: User;
  content: string;
  imageUrl?: string | null;
  likes: number;
  comments: Comment[];
  createdAt: string;
  isLiked: boolean;
  currentUser: User | null;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onReply: (postId: string, commentId: string, content: string) => void;
  onDelete: (postId: string) => void;
}

const TimelinePost: React.FC<TimelinePostProps> = ({
  id,
  user,
  content,
  imageUrl,
  likes,
  comments,
  createdAt,
  isLiked,
  currentUser,
  onLike,
  onComment,
  onReply,
  onDelete,
}) => {
  // Show comments by default if there are any
  const [showComments, setShowComments] = useState(comments.length > 0);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState<Record<string, boolean>>({});

  // Automatically show comments when they're added to a post that previously had none
  useEffect(() => {
    if (comments.length > 0 && !showComments) {
      setShowComments(true);
    }
  }, [comments.length, showComments]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && !isSubmittingComment) {
      setIsSubmittingComment(true);
      const commentContent = commentText;
      setCommentText("");
      try {
        await onComment(id, commentContent);
      } catch (error) {
        // Restore comment text on error
        setCommentText(commentContent);
      } finally {
        setIsSubmittingComment(false);
      }
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    const replyText = replyTexts[commentId] || "";
    if (replyText.trim() && !isSubmittingReply[commentId]) {
      setIsSubmittingReply((prev) => ({ ...prev, [commentId]: true }));
      const replyContent = replyText;
      setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
      setReplyingTo(null);
      
      // Optimistic update handled by parent component
      try {
        await onReply(id, commentId, replyContent);
      } catch (error) {
        // Restore reply text on error
        setReplyTexts((prev) => ({ ...prev, [commentId]: replyContent }));
      } finally {
        setIsSubmittingReply((prev) => ({ ...prev, [commentId]: false }));
      }
    }
  };

  const handleReplyClick = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    if (!replyTexts[commentId]) {
      setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
    }
  };

  const formattedDate = createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : "";
  const isCurrentUserPost = currentUser?._id === user._id;

  console.log(formattedDate);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 mb-6 overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center p-5">
        <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
          {user.profileImage ? (
            <Image 
              src={user.profileImage} 
              alt={`${user.firstName} ${user.lastName}`} 
              width={48} 
              height={48} 
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 text-white text-lg font-semibold">
              {user.firstName?.[0] || ""}{user.lastName?.[0] || ""}
            </div>
          )}
        </div>
        <div className="ml-3 flex-grow">
          <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
          <div className="text-xs text-gray-500">{formattedDate}</div>
        </div>
        {isCurrentUserPost && (
          <button 
            onClick={() => onDelete(id)}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash size={18} />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="px-5 pb-4">
        <p className="text-gray-800 whitespace-pre-wrap text-base leading-relaxed">{content}</p>
      </div>

      {/* Post Image */}
      {imageUrl && (
        <div className="w-full">
          <img 
            src={imageUrl} 
            alt="Post image" 
            className="w-full object-cover max-h-96"
          />
        </div>
      )}

      {/* Post Stats */}
      <div className="px-5 py-3 border-t border-gray-100 flex justify-between text-sm">
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 transition-colors font-medium"
        >
          <ThumbsUp size={16} className={isLiked ? "text-purple-600 fill-purple-600" : "text-gray-500"} />
          <span>{likes} {likes === 1 ? 'like' : 'likes'}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)} 
          className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 transition-colors font-medium"
        >
          <MessageSquare size={16} className="text-gray-500" />
          <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
        </button>
      </div>

      {/* Post Actions */}
      <div className="px-5 py-2.5 flex justify-around border-b border-gray-100 bg-gray-50/50">
        <button 
          onClick={() => onLike(id)} 
          className={`flex items-center justify-center py-2.5 px-6 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 ${isLiked ? 'text-purple-600 font-semibold' : 'text-gray-600 hover:text-purple-600'}`}
        >
          <ThumbsUp size={20} className={`mr-2 ${isLiked ? 'fill-purple-600 text-purple-600' : ''}`} />
          <span className="font-medium">Like</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center py-2.5 px-6 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 text-gray-600 hover:text-purple-600"
        >
          <MessageSquare size={20} className="mr-2" />
          <span className="font-medium">Comment</span>
        </button>
        <button className="flex items-center justify-center py-2.5 px-6 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 text-gray-600 hover:text-purple-600">
          <Share2 size={20} className="mr-2" />
          <span className="font-medium">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-5 py-4 bg-gray-50/50">
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
              {currentUser?.profileImage ? (
                <Image 
                  src={currentUser.profileImage} 
                  alt={`${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`} 
                  width={40} 
                  height={40} 
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-semibold">
                  {currentUser?.firstName?.[0] || ""}{currentUser?.lastName?.[0] || ""}
                </div>
              )}
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              disabled={isSubmittingComment}
              className="flex-grow px-4 py-2.5 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button 
              type="submit" 
              disabled={!commentText.trim() || isSubmittingComment}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-sm font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              {isSubmittingComment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Posting...</span>
                </>
              ) : (
                "Post"
              )}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={comment._id || index} className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
                  {comment.user?.profileImage ? (
                    <Image 
                      src={comment.user.profileImage} 
                      alt={`${comment.user?.firstName || ""} ${comment.user?.lastName || ""}`} 
                      width={40} 
                      height={40} 
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                      {comment.user?.firstName?.[0] || ""}{comment.user?.lastName?.[0] || ""}
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                    <div className="font-semibold text-sm text-gray-900 mb-1">{comment.user?.firstName || ""} {comment.user?.lastName || ""}</div>
                    <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-xs text-gray-500">
                      {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : "Just now"}
                    </div>
                    <button
                      onClick={() => handleReplyClick(comment._id || "")}
                      className="text-xs text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors flex items-center gap-1"
                    >
                      <MessageSquare size={14} />
                      Reply
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment._id && (
                    <form onSubmit={(e) => handleReplySubmit(e, comment._id || "")} className="mt-3 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
                        {currentUser?.profileImage ? (
                          <Image 
                            src={currentUser.profileImage} 
                            alt={`${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`} 
                            width={32} 
                            height={32} 
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xs font-semibold">
                            {currentUser?.firstName?.[0] || ""}{currentUser?.lastName?.[0] || ""}
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={replyTexts[comment._id || ""] || ""}
                        onChange={(e) => setReplyTexts((prev) => ({ ...prev, [comment._id || ""]: e.target.value }))}
                        placeholder="Write a reply..."
                        disabled={isSubmittingReply[comment._id || ""]}
                        className="flex-grow px-4 py-2 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        autoFocus
                      />
                      <button 
                        type="submit" 
                        disabled={!replyTexts[comment._id || ""]?.trim() || isSubmittingReply[comment._id || ""]}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-sm font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                      >
                        {isSubmittingReply[comment._id || ""] ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "Reply"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyTexts((prev) => ({ ...prev, [comment._id || ""]: "" }));
                        }}
                        className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        Cancel
                      </button>
                    </form>
                  )}

                  {/* Replies List */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 ml-6 space-y-3 border-l-4 border-purple-200 pl-4 bg-purple-50/30 rounded-r-lg py-2">
                      {comment.replies.map((reply, replyIndex) => (
                        <div key={reply._id || replyIndex} className="flex gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 ring-2 ring-purple-100">
                            {reply.user?.profileImage ? (
                              <Image 
                                src={reply.user.profileImage} 
                                alt={`${reply.user?.firstName || ""} ${reply.user?.lastName || ""}`} 
                                width={32} 
                                height={32} 
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-semibold">
                                {reply.user?.firstName?.[0] || ""}{reply.user?.lastName?.[0] || ""}
                              </div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-purple-100">
                              <div className="font-semibold text-xs text-gray-900 mb-0.5">{reply.user?.firstName || ""} {reply.user?.lastName || ""}</div>
                              <p className="text-xs text-gray-800 leading-relaxed">{reply.content}</p>
                            </div>
                            <div className="text-xs text-gray-500 mt-1.5 ml-1">
                              {reply.createdAt ? formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true }) : "Just now"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinePost;
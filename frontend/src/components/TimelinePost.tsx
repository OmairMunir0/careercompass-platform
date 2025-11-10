import React, { useState } from "react";
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

interface Comment {
  _id?: string;
  user: User;
  content: string;
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
  onDelete,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(id, commentText);
      setCommentText("");
    }
  };

  const formattedDate = createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : "";
  const isCurrentUserPost = currentUser?._id === user._id;

  console.log(formattedDate);

  return (
    <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center p-4">
        <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {user.profileImage ? (
            <Image 
              src={user.profileImage} 
              alt={`${user.firstName} ${user.lastName}`} 
              width={48} 
              height={48} 
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white text-lg font-semibold">
              {user.firstName[0]}{user.lastName[0]}
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
      <div className="px-4 pb-3">
        <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
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
      <div className="px-4 py-2 border-t border-b border-gray-100 flex justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <ThumbsUp size={14} className="text-blue-500 mr-1" />
          <span>{likes} likes</span>
        </div>
        <div>
          <button onClick={() => setShowComments(!showComments)} className="hover:underline">
            {comments.length} comments
          </button>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-2 flex justify-around border-b border-gray-100">
        <button 
          onClick={() => onLike(id)} 
          className={`flex items-center justify-center py-2 px-4 rounded-md hover:bg-gray-100 transition-colors ${isLiked ? 'text-blue-500 font-medium' : 'text-gray-500'}`}
        >
          <ThumbsUp size={18} className={`mr-2 ${isLiked ? 'fill-blue-500' : ''}`} />
          Like
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center py-2 px-4 rounded-md hover:bg-gray-100 transition-colors text-gray-500"
        >
          <MessageSquare size={18} className="mr-2" />
          Comment
        </button>
        <button className="flex items-center justify-center py-2 px-4 rounded-md hover:bg-gray-100 transition-colors text-gray-500">
          <Share2 size={18} className="mr-2" />
          Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-3 bg-gray-50">
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="flex mb-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {currentUser?.profileImage ? (
                <Image 
                  src={currentUser.profileImage} 
                  alt={`${currentUser.firstName} ${currentUser.lastName}`} 
                  width={32} 
                  height={32} 
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white text-sm font-semibold">
                  {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                </div>
              )}
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="ml-2 flex-grow px-3 py-1 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button 
              type="submit" 
              disabled={!commentText.trim()}
              className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-full text-sm disabled:opacity-50"
            >
              Post
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment, index) => (
              <div key={comment._id || index} className="flex">
                <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {comment.user.profileImage ? (
                    <Image 
                      src={comment.user.profileImage} 
                      alt={`${comment.user.firstName} ${comment.user.lastName}`} 
                      width={32} 
                      height={32} 
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white text-sm font-semibold">
                      {comment.user.firstName?.[0]}{comment.user.lastName?.[0]}
                    </div>
                  )}
                </div>
                <div className="ml-2 flex-grow">
                  <div className="bg-white rounded-lg px-3 py-2">
                    <div className="font-semibold text-sm">{comment.user.firstName} {comment.user.lastName}</div>
                    <p className="text-sm text-gray-800">{comment.content}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-2">
                    {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : "Just now"}
                  </div>
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
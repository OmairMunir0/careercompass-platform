import React, { useState, useRef } from "react";
import { Image, FileText, Video, Calendar, X } from "lucide-react";
import PrimaryButton from "./ui/PrimaryButton";
import DocumentGenerator from "./DocumentGenerator";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

interface PostComposerProps {
  user: User | null;
  onSubmit: (content: string, imageFile: File | null) => Promise<void>;
  isSubmitting: boolean;
  characterLimit: number;
  isPremiumPlan: boolean;
  onUpgradeClick?: () => void;
  isUpgrading?: boolean;
  priceLabel?: string;
}

const PostComposer: React.FC<PostComposerProps> = ({
  user,
  onSubmit,
  isSubmitting,
  characterLimit,
  isPremiumPlan,
  onUpgradeClick,
  isUpgrading = false,
  priceLabel = "$3.99/mo",
}) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDocumentGenerator, setShowDocumentGenerator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingCharacters = characterLimit - content.length;
  const isNearLimit = remainingCharacters <= Math.min(100, characterLimit * 0.1);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return;
    if (content.trim().length > characterLimit) return;
    await onSubmit(content, imageFile);
    setContent("");
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 p-4">
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {user?.profileImage ? (
            <img 
              src={user.profileImage} 
              alt={`${user.firstName} ${user.lastName}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white text-lg font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
        </div>
        <button 
          onClick={() => document.getElementById("post-content")?.focus()}
          className="ml-3 flex-grow px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-left text-gray-500"
        >
          Start a post
        </button>
      </div>

      <div className="mb-4">
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What do you want to talk about?"
          maxLength={characterLimit}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-none"
        />
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
          <p
            className={`${
              remainingCharacters < 0
                ? "text-red-500"
                : isNearLimit
                ? "text-orange-500"
                : "text-gray-500"
            }`}
          >
            {content.length}/{characterLimit} characters ({isPremiumPlan ? "Premium" : "Free"} plan)
          </p>
          {!isPremiumPlan && onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              disabled={isUpgrading}
              className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-60"
            >
              {isUpgrading ? "Redirecting..." : `Upgrade for ${priceLabel}`}
            </button>
          )}
        </div>
      </div>

      {imagePreview && (
        <div className="relative mb-4">
          <button 
            onClick={removeImage}
            className="absolute top-2 right-2 bg-gray-800 bg-opacity-60 rounded-full p-1 text-white hover:bg-opacity-80"
          >
            <X size={16} />
          </button>
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="w-full max-h-60 object-contain rounded-md"
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
            id="image-upload"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center text-gray-600 hover:bg-gray-100 p-2 rounded-md"
          >
            <Image size={20} className="text-blue-500 mr-1" />
            <span className="text-sm">Photo</span>
          </button>
          <button className="flex items-center text-gray-600 hover:bg-gray-100 p-2 rounded-md">
            <Video size={20} className="text-green-500 mr-1" />
            <span className="text-sm">Video</span>
          </button>
          <button 
            onClick={() => setShowDocumentGenerator(true)}
            className="flex items-center text-gray-600 hover:bg-gray-100 p-2 rounded-md transition-colors"
          >
            <FileText size={20} className="text-orange-500 mr-1" />
            <span className="text-sm">Document</span>
          </button>
          <button className="flex items-center text-gray-600 hover:bg-gray-100 p-2 rounded-md">
            <Calendar size={20} className="text-purple-500 mr-1" />
            <span className="text-sm">Event</span>
          </button>
        </div>
        <PrimaryButton
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && !imageFile)}
          className="px-4 py-2"
        >
          {isSubmitting ? "Posting..." : "Post"}
        </PrimaryButton>
      </div>

      {/* Document Generator Modal */}
      <DocumentGenerator
        isOpen={showDocumentGenerator}
        onClose={() => setShowDocumentGenerator(false)}
      />
    </div>
  );
};

export default PostComposer;
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
}

const PostComposer: React.FC<PostComposerProps> = ({ user, onSubmit, isSubmitting }) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDocumentGenerator, setShowDocumentGenerator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    await onSubmit(content, imageFile);
    setContent("");
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.location.reload();
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
          {user?.imageUrl ? (
            <img
              src={"http://localhost:3001" + user.imageUrl}
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-none"
        />
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

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex flex-wrap gap-2 sm:gap-4">
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
            className="flex items-center text-gray-600 hover:bg-gray-100 p-2 rounded-md transition-colors"
            title="Add Photo"
          >
            <Image size={20} className="text-blue-500" />
            <span className="text-sm ml-1 hidden sm:inline">Photo</span>
          </button>
          <button
            className="flex items-center text-gray-600 hover:bg-gray-100 p-2 rounded-md transition-colors"
            title="Add Video"
          >
            <Video size={20} className="text-green-500" />
            <span className="text-sm ml-1 hidden sm:inline">Video</span>
          </button>
          <button
            onClick={() => setShowDocumentGenerator(true)}
            className="flex items-center text-gray-600 hover:bg-gray-100 p-2 rounded-md transition-colors"
            title="Add Document"
          >
            <FileText size={20} className="text-orange-500" />
            <span className="text-sm ml-1 hidden sm:inline">Document</span>
          </button>
          <button
            className="flex items-center text-gray-600 hover:bg-gray-100 p-2 rounded-md transition-colors"
            title="Add Event"
          >
            <Calendar size={20} className="text-purple-500" />
            <span className="text-sm ml-1 hidden sm:inline">Event</span>
          </button>
        </div>
        <PrimaryButton
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && !imageFile)}
          className="px-4 py-2 w-full sm:w-auto"
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
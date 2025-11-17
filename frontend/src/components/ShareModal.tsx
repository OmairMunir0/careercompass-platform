'use client';

import React, { useState } from 'react';
import { X, Facebook, Twitter, Linkedin, MessageCircle, Link2, Share2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postContent: string;
  authorName: string;
  postImageUrl?: string | null;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  postId,
  postContent,
  authorName,
  postImageUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate the post URL
  const getPostUrl = () => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/timeline#post-${postId}`;
  };

  const postUrl = getPostUrl();
  const shareText = `${authorName} shared: ${postContent.substring(0, 100)}${postContent.length > 100 ? '...' : ''}`;

  // Share functions
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    onClose();
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    onClose();
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    onClose();
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${postUrl}`)}`;
    window.open(url, '_blank');
    onClose();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const useNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${authorName}`,
          text: shareText,
          url: postUrl,
        });
        onClose();
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback to copy if native share not available
      copyToClipboard();
    }
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      onClick: shareToFacebook,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-sky-500',
      bgColor: 'bg-sky-50 hover:bg-sky-100',
      onClick: shareToTwitter,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      onClick: shareToLinkedIn,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      onClick: shareToWhatsApp,
    },
    {
      name: 'Copy Link',
      icon: copied ? Check : Link2,
      color: copied ? 'text-green-600' : 'text-purple-600',
      bgColor: copied ? 'bg-green-50 hover:bg-green-100' : 'bg-purple-50 hover:bg-purple-100',
      onClick: copyToClipboard,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Share Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Post Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Post by {authorName}</div>
            <p className="text-sm text-gray-800 line-clamp-2">{postContent}</p>
            {postImageUrl && (
              <div className="mt-2 text-xs text-gray-500">📷 Image attached</div>
            )}
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.name}
                  onClick={option.onClick}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg transition-all ${option.bgColor} ${option.color} font-medium`}
                >
                  <Icon size={20} />
                  <span>{option.name}</span>
                </button>
              );
            })}
          </div>

          {/* Native Share (if available) */}
          {navigator.share && (
            <button
              onClick={useNativeShare}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all font-medium"
            >
              <Share2 size={20} />
              <span>Share via...</span>
            </button>
          )}

          {/* URL Display */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Post URL</div>
            <div className="text-xs text-gray-700 break-all font-mono">{postUrl}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;


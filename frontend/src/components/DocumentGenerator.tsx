'use client';

import React, { useState } from 'react';
import { X, FileText, Award, User, FileEdit } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useInterviewStore } from '@/store/interviewStore';
import { generateInterviewCertificate, generateResumePDF, generateCustomDocument } from '@/lib/pdfGenerator';
import toast from 'react-hot-toast';

interface DocumentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

type DocumentType = 'certificate' | 'resume' | 'custom';

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { analysis } = useInterviewStore();
  const [documentType, setDocumentType] = useState<DocumentType>('certificate');
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!user) {
      toast.error('Please log in to generate documents');
      return;
    }

    try {
      switch (documentType) {
        case 'certificate':
          const latestAnalysis = analysis.length > 0 ? analysis[analysis.length - 1] : null;
          if (!latestAnalysis) {
            toast.error('No interview analysis found. Please complete an interview first.');
            return;
          }
          generateInterviewCertificate(user, latestAnalysis);
          toast.success('Interview certificate generated successfully!');
          break;

        case 'resume':
          // You can extend this to fetch actual user data from API
          generateResumePDF(user, {
            skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
            experience: ['Software Developer at Company X', 'Intern at Company Y'],
            education: ['BS Computer Science'],
          });
          toast.success('Resume PDF generated successfully!');
          break;

        case 'custom':
          if (!customTitle.trim() || !customContent.trim()) {
            toast.error('Please fill in both title and content');
            return;
          }
          generateCustomDocument(customTitle, customContent, user);
          toast.success('Custom document generated successfully!');
          break;
      }
      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Generate Document</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Document Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Document Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setDocumentType('certificate')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  documentType === 'certificate'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Award
                  size={32}
                  className={`mx-auto mb-2 ${
                    documentType === 'certificate' ? 'text-purple-600' : 'text-gray-400'
                  }`}
                />
                <div className="text-sm font-medium text-gray-900">Interview Certificate</div>
                <div className="text-xs text-gray-500 mt-1">Based on your latest interview</div>
              </button>

              <button
                onClick={() => setDocumentType('resume')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  documentType === 'resume'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User
                  size={32}
                  className={`mx-auto mb-2 ${
                    documentType === 'resume' ? 'text-purple-600' : 'text-gray-400'
                  }`}
                />
                <div className="text-sm font-medium text-gray-900">Resume PDF</div>
                <div className="text-xs text-gray-500 mt-1">Your profile summary</div>
              </button>

              <button
                onClick={() => setDocumentType('custom')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  documentType === 'custom'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileEdit
                  size={32}
                  className={`mx-auto mb-2 ${
                    documentType === 'custom' ? 'text-purple-600' : 'text-gray-400'
                  }`}
                />
                <div className="text-sm font-medium text-gray-900">Custom Document</div>
                <div className="text-xs text-gray-500 mt-1">Create your own</div>
              </button>
            </div>
          </div>

          {/* Custom Document Form */}
          {documentType === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter document title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Content
                </label>
                <textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="Enter document content..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Info Messages */}
          {documentType === 'certificate' && analysis.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ No interview analysis found. Please complete an interview practice session first.
              </p>
            </div>
          )}

          {documentType === 'certificate' && analysis.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✓ Certificate will include your latest interview performance score and emotion analysis.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={documentType === 'certificate' && analysis.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
          >
            <FileText size={18} />
            Generate & Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentGenerator;


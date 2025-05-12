'use client';

import React, { useState } from 'react';
import { FaCopy, FaShareAlt, FaTimes, FaUserMd } from 'react-icons/fa';

import { ScreeningResult } from '@/lib/mockData';

interface ProviderRecommendModalProps {
  result: ScreeningResult;
  isOpen: boolean;
  onClose: () => void;
}

const ProviderRecommendModal: React.FC<ProviderRecommendModalProps> = ({
  result,
  isOpen,
  onClose,
}) => {
  const [copyStatus, setCopyStatus] = useState<string>('');

  if (!isOpen || !result.providerDetails) {
    return null;
  }

  const provider = result.providerDetails;

  const recommendationText = `I recommend ${provider.name}${provider.specialty ? ` for ${provider.specialty}` : ''}. They're at ${provider.clinic || 'a great clinic'} (${provider.address || ''}). You can contact them at ${provider.phone || ''} or ${provider.email || ''}. Check out their website: ${provider.website || ''}.`;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(recommendationText)
      .then(() => {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus(''), 2000);
      })
      .catch(() => {
        setCopyStatus('Failed to copy');
        setTimeout(() => setCopyStatus(''), 2000);
      });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${provider.name} Recommendation`,
          text: recommendationText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaUserMd className="mr-2 text-blue-600" />
            Provider Details
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
            <FaTimes />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-5">
            <h4 className="font-semibold text-lg text-gray-800 mb-1">{provider.name}</h4>
            {provider.specialty && <p className="text-gray-600">{provider.specialty}</p>}
            {provider.clinic && <p className="text-gray-600 mt-2">{provider.clinic}</p>}
            {provider.address && <p className="text-gray-600 text-sm">{provider.address}</p>}
          </div>

          <div className="mb-5">
            <h4 className="font-semibold text-gray-800 mb-2">Contact Information</h4>
            {provider.phone && (
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Phone:</span> {provider.phone}
              </p>
            )}
            {provider.email && (
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Email:</span> {provider.email}
              </p>
            )}
            {provider.website && (
              <p className="text-gray-600">
                <span className="font-medium">Website:</span>{' '}
                <a
                  href={`https://${provider.website.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {provider.website}
                </a>
              </p>
            )}
          </div>

          <div className="mb-5">
            <h4 className="font-semibold text-gray-800 mb-2">Recommendation Message</h4>
            <div className="bg-gray-50 p-3 rounded-lg text-gray-700 text-sm mb-3">
              {recommendationText}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCopy}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition"
            >
              <FaCopy className="mr-2" />
              {copyStatus || 'Copy to Clipboard'}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition"
            >
              <FaShareAlt className="mr-2" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderRecommendModal;

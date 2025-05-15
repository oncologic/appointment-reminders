'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShareAlt,
  FaUserMd,
} from 'react-icons/fa';

import ProviderRecommendModal from '@/app/components/ProviderRecommendModal';
import { ScreeningRecommendation, ScreeningResult } from '@/lib/mockData';

interface ScreeningDetailsClientProps {
  screening: ScreeningRecommendation;
  previousResults: ScreeningResult[];
}

const ScreeningDetailsClient: React.FC<ScreeningDetailsClientProps> = ({
  screening,
  previousResults,
}) => {
  const [selectedResult, setSelectedResult] = useState<ScreeningResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Helper to render the result icon based on test result
  const getResultIcon = (result: string) => {
    switch (result) {
      case 'clear':
        return <FaCheckCircle className="text-green-500" />;
      case 'abnormal':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaCalendarAlt className="text-gray-600" />;
    }
  };

  const openRecommendModal = (result: ScreeningResult) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Previous results</h2>

        <div className="border rounded-lg">
          {previousResults.map((result, idx) => (
            <div key={idx} className={`p-4 ${idx < previousResults.length - 1 ? 'border-b' : ''}`}>
              <div className="flex items-start">
                <div className="mr-4 mt-1">{getResultIcon(result.result)}</div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{result.date}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaUserMd className="mr-1" />{' '}
                        {typeof result.provider === 'object'
                          ? result.provider.name
                          : result.provider}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`text-sm font-medium px-3 py-1 rounded-full mr-3 ${
                          result.result === 'clear'
                            ? 'bg-green-100 text-green-800'
                            : result.result === 'abnormal'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {result.result === 'clear'
                          ? 'Clear'
                          : result.result === 'abnormal'
                            ? 'Abnormal Finding'
                            : 'Pending'}
                      </span>

                      {result.providerDetails && (
                        <button
                          onClick={() => openRecommendModal(result)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded transition flex items-center"
                          aria-label="Recommend provider"
                          title="Recommend provider"
                        >
                          <FaShareAlt />
                        </button>
                      )}
                    </div>
                  </div>
                  {result.notes && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg text-gray-700 text-sm">
                      {result.notes}
                    </div>
                  )}

                  {result.providerDetails && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => openRecommendModal(result)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <FaShareAlt className="mr-1" /> Recommend provider
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <Link
            href={screening.schedulePath}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaCalendarAlt className="mr-2" />
            Schedule next screening
          </Link>
        </div>
      </div>

      {selectedResult && (
        <ProviderRecommendModal result={selectedResult} isOpen={isModalOpen} onClose={closeModal} />
      )}
    </>
  );
};

export default ScreeningDetailsClient;

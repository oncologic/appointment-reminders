import Link from 'next/link';
import React from 'react';
import { FaChevronRight, FaUsers } from 'react-icons/fa';
import * as Icons from 'react-icons/fa';

import { ScreeningRecommendation } from '@/lib/mockData';

interface ScreeningCardProps {
  screening: ScreeningRecommendation;
}

const ScreeningCard: React.FC<ScreeningCardProps> = ({ screening }) => {
  // Get the icon component dynamically
  const IconComponent = Icons[screening.icon as keyof typeof Icons];

  // Status color styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'text-red-600';
      case 'due':
        return 'text-orange-600';
      case 'completed':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // Determine the link path based on status
  const linkPath =
    screening.status === 'completed' && screening.detailsPath
      ? screening.detailsPath
      : screening.schedulePath;

  return (
    <div className="px-5 py-3 hover:bg-gray-50 transition">
      <Link href={linkPath} className="flex items-center">
        <div
          className={`w-10 h-10 rounded-full ${screening.bgColor} flex items-center justify-center mr-4`}
        >
          {IconComponent && <IconComponent className={screening.iconColor} />}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">
                {screening.title}
                {screening.friendRecommendations.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5 inline-flex items-center">
                    <FaUsers className="mr-1" size={10} />
                    {screening.friendRecommendations.length}
                  </span>
                )}
              </p>
              <p className="text-gray-500 text-xs">{screening.description}</p>
            </div>
            <div className={`font-medium text-sm ${getStatusStyle(screening.status)}`}>
              {screening.statusText}
            </div>
          </div>
        </div>
        <FaChevronRight className="text-gray-400 ml-3" />
      </Link>
      {screening.friendRecommendations.length > 0 && (
        <div className="mt-2 pl-14 flex space-x-4">
          <Link href="/friend-recommendations" className="text-xs text-blue-600 flex items-center">
            <FaUsers className="mr-1" /> Get recommendations
          </Link>
        </div>
      )}
    </div>
  );
};

export default ScreeningCard;

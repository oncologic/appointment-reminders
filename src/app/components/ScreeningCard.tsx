import Link from 'next/link';
import React from 'react';
import { FaCalendarAlt, FaChevronRight, FaClock, FaUsers } from 'react-icons/fa';
import * as Icons from 'react-icons/fa';

import { ScreeningRecommendation as DBScreeningRecommendation } from '@/app/components/types';

// Unified interface that works with both original and mapped screenings
interface ScreeningCardProps {
  screening: {
    id: string;
    name?: string;
    title?: string;
    description?: string;
    status: 'due' | 'overdue' | 'completed' | 'upcoming';
    statusText?: string;
    frequencyMonths?: number;
    icon?: string;
    iconColor?: string;
    bgColor?: string;
    schedulePath?: string;
    detailsPath?: string;
    friendRecommendations?: Array<unknown>;
    // Date related fields
    dueDate?: string;
    dueDateFormatted?: string;
    durationText?: string;
    // Optional fields from DBScreeningRecommendation
    ageRange?: any[];
    ageRangeDetails?: any[];
  };
}

const ScreeningCard: React.FC<ScreeningCardProps> = ({ screening }) => {
  // Determine the best icon based on screening name/title when one isn't provided
  const getDefaultIcon = () => {
    const nameOrTitle = (screening.title || screening.name || '').toLowerCase();

    if (nameOrTitle.includes('blood') || nameOrTitle.includes('cholesterol')) {
      return 'FaTint';
    } else if (nameOrTitle.includes('mammogram') || nameOrTitle.includes('breast')) {
      return 'FaHeartbeat';
    } else if (nameOrTitle.includes('colon') || nameOrTitle.includes('colonoscopy')) {
      return 'FaStethoscope';
    } else if (nameOrTitle.includes('eye') || nameOrTitle.includes('vision')) {
      return 'FaEye';
    } else if (nameOrTitle.includes('dental') || nameOrTitle.includes('teeth')) {
      return 'FaTooth';
    } else if (nameOrTitle.includes('skin') || nameOrTitle.includes('dermatology')) {
      return 'FaAllergies';
    } else if (nameOrTitle.includes('physical') || nameOrTitle.includes('exam')) {
      return 'FaUserMd';
    } else if (
      nameOrTitle.includes('vaccine') ||
      nameOrTitle.includes('shot') ||
      nameOrTitle.includes('immunization')
    ) {
      return 'FaSyringe';
    } else if (nameOrTitle.includes('heart') || nameOrTitle.includes('cardiac')) {
      return 'FaHeartbeat';
    } else if (nameOrTitle.includes('lung') || nameOrTitle.includes('pulmonary')) {
      return 'FaLungs';
    } else if (nameOrTitle.includes('bone') || nameOrTitle.includes('density')) {
      return 'FaBone';
    } else {
      // Default for any other screening
      return 'FaClipboardCheck';
    }
  };

  // Get the icon component dynamically, use default if not provided
  const iconName = screening.icon || getDefaultIcon();
  const IconComponent = iconName ? Icons[iconName as keyof typeof Icons] : null;

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

  // Format frequency for display
  const getFrequencyText = () => {
    if (!screening.frequencyMonths) return null;

    const months = screening.frequencyMonths;

    if (months === 1) return 'Monthly';
    if (months === 3) return 'Quarterly';
    if (months === 6) return 'Bi-annually';
    if (months === 12) return 'Annually';
    if (months === 24) return 'Every 2 years';
    if (months === 36) return 'Every 3 years';
    if (months === 60) return 'Every 5 years';

    return `Every ${months} months`;
  };

  // Determine the link path based on status
  const linkPath =
    screening.status === 'completed' && screening.detailsPath
      ? screening.detailsPath
      : screening.schedulePath;

  // Use title or name for display
  const displayTitle = screening.title || screening.name;

  // Safely check if we have friend recommendations
  const friendRecommendations = screening.friendRecommendations || [];
  const hasFriendRecommendations = friendRecommendations.length > 0;

  return (
    <div className="px-5 py-3 hover:bg-gray-50 transition">
      <Link href={linkPath || '#'} className="flex items-center">
        <div
          className={`w-10 h-10 rounded-full ${screening.bgColor || 'bg-blue-100'} flex items-center justify-center mr-4`}
        >
          {IconComponent && <IconComponent className={screening.iconColor || 'text-blue-500'} />}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">
                {displayTitle}
                {hasFriendRecommendations && (
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5 inline-flex items-center">
                    <FaUsers className="mr-1" size={10} />
                    {friendRecommendations.length}
                  </span>
                )}
                {screening.frequencyMonths && (
                  <span className="ml-2 bg-indigo-50 text-indigo-700 text-xs rounded-full px-2 py-0.5 inline-flex items-center">
                    <FaClock className="mr-1" size={10} />
                    {getFrequencyText()}
                  </span>
                )}
              </p>
              <p className="text-gray-500 text-xs">{screening.description}</p>
              {screening.dueDateFormatted && (
                <p className="text-gray-500 text-xs mt-1 flex items-center">
                  <FaCalendarAlt className="mr-1" size={10} />
                  Due: {screening.dueDateFormatted}
                  {screening.durationText && (
                    <span className="text-gray-400 ml-1">{screening.durationText}</span>
                  )}
                </p>
              )}
            </div>
            <div className={`font-medium text-sm ${getStatusStyle(screening.status)}`}>
              {screening.statusText || screening.status}
            </div>
          </div>
        </div>
        <FaChevronRight className="text-gray-400 ml-3" />
      </Link>
      {hasFriendRecommendations && (
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

import Link from 'next/link';
import React from 'react';
import {
  FaCalendarPlus,
  FaExclamationTriangle,
  FaFileAlt,
  FaInfoCircle,
  FaTools,
  FaTrash,
} from 'react-icons/fa';

import { UserProfile } from './PersonalizedGuidelines';
import StatusBadge from './StatusBadge';
import { ScreeningRecommendation } from './types';

interface ScreeningItemProps {
  screening: ScreeningRecommendation;
  onRemove: (id: string) => void;
  userProfile: UserProfile;
}

// Calculate age based on date of birth
const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // Adjust age if birthday hasn't occurred yet this year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

const ScreeningItem: React.FC<ScreeningItemProps> = ({ screening, onRemove, userProfile }) => {
  // Get current age range recommendation based on user's calculated age
  const getCurrentAgeRecommendation = () => {
    if (screening.ageRangeDetails.length === 0) return null;

    // Calculate user's age from DOB if available, otherwise use the age field
    const userAge = userProfile.dateOfBirth
      ? calculateAge(userProfile.dateOfBirth)
      : userProfile.age;

    // Find the age range that applies to the user's current age
    const currentRange = screening.ageRangeDetails.find(
      (range) => userAge >= range.min && (range.max === null || userAge <= range.max)
    );

    if (!currentRange) return null;

    return {
      label: currentRange.label,
      frequency: currentRange.frequency || screening.frequency,
      notes: currentRange.notes,
    };
  };

  const currentRecommendation = getCurrentAgeRecommendation();

  // Mock data for resources and risk tools - in a real app, these would come from props or a service
  const hasRiskTools = screening.id.includes('cancer') || screening.id.includes('heart');
  const hasResources = screening.description.length > 50; // Just a mock condition

  return (
    <div
      className={`p-6 hover:bg-gray-50 ${
        screening.notes?.includes('Will become relevant in') ? 'opacity-60' : ''
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">{screening.name}</h3>
            <div className="ml-3">
              <StatusBadge status={screening.status} />
            </div>
            {/* Show icons for available features with links */}
            <div className="ml-auto flex gap-1">
              {hasRiskTools && (
                <Link href={`/guidelines/${screening.id}`}>
                  <span
                    className="text-gray-500 hover:text-blue-600 tooltip cursor-pointer"
                    title="Risk Assessment Tools Available"
                  >
                    <FaTools className="text-sm" />
                  </span>
                </Link>
              )}
              {hasResources && (
                <Link href={`/guidelines/${screening.id}`}>
                  <span
                    className="text-gray-500 hover:text-blue-600 tooltip cursor-pointer"
                    title="Resources Available"
                  >
                    <FaFileAlt className="text-sm" />
                  </span>
                </Link>
              )}
            </div>
          </div>
          <p className="text-gray-600 mb-3">{screening.description}</p>

          {/* Current recommendation highlighted */}
          {currentRecommendation && (
            <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-md mr-2">
              <p className="font-medium text-blue-800">Your Current Recommendation:</p>
              <p className="text-gray-700">
                For ages {currentRecommendation.label}: {currentRecommendation.frequency}
              </p>
              {currentRecommendation.notes && (
                <p className="text-sm text-gray-600 mt-1 italic">{currentRecommendation.notes}</p>
              )}
            </div>
          )}

          <div className="text-sm text-gray-500 space-y-1">
            {screening.lastCompleted && <p>Last completed: {screening.lastCompleted}</p>}
            <p>Next due: {screening.dueDate}</p>

            {screening.status === 'overdue' && (
              <p className="flex items-center text-red-600">
                <FaExclamationTriangle className="mr-1" />
                This screening is overdue
              </p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col gap-2">
          <Link
            href={`/appointments/new?screening=${encodeURIComponent(screening.name)}`}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm 
            ${
              screening.notes?.includes('Will become relevant in')
                ? 'text-gray-500 bg-gray-200 hover:bg-gray-300 cursor-not-allowed'
                : 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            <FaCalendarPlus className="mr-2" />{' '}
            {screening.notes?.includes('Will become relevant in')
              ? 'Not Available Yet'
              : 'Schedule'}
          </Link>

          {/* View Details button */}
          <Link
            href={`/guidelines/${screening.id}`}
            className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
          >
            <FaInfoCircle className="mr-2 text-blue-500" /> View Details
          </Link>

          {/* Remove from recommended button */}
          <button
            onClick={() => onRemove(screening.id)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaTrash className="mr-2 text-red-500" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreeningItem;

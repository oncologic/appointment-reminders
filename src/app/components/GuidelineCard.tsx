import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FaChartLine, FaClipboardList, FaEdit } from 'react-icons/fa';

import { getToolsAndResourcesForGuideline } from '../../lib/mockData';
import GuidelineService from '../../lib/services/guidelineService';
import { GuidelineItem, UserProfile } from './PersonalizedGuidelines';

interface GuidelineCardProps {
  guideline: GuidelineItem;
  userProfile: UserProfile | null;
  onAddToRecommended: (id: string) => void;
}

const GuidelineCard: React.FC<GuidelineCardProps> = ({
  guideline,
  userProfile,
  onAddToRecommended,
}) => {
  const router = useRouter();

  const isGuidelineRelevantForUser = (guideline: GuidelineItem, profile: UserProfile) => {
    const genderRelevant =
      guideline.genders.includes('all') ||
      guideline.genders.includes(profile.gender as 'male' | 'female');

    if (!genderRelevant) return false;

    for (const range of guideline.ageRanges) {
      if (profile.age >= range.min && (range.max === null || profile.age <= range.max)) {
        return true;
      }
    }

    return false;
  };

  const getCurrentRecommendation = () => {
    if (!userProfile) return null;

    return guideline.ageRanges.find(
      (range) =>
        userProfile.age >= range.min && (range.max === null || userProfile.age <= range.max)
    );
  };

  const currentRange = getCurrentRecommendation();
  const isRelevant = userProfile && isGuidelineRelevantForUser(guideline, userProfile);
  const { tools, resources } = getToolsAndResourcesForGuideline(guideline.id);
  const hasResourcesOrRiskTools = tools.length > 0 || resources.length > 0;

  const handlePersonalize = () => {
    if (!userProfile) return;

    try {
      const personalizedGuideline = GuidelineService.createPersonalizedGuideline(
        guideline.id,
        userProfile.userId
      );
      router.push(`/guidelines/edit/${personalizedGuideline.id}`);
    } catch (error) {
      console.error('Error creating personalized guideline:', error);
      alert('There was an error creating your personalized guideline.');
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
      {/* Header with title and tags */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-800">
            <Link href={`/guidelines/${guideline.id}`} className="hover:text-blue-600">
              {guideline.name}
            </Link>
          </h3>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
              {guideline.category}
            </span>
            {guideline.createdBy === 'system' && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                System
              </span>
            )}
            {isRelevant && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                Relevant
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-1">{guideline.description}</p>
      </div>

      {/* Current Recommendation */}
      {isRelevant && currentRange && (
        <div className="border-l-4 border-blue-500 bg-blue-50 p-2 mx-3 my-2 text-sm">
          <span className="font-medium text-blue-800">Ages {currentRange.label}:</span>{' '}
          <span className="text-gray-800">{currentRange.frequency}</span>
          {currentRange.notes && (
            <p className="text-xs text-gray-600 italic mt-0.5">{currentRange.notes}</p>
          )}
        </div>
      )}

      {/* Age & Gender Information */}
      <div className="px-3 pt-2 pb-1 flex items-start justify-between">
        <div className="flex-1">
          <h5 className="text-xs font-medium text-gray-500 mb-1">Age Ranges:</h5>
          <ul className="space-y-0.5">
            {guideline.ageRanges.map((range, idx) => {
              const isCurrentRange =
                userProfile &&
                userProfile.age >= range.min &&
                (range.max === null || userProfile.age <= range.max);

              return (
                <li
                  key={idx}
                  className={`text-xs ${
                    isCurrentRange ? 'font-medium text-blue-800' : 'text-gray-600'
                  }`}
                >
                  <span className="inline-block w-12 font-medium">{range.label}:</span>
                  {range.frequency
                    ? range.frequency.split(' ').slice(0, 4).join(' ')
                    : guideline.frequency}
                  {isCurrentRange && <span className="ml-1 text-[10px] text-blue-600">←</span>}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-medium text-gray-500 mb-1">Applies to:</h5>
          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
            {guideline.genders.includes('all')
              ? 'All'
              : guideline.genders.map((g) => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}
          </span>
        </div>
      </div>

      {/* Footer with Action Buttons */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-t border-gray-200">
        <Link
          href={`/guidelines/${guideline.id}`}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center font-medium"
        >
          <FaChartLine className="mr-1" />
          {hasResourcesOrRiskTools ? 'View Resources' : 'Details'}
        </Link>

        <div className="flex gap-1">
          <button
            onClick={handlePersonalize}
            className="text-xs flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            <FaEdit className="mr-1" />
            Personalize
          </button>
          <button
            onClick={() => onAddToRecommended(guideline.id)}
            className="text-xs flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            <FaClipboardList className="mr-1" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidelineCard;

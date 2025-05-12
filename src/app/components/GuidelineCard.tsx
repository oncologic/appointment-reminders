import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FaChartLine, FaClipboardList, FaEdit } from 'react-icons/fa';

import { getToolsAndResourcesForGuideline } from '../../lib/mockData';
import GuidelineService from '../../lib/services/guidelineService';
import { RiskAssessmentTool } from './GuidelineDetail';
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
    // Check gender relevance
    const genderRelevant =
      guideline.genders.includes('all') ||
      guideline.genders.includes(profile.gender as 'male' | 'female');

    if (!genderRelevant) return false;

    // Check age relevance
    for (const range of guideline.ageRanges) {
      if (profile.age >= range.min && (range.max === null || profile.age <= range.max)) {
        return true;
      }
    }

    return false;
  };

  // Get the current recommendation for the user
  const getCurrentRecommendation = () => {
    if (!userProfile) return null;

    const currentRange = guideline.ageRanges.find(
      (range) =>
        userProfile.age >= range.min && (range.max === null || userProfile.age <= range.max)
    );

    return currentRange;
  };

  const currentRange = getCurrentRecommendation();
  const isRelevant = userProfile && isGuidelineRelevantForUser(guideline, userProfile);

  // Get associated risk tools and resources for this guideline
  const { tools, resources } = getToolsAndResourcesForGuideline(guideline.id);

  // Check if the guideline has associated resources or risk assessment tools
  const hasResourcesOrRiskTools =
    (guideline.resources && guideline.resources.length > 0) ||
    tools.length > 0 ||
    resources.length > 0;

  const handlePersonalize = () => {
    if (!userProfile) return;

    try {
      // Create a personalized copy of the guideline
      const personalizedGuideline = GuidelineService.createPersonalizedGuideline(
        guideline.id,
        userProfile.userId
      );

      // Navigate to the edit page for the new personalized guideline
      router.push(`/guidelines/edit/${personalizedGuideline.id}`);
    } catch (error) {
      console.error('Error creating personalized guideline:', error);
      alert('There was an error creating your personalized guideline.');
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
      {/* Header with title and tags */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            <Link href={`/guidelines/${guideline.id}`} className="hover:text-blue-600">
              {guideline.name}
            </Link>
          </h3>
          <div className="flex items-center gap-2">
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
                Relevant for you
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">{guideline.description}</p>
      </div>

      {/* Body with recommendations */}
      <div className="px-4 py-3">
        {isRelevant && currentRange && (
          <div className="border-l-4 border-blue-500 bg-blue-50 p-3 mb-3">
            <h4 className="text-sm font-medium text-blue-800">Your Current Recommendation:</h4>
            <p className="text-base text-gray-800 mt-1">
              For ages {currentRange.label}: {currentRange.frequency}
            </p>
            <p className="text-sm text-gray-600 italic mt-1">
              {currentRange.notes || 'For individuals at average risk'}
            </p>
          </div>
        )}

        {/* Age Range Information */}
        <div className="mb-3">
          <h5 className="text-xs font-medium text-gray-500 mb-2">Age Ranges:</h5>
          <ul className="space-y-2">
            {guideline.ageRanges.map((range, idx) => {
              const isCurrentRange =
                userProfile &&
                userProfile.age >= range.min &&
                (range.max === null || userProfile.age <= range.max);

              return (
                <li
                  key={idx}
                  className={`text-sm ${
                    isCurrentRange
                      ? 'font-medium text-blue-800 bg-blue-50 p-1 rounded'
                      : 'text-gray-600'
                  }`}
                >
                  <span className="inline-block w-16 font-medium">{range.label}:</span>
                  {range.frequency || guideline.frequency || 'As recommended'}
                  {isCurrentRange && (
                    <span className="ml-2 text-xs text-blue-600">← Your age group</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Gender Information */}
        <div className="mb-3">
          <h5 className="text-xs font-medium text-gray-500 mb-1">Applies to:</h5>
          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
            {guideline.genders.includes('all')
              ? 'All Genders'
              : guideline.genders.map((g) => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}
          </span>
        </div>
      </div>

      {/* Resources & Risk Assessments Section */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col">
          <h4 className="text-lg font-medium text-gray-700 mb-1">Resources & Risk Assessments</h4>
          <p className="text-gray-500 italic mb-3">
            {hasResourcesOrRiskTools
              ? 'Risk tools and resources are available for this guideline'
              : 'Personalize this guideline to see relevant resources'}
          </p>

          <Link
            href={`/guidelines/${guideline.id}`}
            className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium"
          >
            <FaChartLine className="mr-2" />
            View Resources & Risk Tools
          </Link>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={handlePersonalize}
            className="text-sm flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            <FaEdit className="mr-1" />
            Personalize
          </button>
          <button
            onClick={() => onAddToRecommended(guideline.id)}
            className="text-sm flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <FaClipboardList className="mr-1" />
            Add to My Screenings
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidelineCard;

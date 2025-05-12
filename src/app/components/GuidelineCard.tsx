import Link from 'next/link';
import React from 'react';

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

  return (
    <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-medium text-gray-800">
          <Link href={`/guidelines/${guideline.id}`} className="hover:text-blue-600">
            {guideline.name}
          </Link>
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
            {guideline.category}
          </span>
          {guideline.visibility === 'private' && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              Private
            </span>
          )}
          {guideline.createdBy === 'system' && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              System
            </span>
          )}
          {userProfile && isGuidelineRelevantForUser(guideline, userProfile) && (
            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
              Relevant for you
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3">{guideline.description}</p>

      {/* Age Range Information */}
      <div className="mb-3">
        <h5 className="text-xs font-medium text-gray-500 mb-2">Age Ranges:</h5>
        <ul className="space-y-1 pl-1">
          {guideline.ageRanges.map((range, idx) => {
            const isCurrentRange =
              userProfile &&
              userProfile.age >= range.min &&
              (range.max === null || userProfile.age <= range.max);

            return (
              <li
                key={idx}
                className={`text-sm ${isCurrentRange ? 'font-medium text-blue-800' : 'text-gray-600'}`}
              >
                <span className="inline-block w-16">{range.label}:</span>
                {range.frequency || guideline.frequency || 'As recommended'}
                {isCurrentRange && (
                  <span className="ml-2 text-xs text-blue-600">⟵ Your age group</span>
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

      <div className="flex justify-end">
        <div className="flex gap-2">
          <button
            onClick={() => onAddToRecommended(guideline.id)}
            className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-300 rounded-md hover:bg-blue-50"
          >
            Add to My Screenings
          </button>
          <Link
            href={`/guidelines/edit/${guideline.id}`}
            className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuidelineCard;

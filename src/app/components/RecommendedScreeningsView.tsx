import React from 'react';
import { FaExclamationCircle, FaPlus } from 'react-icons/fa';

import { UserProfile } from './PersonalizedGuidelines';
import ScreeningItem from './ScreeningItem';
import { ScreeningRecommendation } from './types';

interface RecommendedScreeningsViewProps {
  screenings: ScreeningRecommendation[];
  handleRemoveFromRecommended: (id: string) => void;
  hasSelectedGuidelines: boolean;
  onBrowseGuidelines: () => void;
  userProfile: UserProfile;
}

const RecommendedScreeningsView: React.FC<RecommendedScreeningsViewProps> = ({
  screenings,
  handleRemoveFromRecommended,
  hasSelectedGuidelines,
  onBrowseGuidelines,
  userProfile,
}) => {
  // Render empty state with prompt to add guidelines
  const renderEmptyState = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm p-10 text-center">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <FaPlus className="text-blue-600 text-xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No guidelines selected yet</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Get started by adding relevant health screening guidelines from our collection to your
            recommended list.
          </p>
          <button
            onClick={onBrowseGuidelines}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse All Guidelines
          </button>
        </div>
      </div>
    );
  };

  if (!hasSelectedGuidelines) {
    return renderEmptyState();
  }

  // Ensure screenings are sorted with completed ones first
  const sortedScreenings = [...screenings].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return -1;
    if (a.status !== 'completed' && b.status === 'completed') return 1;
    return 0;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Your Selected Screenings</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedScreenings.length > 0 ? (
          sortedScreenings.map((screening) => (
            <ScreeningItem
              key={screening.id}
              screening={screening}
              onRemove={handleRemoveFromRecommended}
              userProfile={userProfile}
            />
          ))
        ) : (
          <div className="p-6 text-center">
            <FaExclamationCircle className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">No guidelines match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedScreeningsView;

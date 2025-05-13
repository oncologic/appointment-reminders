import Link from 'next/link';
import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

import { UserProfile } from '../../lib/types';
import { ScreeningRecommendation } from './types';

interface AgeBasedRecommendationsProps {
  screenings: ScreeningRecommendation[];
  userProfile: UserProfile;
}

const AgeBasedRecommendations: React.FC<AgeBasedRecommendationsProps> = ({
  screenings,
  userProfile,
}) => {
  // Group guidelines by category
  const getCategorizedGuidelines = () => {
    const categorizedGuidelines: { [category: string]: ScreeningRecommendation[] } = {};

    // Filter out future guidelines if they have notes about becoming relevant
    const relevantScreenings = screenings.filter((s) => !s.notes?.includes('Will become relevant'));

    // Categorize guidelines
    relevantScreenings.forEach((screening) => {
      // For simplicity, we're using a mock approach here. In a real implementation,
      // we would look up the category from the guideline service or include it in the screening object
      const category = screening.tags?.[0] || 'General Health';

      if (!categorizedGuidelines[category]) {
        categorizedGuidelines[category] = [];
      }
      categorizedGuidelines[category].push(screening);
    });

    return categorizedGuidelines;
  };

  const categorizedGuidelines = getCategorizedGuidelines();

  // Get category color classes
  const getCategoryColors = (index: number) => {
    const colors = [
      { bg: 'bg-blue-50', text: 'text-blue-800', dot: 'bg-blue-600' },
      { bg: 'bg-green-50', text: 'text-green-800', dot: 'bg-green-600' },
      { bg: 'bg-purple-50', text: 'text-purple-800', dot: 'bg-purple-600' },
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Age & Gender-Based Recommendations
      </h2>
      <div className="mb-4">
        <p className="text-gray-600">
          Personalized for:{' '}
          <span className="font-medium">
            {userProfile.age} year old, {userProfile.gender}
          </span>
        </p>
      </div>
      {Object.keys(categorizedGuidelines).length === 0 ? (
        <p className="text-gray-500 italic">
          No recommendations available for your age and gender.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Object.entries(categorizedGuidelines).map(([category, items], index) => {
            const { bg, text, dot } = getCategoryColors(index);
            // Limit to 4 items per category for cleaner display
            const displayItems = items.slice(0, 4);
            const hasMoreItems = items.length > 4;

            return (
              <div key={category} className={`rounded-lg p-4 ${bg}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`text-lg font-medium capitalize ${text}`}>{category}</h3>
                  {hasMoreItems && (
                    <span className="text-xs text-gray-500">
                      {displayItems.length} of {items.length}
                    </span>
                  )}
                </div>

                <ul className="text-sm text-gray-700 space-y-2 mb-3">
                  {displayItems.map((screening) => (
                    <li key={screening.id} className="flex items-baseline gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1 ${dot}`}></div>
                      <Link
                        href={`/guidelines/${screening.id}`}
                        className="hover:underline hover:text-blue-600"
                      >
                        {screening.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                {hasMoreItems && (
                  <div className="text-right">
                    <Link
                      href={`/guidelines?category=${encodeURIComponent(category)}`}
                      className={`inline-flex items-center text-sm font-medium ${text.replace('800', '600')}`}
                    >
                      View all {items.length} <FaChevronRight className="ml-1 text-xs" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgeBasedRecommendations;

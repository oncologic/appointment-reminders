import Link from 'next/link';
import React from 'react';
import { FaPlus } from 'react-icons/fa';

import { UserProfile } from '../../lib/types';
import GuidelineCard from './GuidelineCard';
import GuidelineSearch from './GuidelineSearch';
import { GuidelineItem } from './PersonalizedGuidelines';

interface AllGuidelinesViewProps {
  guidelines: GuidelineItem[];
  userProfile: UserProfile | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredGuidelines: GuidelineItem[];
  handleAddToRecommended: (id: string, frequencyMonths?: number) => void;
}

const AllGuidelinesView: React.FC<AllGuidelinesViewProps> = ({
  guidelines,
  userProfile,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  filteredGuidelines,
  handleAddToRecommended,
}) => {
  const getUniqueCategories = () => {
    const categories = guidelines.map((g) => g.category);
    return ['All Categories', ...Array.from(new Set(categories))];
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">All Guidelines</h2>
        <Link
          href="/guidelines/edit/new"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <FaPlus className="mr-1" /> Add New Guideline
        </Link>
      </div>

      {/* General Guidelines Notice */}
      <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 mb-4">
        <p className="text-sm text-yellow-700">
          These are based on general guidelines. For more accurate risk assessments and personalized
          recommendations, use the Personalize option on any guideline to tailor it to your specific
          circumstances.
        </p>
      </div>

      <GuidelineSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={getUniqueCategories()}
        resultsCount={filteredGuidelines.length}
        totalCount={guidelines.length}
        onClearFilters={clearFilters}
        showTips={true}
      />

      {filteredGuidelines.length > 0 && (
        <div className="space-y-4">
          {filteredGuidelines.map((guideline) => (
            <GuidelineCard
              key={guideline.id}
              guideline={guideline}
              userProfile={userProfile}
              onAddToRecommended={handleAddToRecommended}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllGuidelinesView;

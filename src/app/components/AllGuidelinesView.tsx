import React, { useEffect, useState } from 'react';
import { FaFilter, FaSearch, FaTimesCircle } from 'react-icons/fa';

import { UserProfile } from '../../lib/types';
import GuidelineCard from './GuidelineCard';
import { GuidelineItem } from './PersonalizedGuidelines';

interface AllGuidelinesViewProps {
  guidelines: GuidelineItem[];
  userProfile: UserProfile | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredGuidelines: GuidelineItem[];
  handleAddToRecommended: (id: string, frequencyMonths?: number, startAge?: number) => void;
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
  // Local state for categories
  const [categories, setCategories] = useState<string[]>([]);

  const getUniqueCategories = () => {
    const allCats = guidelines.map((g) => g.category);
    return ['All Categories', ...Array.from(new Set(allCats))];
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
  };

  useEffect(() => {
    setCategories(getUniqueCategories());
  }, [guidelines]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">All Guidelines</h2>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search input */}
          <div className="relative flex-grow md:flex-grow-0 md:min-w-[260px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-600" />
            </div>
            <input
              type="text"
              placeholder="Search guidelines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
              >
                <FaTimesCircle />
              </button>
            )}
          </div>

          {/* Category dropdown */}
          <div className="relative text-gray-500">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-600" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters button */}
          {(searchQuery || selectedCategory !== 'All Categories') && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FaTimesCircle className="mr-1" /> Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuidelines.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No guidelines found matching your search criteria.
          </div>
        ) : (
          filteredGuidelines.map((guideline) => (
            <GuidelineCard
              key={guideline.id}
              guideline={guideline}
              userProfile={userProfile}
              onAddToRecommended={handleAddToRecommended}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AllGuidelinesView;

import React from 'react';
import { FaSearch } from 'react-icons/fa';

interface GuidelineSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  resultsCount: number;
  totalCount: number;
  onClearFilters: () => void;
  showTips: boolean;
}

const GuidelineSearch: React.FC<GuidelineSearchProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  resultsCount,
  totalCount,
  onClearFilters,
  showTips,
}) => {
  return (
    <>
      {/* Search and filter controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-600" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              showTips
                ? 'Try blood pressure, mammogram, or diabetes etc.'
                : 'Search guidelines and screenings'
            }
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {resultsCount} of {totalCount} guidelines
        {searchQuery && (
          <span>
            {' '}
            matching &quot;<strong>{searchQuery}</strong>&quot;
          </span>
        )}
        {selectedCategory && selectedCategory !== 'All Categories' && (
          <span>
            {' '}
            in &quot;<strong>{selectedCategory}</strong>&quot;
          </span>
        )}
      </div>

      {resultsCount === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FaSearch className="mx-auto text-3xl mb-2" />
          <p className="text-lg">No guidelines match your filters</p>
          <button
            onClick={onClearFilters}
            className="mt-4 px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
};

export default GuidelineSearch;

import React from 'react';

interface ScreeningFiltersSidebarProps {
  filterStatus: string[];
  toggleStatusFilter: (status: string) => void;
  showCurrentlyRelevant: boolean;
  setShowCurrentlyRelevant: (show: boolean) => void;
  showFutureRecommendations: boolean;
  setShowFutureRecommendations: (show: boolean) => void;
}

const ScreeningFiltersSidebar: React.FC<ScreeningFiltersSidebarProps> = ({
  filterStatus,
  toggleStatusFilter,
  showCurrentlyRelevant,
  setShowCurrentlyRelevant,
  showFutureRecommendations,
  setShowFutureRecommendations,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="font-semibold text-gray-800 mb-4">Filter Screenings</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Status</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterStatus.includes('due')}
                onChange={() => toggleStatusFilter('due')}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Due Soon</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterStatus.includes('overdue')}
                onChange={() => toggleStatusFilter('overdue')}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Overdue</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterStatus.includes('upcoming')}
                onChange={() => toggleStatusFilter('upcoming')}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Upcoming</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterStatus.includes('completed')}
                onChange={() => toggleStatusFilter('completed')}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Completed</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Time Frame</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showCurrentlyRelevant}
                onChange={(e) => setShowCurrentlyRelevant(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Currently Relevant</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showFutureRecommendations}
                onChange={(e) => setShowFutureRecommendations(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Future Recommendations</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreeningFiltersSidebar;

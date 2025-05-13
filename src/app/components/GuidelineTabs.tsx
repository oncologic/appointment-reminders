import React from 'react';

import { GuidelineView } from './types';

interface GuidelineTabsProps {
  currentView: GuidelineView;
  setCurrentView: (view: GuidelineView) => void;
}

const GuidelineTabs: React.FC<GuidelineTabsProps> = ({ currentView, setCurrentView }) => {
  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="flex -mb-px">
        <button
          onClick={() => setCurrentView(GuidelineView.MyScreenings)}
          className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
            currentView === GuidelineView.MyScreenings
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          My Screenings
        </button>
        <button
          onClick={() => setCurrentView(GuidelineView.AllGuidelinesView)}
          className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
            currentView === GuidelineView.AllGuidelinesView
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          All Guidelines
        </button>
        <button
          onClick={() => setCurrentView(GuidelineView.ManageGuidelines)}
          className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
            currentView === GuidelineView.ManageGuidelines
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Manage Guidelines
        </button>
        <button
          onClick={() => setCurrentView(GuidelineView.UserProfile)}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            currentView === GuidelineView.UserProfile
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          User Profile
        </button>
      </nav>
    </div>
  );
};

export default GuidelineTabs;

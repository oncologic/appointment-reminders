import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
  FaClipboardList,
  FaEdit,
  FaTimes,
} from 'react-icons/fa';

import { getToolsAndResourcesForGuideline } from '../../lib/mockData';
import GuidelineService from '../../lib/services/guidelineService';
import { UserProfile } from '../../lib/types';
import { GuidelineItem } from './PersonalizedGuidelines';

interface GuidelineCardProps {
  guideline: GuidelineItem;
  userProfile: UserProfile | null;
  onAddToRecommended: (id: string, frequencyMonths?: number, startAge?: number) => void;
}

const GuidelineCard: React.FC<GuidelineCardProps> = ({
  guideline,
  userProfile,
  onAddToRecommended,
}) => {
  const router = useRouter();
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [frequencyMonths, setFrequencyMonths] = useState<number | undefined>(undefined);
  const [startAge, setStartAge] = useState<number | undefined>(
    userProfile?.age ? userProfile.age : undefined
  );
  const [showAllRanges, setShowAllRanges] = useState(false);

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

  const getOtherRecommendations = () => {
    if (!userProfile || guideline.ageRanges.length === 0) return [];

    return guideline.ageRanges.filter(
      (range) =>
        !(userProfile.age >= range.min && (range.max === null || userProfile.age <= range.max))
    );
  };

  const currentRange = getCurrentRecommendation();
  const otherRanges = getOtherRecommendations();
  const isRelevant = userProfile && isGuidelineRelevantForUser(guideline, userProfile);
  const { tools, resources } = getToolsAndResourcesForGuideline(guideline.id);
  const hasResourcesOrRiskTools = tools.length > 0 || resources.length > 0;

  const handlePersonalize = async () => {
    if (!userProfile) return;

    try {
      const personalizedGuideline = await GuidelineService.createPersonalizedGuideline(
        guideline.id,
        userProfile.userId
      );
      router.push(`/guidelines/edit/${personalizedGuideline.id}`);
    } catch (error) {
      console.error('Error creating personalized guideline:', error);
      alert('There was an error creating your personalized guideline.');
    }
  };

  const handleAddToScreenings = () => {
    setShowFrequencyModal(true);

    // Set default frequency based on current age range or guideline
    if (currentRange && currentRange.frequencyMonths) {
      setFrequencyMonths(currentRange.frequencyMonths);
      setStartAge(currentRange.min);
    } else if (guideline.frequencyMonths) {
      setFrequencyMonths(guideline.frequencyMonths);
    } else {
      setFrequencyMonths(12); // Default to annual if no frequency specified
    }
  };

  const handleSubmitFrequency = () => {
    onAddToRecommended(guideline.id, frequencyMonths, startAge);
    setShowFrequencyModal(false);

    // Set the frequency text for toast message
    let frequencyText = 'regularly';
    if (frequencyMonths) {
      if (frequencyMonths === 1) frequencyText = 'monthly';
      else if (frequencyMonths === 3) frequencyText = 'quarterly';
      else if (frequencyMonths === 6) frequencyText = 'every 6 months';
      else if (frequencyMonths === 12) frequencyText = 'annually';
      else if (frequencyMonths === 24) frequencyText = 'every 2 years';
      else if (frequencyMonths === 36) frequencyText = 'every 3 years';
      else frequencyText = `every ${frequencyMonths} months`;
    }

    // Show toast notification using react-hot-toast
    toast.success(`${guideline.name} added to your screenings (${frequencyText})`, {
      duration: 5000,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
      iconTheme: {
        primary: '#4ade80',
        secondary: '#fff',
      },
    });
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
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs font-medium text-gray-500">Applies to:</span>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
              {guideline.category}
            </span>
            {guideline.genders.includes('all') ? (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                All Genders
              </span>
            ) : (
              guideline.genders.map((g, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </span>
              ))
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
            className="text-xs flex items-center px-2 py-1 bg-green-400 hover:bg-green-500 text-white rounded transition-colors"
          >
            <FaEdit className="mr-1" />
            Personalize
          </button>
          <button
            onClick={handleAddToScreenings}
            className="text-xs flex items-center px-2 py-1 bg-blue-400 hover:bg-blue-500 text-white rounded transition-colors"
          >
            <FaClipboardList className="mr-1" />
            Add to My Screenings
          </button>
        </div>
      </div>

      {/* Frequency Selection Modal */}
      {showFrequencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Set Screening Frequency</h3>
              <button
                onClick={() => setShowFrequencyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                How often would you like to repeat this screening?
              </p>

              {currentRange && (
                <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm">
                  <p className="font-medium text-blue-800">
                    Recommended for your age ({currentRange.label}):
                  </p>
                  <p className="text-gray-700">{currentRange.frequency}</p>
                  {currentRange.frequencyMonths && (
                    <p className="text-gray-700 mt-1">
                      (Every {currentRange.frequencyMonths} months)
                    </p>
                  )}
                </div>
              )}

              {/* Show other age recommendations toggle */}
              {otherRanges.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowAllRanges(!showAllRanges)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2"
                  >
                    {showAllRanges ? (
                      <>
                        <FaChevronUp className="mr-1" /> Hide other age recommendations
                      </>
                    ) : (
                      <>
                        <FaChevronDown className="mr-1" /> Show other age recommendations
                      </>
                    )}
                  </button>

                  {showAllRanges && (
                    <div className="pl-2 border-l-2 border-gray-200 space-y-2">
                      {otherRanges.map((range, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
                          <p className="font-medium">Ages {range.label}:</p>
                          <p className="text-gray-700">{range.frequency}</p>
                          {range.notes && (
                            <p className="text-gray-500 text-xs mt-1">{range.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="frequencyMonths"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Frequency (months)
                  </label>
                  <input
                    type="number"
                    id="frequencyMonths"
                    min="1"
                    max="120"
                    value={frequencyMonths || ''}
                    onChange={(e) => setFrequencyMonths(parseInt(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="startAge"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Age to Start At
                  </label>
                  <input
                    type="number"
                    id="startAge"
                    min="1"
                    max="120"
                    value={startAge || ''}
                    onChange={(e) => setStartAge(parseInt(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is the age when you should start this screening.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFrequencyModal(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFrequency}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Screening
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidelineCard;

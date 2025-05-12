import { useEffect, useState } from 'react';
import {
  FaCalendarPlus,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaStar,
} from 'react-icons/fa';

export interface AgeRange {
  min: number;
  max: number | null;
  label: string;
  frequency?: string;
  frequencyMonths?: number; // Minimum frequency in months (e.g., 12 for annual minimum)
  frequencyMonthsMax?: number; // Maximum frequency in months (e.g., 36 for every 3 years maximum)
  notes?: string;
}

export interface GuidelineItem {
  id: string;
  name: string;
  description: string;
  frequency?: string;
  frequencyMonths?: number; // Default frequency in months if not specified in age ranges
  category: string;
  genders: ('male' | 'female' | 'all')[];
  ageRanges: AgeRange[];
  visibility: 'public' | 'private';
  createdBy?: string;
  tags?: string[];
  originalGuidelineId?: string;
  resources?: {
    name: string;
    url: string;
    description?: string;
  }[];
  lastCompletedDate?: string; // ISO date string when this screening was last completed
  nextDueDate?: string; // ISO date string when this screening is next due
}

export interface UserPreferences {
  selectedGuidelineIds: string[];
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  riskFactors: {
    [key: string]: boolean | string;
  };
  isAdmin: boolean;
  userId: string;
}

interface PersonalizedGuidelinesProps {
  guidelines: GuidelineItem[];
  userProfile: UserProfile;
  userPreferences: UserPreferences;
  onSavePreferences: (preferences: UserPreferences) => void;
}

const getGuidelineStatus = (
  guideline: GuidelineItem,
  age: number
): 'current' | 'upcoming' | 'future' => {
  let status: 'current' | 'upcoming' | 'future' = 'future';

  for (const range of guideline.ageRanges) {
    // Current age range
    if (age >= range.min && (range.max === null || age <= range.max)) {
      return 'current';
    }

    // Upcoming in next 2 years
    if (range.min > age && range.min <= age + 2) {
      status = 'upcoming';
    }
  }

  return status;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return (
        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm">
          <FaCheckCircle /> Completed
        </span>
      );
    case 'due':
      return (
        <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-sm">
          <FaClock /> Due Soon
        </span>
      );
    case 'overdue':
      return (
        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-sm">
          <FaExclamationTriangle /> Overdue
        </span>
      );
    case 'upcoming':
      return (
        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-sm">
          <FaClock /> Upcoming
        </span>
      );
    default:
      return null;
  }
};

const PersonalizedGuidelines = ({
  guidelines,
  userProfile,
  userPreferences,
  onSavePreferences,
}: PersonalizedGuidelinesProps) => {
  const [selectedGuidelineIds, setSelectedGuidelineIds] = useState<string[]>(
    userPreferences.selectedGuidelineIds || []
  );

  // Filter guidelines relevant to the user's age and gender
  const relevantGuidelines = guidelines.filter((guideline) => {
    // Check gender relevance
    const genderRelevant =
      guideline.genders.includes('all') ||
      guideline.genders.includes(userProfile.gender as 'male' | 'female');

    // Check age ranges
    let ageRelevant = false;
    for (const range of guideline.ageRanges) {
      if (userProfile.age >= range.min && (range.max === null || userProfile.age <= range.max)) {
        ageRelevant = true;
        break;
      }
    }

    return genderRelevant && ageRelevant;
  });

  // Guidelines coming up in the next age range (within 5 years)
  const upcomingGuidelines = guidelines.filter((guideline) => {
    // Already relevant to current age
    if (relevantGuidelines.some((g) => g.id === guideline.id)) {
      return false;
    }

    // Check gender relevance
    const genderRelevant =
      guideline.genders.includes('all') ||
      guideline.genders.includes(userProfile.gender as 'male' | 'female');

    if (!genderRelevant) return false;

    // Check if it will be relevant in the next 5 years
    let comingSoon = false;
    for (const range of guideline.ageRanges) {
      if (range.min > userProfile.age && range.min <= userProfile.age + 5) {
        comingSoon = true;
        break;
      }
    }

    return comingSoon;
  });

  // Future guidelines (beyond 5 years)
  const futureGuidelines = guidelines.filter((guideline) => {
    if (
      relevantGuidelines.some((g) => g.id === guideline.id) ||
      upcomingGuidelines.some((g) => g.id === guideline.id)
    ) {
      return false;
    }

    // Check gender relevance
    const genderRelevant =
      guideline.genders.includes('all') ||
      guideline.genders.includes(userProfile.gender as 'male' | 'female');

    if (!genderRelevant) return false;

    // Only return guidelines that start beyond 5 years
    let futureRelevant = false;
    for (const range of guideline.ageRanges) {
      if (range.min > userProfile.age + 5) {
        futureRelevant = true;
        break;
      }
    }

    return futureRelevant;
  });

  const handleToggleGuideline = (guidelineId: string) => {
    setSelectedGuidelineIds((current) => {
      if (current.includes(guidelineId)) {
        return current.filter((id) => id !== guidelineId);
      } else {
        return [...current, guidelineId];
      }
    });
  };

  // Save preferences when selection changes
  useEffect(() => {
    onSavePreferences({
      ...userPreferences,
      selectedGuidelineIds,
    });
  }, [selectedGuidelineIds]);

  return (
    <div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              Current Recommendations (Ages {Math.max(userProfile.age - 2, 18)}-{userProfile.age})
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              {relevantGuidelines.length === 0 ? (
                <li className="text-gray-500 italic">No current recommendations</li>
              ) : (
                relevantGuidelines.map((guideline) => (
                  <li key={guideline.id} className="flex items-baseline gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1"></div>
                    <div className="flex-1 flex justify-between items-center">
                      <span>{guideline.name}</span>
                      <button
                        onClick={() => handleToggleGuideline(guideline.id)}
                        className={`ml-2 ${
                          selectedGuidelineIds.includes(guideline.id)
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                        title={
                          selectedGuidelineIds.includes(guideline.id)
                            ? 'Remove from my list'
                            : 'Add to my list'
                        }
                      >
                        <FaStar />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Coming Soon (Ages {userProfile.age + 1}-{userProfile.age + 5})
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              {upcomingGuidelines.length === 0 ? (
                <li className="text-gray-500 italic">No upcoming recommendations</li>
              ) : (
                upcomingGuidelines.map((guideline) => (
                  <li key={guideline.id} className="flex items-baseline gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-1"></div>
                    <div className="flex-1 flex justify-between items-center">
                      <span>{guideline.name}</span>
                      <button
                        onClick={() => handleToggleGuideline(guideline.id)}
                        className={`ml-2 ${
                          selectedGuidelineIds.includes(guideline.id)
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                        title={
                          selectedGuidelineIds.includes(guideline.id)
                            ? 'Remove from my list'
                            : 'Add to my list'
                        }
                      >
                        <FaStar />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-purple-800 mb-2">
              Future Planning (Ages {userProfile.age + 6}+)
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              {futureGuidelines.length === 0 ? (
                <li className="text-gray-500 italic">No future recommendations</li>
              ) : (
                futureGuidelines.map((guideline) => (
                  <li key={guideline.id} className="flex items-baseline gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-600 mt-1"></div>
                    <div className="flex-1 flex justify-between items-center">
                      <span>{guideline.name}</span>
                      <button
                        onClick={() => handleToggleGuideline(guideline.id)}
                        className={`ml-2 ${
                          selectedGuidelineIds.includes(guideline.id)
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                        title={
                          selectedGuidelineIds.includes(guideline.id)
                            ? 'Remove from my list'
                            : 'Add to my list'
                        }
                      >
                        <FaStar />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Your Selected Screenings</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {selectedGuidelineIds.length === 0 ? (
            <div className="p-6 text-center text-gray-500 italic">
              No screenings selected. Click the star icon next to a recommendation to add it to your
              list.
            </div>
          ) : (
            guidelines
              .filter((g) => selectedGuidelineIds.includes(g.id))
              .map((guideline) => {
                const guidelineStatus = getGuidelineStatus(guideline, userProfile.age);
                let status = 'upcoming';
                if (guidelineStatus === 'current') {
                  status = 'due';
                } else if (guidelineStatus === 'future') {
                  status = 'upcoming';
                }

                return (
                  <div
                    key={guideline.id}
                    className={`p-6 hover:bg-gray-50 ${
                      guidelineStatus === 'future' ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{guideline.name}</h3>
                          <div className="ml-3">{getStatusBadge(status)}</div>
                        </div>
                        <p className="text-gray-600 mb-2">{guideline.description}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Recommended: {guideline.frequency}</p>
                          <p>
                            Age Range: {guideline.ageRanges.map((range) => range.label).join(', ')}
                          </p>
                          {guidelineStatus === 'future' && (
                            <p className="text-blue-600 italic">
                              Will become relevant at age {guideline.ageRanges[0]?.min || 'unknown'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm 
                          ${
                            guidelineStatus === 'future'
                              ? 'text-gray-500 bg-gray-200 hover:bg-gray-300 cursor-not-allowed'
                              : 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          }`}
                        >
                          <FaCalendarPlus className="mr-2" />{' '}
                          {guidelineStatus === 'future' ? 'Not Available Yet' : 'Schedule'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedGuidelines;

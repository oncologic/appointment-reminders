'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaCalendarPlus,
  FaCheckCircle,
  FaClock,
  FaCog,
  FaExclamationTriangle,
  FaTags,
} from 'react-icons/fa';

import GuidelineService from '../../lib/services/guidelineService';
import { AgeRange, GuidelineItem, UserProfile } from '../components/PersonalizedGuidelines';

interface ScreeningRecommendation {
  id: string;
  name: string;
  description: string;
  frequency: string;
  ageRange: string;
  ageRangeDetails: AgeRange[];
  tags?: string[];
  lastCompleted?: string;
  dueDate: string;
  status: 'completed' | 'due' | 'overdue' | 'upcoming';
  notes?: string;
}

const GuidelinesPage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [screenings, setScreenings] = useState<ScreeningRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Load user profile and convert guidelines to screenings format
  useEffect(() => {
    try {
      setIsLoading(true);
      const profile = GuidelineService.getUserProfile();
      if (!profile) {
        console.error('No user profile found');
        setIsLoading(false);
        return;
      }

      setUserProfile(profile);

      // Get guidelines visible to this user
      const visibleGuidelines = GuidelineService.getGuidelines(profile.userId).filter(
        (g) => g.visibility === 'public' || g.createdBy === profile.userId
      );

      // Extract all unique tags
      const allTags = new Set<string>();
      visibleGuidelines.forEach((guideline) => {
        if (guideline.tags) {
          guideline.tags.forEach((tag) => allTags.add(tag));
        }
      });
      setAvailableTags(Array.from(allTags));

      // Get relevant guidelines for the user
      const relevantGuidelines = visibleGuidelines.filter((guideline) => {
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
      });

      // Get upcoming guidelines
      const upcomingGuidelines = visibleGuidelines.filter((guideline) => {
        // Skip if already relevant
        const isRelevantNow = relevantGuidelines.some((g) => g.id === guideline.id);
        if (isRelevantNow) return false;

        // Check gender relevance
        const genderRelevant =
          guideline.genders.includes('all') ||
          guideline.genders.includes(profile.gender as 'male' | 'female');

        if (!genderRelevant) return false;

        // Check if it will be relevant in the next few years
        for (const range of guideline.ageRanges) {
          if (range.min > profile.age && range.min <= profile.age + 7) {
            return true;
          }
        }

        return false;
      });

      // Convert guidelines to screenings format
      const convertedScreenings = convertGuidelinesToScreenings([
        ...relevantGuidelines,
        ...upcomingGuidelines,
      ]);

      setScreenings(convertedScreenings);
    } catch (error) {
      console.error('Error loading guidelines:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Convert guidelines to the screenings format
  const convertGuidelinesToScreenings = (
    guidelines: GuidelineItem[]
  ): ScreeningRecommendation[] => {
    if (!userProfile || !guidelines || guidelines.length === 0) {
      return [];
    }

    return guidelines.map((guideline) => {
      try {
        // Calculate due date based on age and guideline
        const today = new Date();
        let dueDate = new Date(today);
        let status: 'completed' | 'due' | 'overdue' | 'upcoming' = 'upcoming';
        let notes: string | undefined;
        let lastCompleted: string | undefined;

        // Find relevant age range for current user
        const relevantAgeRange = guideline.ageRanges.find(
          (range) =>
            userProfile.age >= range.min && (range.max === null || userProfile.age <= range.max)
        );

        // If no relevant age range found, find the next upcoming one
        const nextAgeRange = !relevantAgeRange
          ? guideline.ageRanges
              .filter((range) => range.min > userProfile.age)
              .sort((a, b) => a.min - b.min)[0]
          : null;

        // Check if this is a current or upcoming guideline
        const isCurrent = guideline.ageRanges.some(
          (range) =>
            userProfile.age >= range.min && (range.max === null || userProfile.age <= range.max)
        );

        if (!isCurrent && nextAgeRange) {
          // Set due date to when next age range becomes applicable
          const yearsUntilDue = nextAgeRange.min - userProfile.age;
          dueDate.setFullYear(today.getFullYear() + yearsUntilDue);
          notes = `Will become relevant in ${yearsUntilDue} years`;

          // Add any age-specific notes
          if (nextAgeRange.notes) {
            notes += `. ${nextAgeRange.notes}`;
          }
        } else if (relevantAgeRange) {
          // Use guideline's lastCompletedDate if available
          if (guideline.lastCompletedDate) {
            const lastCompletedDate = new Date(guideline.lastCompletedDate);
            lastCompleted = lastCompletedDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            // Calculate next due date based on frequency
            const frequencyMonths =
              relevantAgeRange.frequencyMonths || guideline.frequencyMonths || 12; // Default to annual if not specified

            dueDate = new Date(lastCompletedDate);
            dueDate.setMonth(dueDate.getMonth() + frequencyMonths);

            // Determine status based on due date
            if (dueDate < today) {
              status = 'overdue';
            } else {
              // Due within the next 3 months
              const threeMonthsFromNow = new Date(today);
              threeMonthsFromNow.setMonth(today.getMonth() + 3);

              if (dueDate <= threeMonthsFromNow) {
                status = 'due';
              } else {
                status = 'upcoming';
              }
            }
          } else {
            // For demonstration purposes, generate a random status
            // In a real app, this would be based on actual completion data
            const random = Math.random();

            if (random < 0.2) {
              status = 'completed';
              const completedDate = new Date(today);
              completedDate.setMonth(today.getMonth() - Math.floor(Math.random() * 6));
              lastCompleted = completedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              // Calculate next due date based on frequency
              const frequencyMonths =
                relevantAgeRange.frequencyMonths || guideline.frequencyMonths || 12; // Default to annual if not specified

              dueDate = new Date(completedDate);
              dueDate.setMonth(completedDate.getMonth() + frequencyMonths);
            } else if (random < 0.4) {
              status = 'overdue';
              dueDate.setMonth(today.getMonth() - Math.floor(Math.random() * 3) - 1); // Overdue by 1-3 months
            } else if (random < 0.7) {
              status = 'due';
              dueDate.setMonth(today.getMonth() + Math.floor(Math.random() * 2) + 1); // Due in 1-2 months
            } else {
              status = 'upcoming';
              dueDate.setMonth(today.getMonth() + Math.floor(Math.random() * 6) + 3); // Due in 3-8 months
            }
          }

          // Add any age-specific notes
          if (relevantAgeRange.notes) {
            notes = relevantAgeRange.notes;
          }
        }

        // Get the current or next applicable frequency
        const frequency =
          isCurrent && relevantAgeRange?.frequency
            ? relevantAgeRange.frequency
            : nextAgeRange?.frequency || guideline.frequency || '';

        // Get frequency in months for display
        const minFrequencyMonths =
          isCurrent && relevantAgeRange?.frequencyMonths
            ? relevantAgeRange.frequencyMonths
            : nextAgeRange?.frequencyMonths || guideline.frequencyMonths;

        const maxFrequencyMonths =
          isCurrent && relevantAgeRange?.frequencyMonthsMax
            ? relevantAgeRange.frequencyMonthsMax
            : nextAgeRange?.frequencyMonthsMax;

        // Format the frequency text to include the range when available
        const frequencyText =
          (frequency ? frequency : '') +
          (minFrequencyMonths && maxFrequencyMonths
            ? ` (${minFrequencyMonths}-${maxFrequencyMonths} months)`
            : minFrequencyMonths
              ? ` (min ${minFrequencyMonths} months)`
              : '');

        return {
          id: guideline.id,
          name: guideline.name,
          description: guideline.description,
          frequency: frequencyText,
          ageRange: guideline.ageRanges.map((r) => r.label).join(', '),
          ageRangeDetails: guideline.ageRanges,
          tags: guideline.tags,
          lastCompleted,
          dueDate: dueDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          status,
          notes,
        };
      } catch (error) {
        console.error('Error processing guideline:', error, guideline);
        return {
          id: guideline.id || 'error',
          name: guideline.name || 'Error processing guideline',
          description: 'An error occurred while processing this guideline',
          frequency: '',
          ageRange: '',
          ageRangeDetails: [],
          dueDate: 'Unknown',
          status: 'upcoming',
        };
      }
    });
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

  const getAgeBasedRecommendations = () => {
    if (!userProfile) return null;

    // Group guidelines by category
    const categorizedGuidelines: { [category: string]: ScreeningRecommendation[] } = {};

    // Filter out future guidelines if they have notes about becoming relevant
    const relevantScreenings = screenings.filter((s) => !s.notes?.includes('Will become relevant'));

    // Categorize guidelines
    relevantScreenings.forEach((screening) => {
      const g = GuidelineService.getGuidelines().find((g) => g.id === screening.id);
      if (g) {
        if (!categorizedGuidelines[g.category]) {
          categorizedGuidelines[g.category] = [];
        }
        categorizedGuidelines[g.category].push(screening);
      }
    });

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
            {Object.entries(categorizedGuidelines).map(([category, items], index) => (
              <div
                key={category}
                className={`rounded-lg p-4 ${
                  index % 3 === 0 ? 'bg-blue-50' : index % 3 === 1 ? 'bg-green-50' : 'bg-purple-50'
                }`}
              >
                <h3
                  className={`text-lg font-medium mb-2 ${
                    index % 3 === 0
                      ? 'text-blue-800'
                      : index % 3 === 1
                        ? 'text-green-800'
                        : 'text-purple-800'
                  }`}
                >
                  {category}
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  {items.map((screening) => (
                    <li key={screening.id} className="flex items-baseline gap-2">
                      <div
                        className={`w-2 h-2 rounded-full mt-1 ${
                          index % 3 === 0
                            ? 'bg-blue-600'
                            : index % 3 === 1
                              ? 'bg-green-600'
                              : 'bg-purple-600'
                        }`}
                      ></div>
                      <span>{screening.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const toggleTagFilter = (tag: string) => {
    if (filterTags.includes(tag)) {
      setFilterTags(filterTags.filter((t) => t !== tag));
    } else {
      setFilterTags([...filterTags, tag]);
    }
  };

  // Apply tag filter to screenings
  const filteredScreenings =
    filterTags.length > 0
      ? screenings.filter((s) => s.tags?.some((tag) => filterTags.includes(tag)))
      : screenings;

  // Filter out guidelines with notes about future relevance
  const relevantScreenings = filteredScreenings.filter((screening) => {
    // If it has notes about becoming relevant in the future, exclude it
    if (screening.notes?.includes('Will become relevant in')) {
      return false;
    }
    return true;
  });

  if (isLoading || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-700">
            {isLoading
              ? 'Loading guidelines...'
              : 'No user profile found. Please set up your profile first.'}
          </p>
          {!isLoading && !userProfile && (
            <div className="mt-4">
              <Link
                href="/guidelines/manage"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Set Up Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <FaArrowLeft className="text-sm" /> Back to home
          </Link>

          <Link
            href="/guidelines/manage"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaCog className="mr-2" /> Manage Guidelines
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Health Screening Guidelines</h1>
        <p className="text-gray-600 mb-8">
          Recommended health screenings based on your age, gender, and risk factors
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Filter Screenings</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Status</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Due Soon</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Overdue</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Upcoming</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Completed</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Tags</h3>
                  <div className="space-y-2">
                    {availableTags.map((tag) => (
                      <label key={tag} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filterTags.includes(tag)}
                          onChange={() => toggleTagFilter(tag)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Time Frame</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Currently Relevant</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Future Recommendations</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {getAgeBasedRecommendations()}

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Your Recommended Screenings</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredScreenings.map((screening) => (
                  <div
                    key={screening.id}
                    className={`p-6 hover:bg-gray-50 ${
                      screening.notes?.includes('Will become relevant in') ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            <Link
                              href={`/guidelines/${screening.id}`}
                              className="hover:text-blue-600"
                            >
                              {screening.name}
                            </Link>
                          </h3>
                          <div className="ml-3">{getStatusBadge(screening.status)}</div>
                        </div>
                        <p className="text-gray-600 mb-2">{screening.description}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Recommended: {screening.frequency}</p>
                          <p>Age Range: {screening.ageRange}</p>

                          {/* Age-specific recommendations */}
                          {screening.ageRangeDetails.length > 1 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">
                                Age-Specific Recommendations:
                              </p>
                              {screening.ageRangeDetails.map((range, idx) => (
                                <div
                                  key={idx}
                                  className={`text-xs p-1 ${
                                    userProfile &&
                                    userProfile.age >= range.min &&
                                    (range.max === null || userProfile.age <= range.max)
                                      ? 'bg-blue-50 border-l-2 border-blue-500'
                                      : ''
                                  }`}
                                >
                                  <strong>{range.label}:</strong>{' '}
                                  {range.frequency || screening.frequency}
                                  {range.notes && (
                                    <span className="block italic">{range.notes}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {screening.lastCompleted && (
                            <p>Last completed: {screening.lastCompleted}</p>
                          )}
                          <p>Next due: {screening.dueDate}</p>
                          {screening.notes && !screening.notes.includes('Will become relevant') && (
                            <p className="text-blue-600 italic">{screening.notes}</p>
                          )}

                          {/* Tags */}
                          {screening.tags && screening.tags.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <FaTags className="text-gray-400" />
                              <div className="flex flex-wrap gap-1">
                                {screening.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs capitalize"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Link
                          href={`/appointments/new?screening=${encodeURIComponent(screening.name)}`}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm 
                          ${
                            screening.notes?.includes('Will become relevant in')
                              ? 'text-gray-500 bg-gray-200 hover:bg-gray-300 cursor-not-allowed'
                              : 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          }`}
                        >
                          <FaCalendarPlus className="mr-2" />{' '}
                          {screening.notes?.includes('Will become relevant in')
                            ? 'Not Available Yet'
                            : 'Schedule'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesPage;

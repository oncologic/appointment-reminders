import { useEffect, useState } from 'react';

import GuidelineService from '../../lib/services/guidelineService';
import { UserProfile } from '../../lib/types';
import { GuidelineItem, UserPreferences } from '../components/PersonalizedGuidelines';
import { ScreeningRecommendation } from '../components/types';

export const useGuidelines = (userProfile: UserProfile | null) => {
  const [guidelines, setGuidelines] = useState<GuidelineItem[]>([]);
  const [screenings, setScreenings] = useState<ScreeningRecommendation[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({} as UserPreferences);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load guidelines and user preferences
  useEffect(() => {
    if (!userProfile) return;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Get guidelines visible to this user
        const allGuidelines = await GuidelineService.getGuidelines(userProfile.userId);
        const visibleGuidelines = allGuidelines.filter(
          (g: GuidelineItem) => g.visibility === 'public' || g.createdBy === userProfile.userId
        );

        setGuidelines(visibleGuidelines);

        // Extract all unique tags
        const allTags = new Set<string>();
        visibleGuidelines.forEach((guideline: GuidelineItem) => {
          if (guideline.tags) {
            guideline.tags.forEach((tag: string) => allTags.add(tag));
          }
        });
        setAvailableTags(Array.from(allTags));

        // Load user preferences
        const prefs = (await GuidelineService.getUserPreferences(userProfile.userId)) || {
          selectedGuidelineIds: [],
        };
        setUserPreferences(prefs);

        // Convert guidelines to screenings
        const convertedScreenings = convertGuidelinesToScreenings(
          visibleGuidelines,
          prefs,
          userProfile
        );
        setScreenings(convertedScreenings);
      } catch (error) {
        console.error('Error loading guidelines:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userProfile]);

  // Filter guidelines for specific search
  const getFilteredGuidelines = (
    searchQuery: string,
    selectedCategory: string,
    guidelinesToFilter = guidelines
  ) => {
    let filtered = [...guidelinesToFilter];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.description.toLowerCase().includes(query) ||
          g.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter((g) => g.category === selectedCategory);
    }

    // Sort by age relevance
    return getSortedGuidelinesByAgeRelevance(filtered, userProfile);
  };

  // Apply filters to screenings
  const getFilteredScreenings = (
    filterStatus: string[],
    showCurrentlyRelevant: boolean,
    showFutureRecommendations: boolean
  ) => {
    return screenings.filter(
      (s) =>
        // Apply status filter
        filterStatus.includes(s.status) &&
        // Apply time frame filter
        ((showCurrentlyRelevant && !s.notes?.includes('Will become relevant')) ||
          (showFutureRecommendations && s.notes?.includes('Will become relevant')))
    );
  };

  // Save user preferences
  const saveUserPreferences = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    if (userProfile?.userId) {
      GuidelineService.saveUserPreferences(userProfile.userId, preferences);
    }

    // Update screenings based on new preferences
    if (userProfile) {
      const updatedScreenings = convertGuidelinesToScreenings(guidelines, preferences, userProfile);
      setScreenings(updatedScreenings);
    }
  };

  // Add guideline to recommended list
  const addToRecommended = (guidelineId: string) => {
    if (!userPreferences) return;

    const updatedPreferences = {
      ...userPreferences,
      selectedGuidelineIds: [...(userPreferences.selectedGuidelineIds || []), guidelineId],
    };

    saveUserPreferences(updatedPreferences);
  };

  // Remove guideline from recommended list
  const removeFromRecommended = (guidelineId: string) => {
    if (!userPreferences) return;

    const updatedPreferences = {
      ...userPreferences,
      selectedGuidelineIds: userPreferences.selectedGuidelineIds.filter((id) => id !== guidelineId),
    };

    saveUserPreferences(updatedPreferences);
  };

  return {
    guidelines,
    screenings,
    userPreferences,
    availableTags,
    isLoading,
    getFilteredGuidelines,
    getFilteredScreenings,
    saveUserPreferences,
    addToRecommended,
    removeFromRecommended,
  };
};

// Sort guidelines by age relevance
const getSortedGuidelinesByAgeRelevance = (
  guidelinesToSort: GuidelineItem[] = [],
  userProfile: UserProfile | null
) => {
  if (!userProfile) return guidelinesToSort;

  return [...guidelinesToSort].sort((a, b) => {
    // Helper function to calculate how relevant a guideline is based on age
    const getAgeRelevanceScore = (guideline: GuidelineItem) => {
      // Check if any age range is currently relevant
      const currentlyRelevant = guideline.ageRanges.some(
        (range) =>
          userProfile.age >= range.min && (range.max === null || userProfile.age <= range.max)
      );

      if (currentlyRelevant) return 0; // Highest priority

      // Find closest future age range
      const closestFutureRange = guideline.ageRanges
        .filter((range) => range.min > userProfile.age)
        .sort((a, b) => a.min - b.min)[0];

      // Find closest past age range
      const closestPastRange = guideline.ageRanges
        .filter((range) => range.max !== null && range.max < userProfile.age)
        .sort((a, b) => (b.max || 0) - (a.max || 0))[0];

      if (closestFutureRange && closestPastRange) {
        // Return the closer of the two
        const futureDistance = closestFutureRange.min - userProfile.age;
        const pastDistance = userProfile.age - (closestPastRange.max || 0);
        return Math.min(futureDistance, pastDistance);
      } else if (closestFutureRange) {
        return closestFutureRange.min - userProfile.age;
      } else if (closestPastRange) {
        return userProfile.age - (closestPastRange.max || 0);
      }

      return 1000; // Far away or not relevant
    };

    const scoreA = getAgeRelevanceScore(a);
    const scoreB = getAgeRelevanceScore(b);

    return scoreA - scoreB;
  });
};

// Convert guidelines to screening recommendations format
const convertGuidelinesToScreenings = (
  guidelines: GuidelineItem[],
  preferences: UserPreferences,
  userProfile: UserProfile
): ScreeningRecommendation[] => {
  if (!userProfile || !guidelines || guidelines.length === 0) {
    return [];
  }

  // Filter guidelines based on user preferences if they exist
  const selectedGuidelines = preferences.selectedGuidelineIds?.length
    ? guidelines.filter((guideline) => preferences.selectedGuidelineIds?.includes(guideline.id))
    : guidelines;

  return selectedGuidelines.map((guideline) => {
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

          if (random < 0.1) {
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
          } else if (random < 0.5) {
            status = 'overdue';
            dueDate.setMonth(today.getMonth() - Math.floor(Math.random() * 3) - 1); // Overdue by 1-3 months
          } else if (random < 0.8) {
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
        ageRange: guideline.ageRanges,
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
        ageRange: [],
        ageRangeDetails: [],
        dueDate: 'Unknown',
        status: 'upcoming',
      };
    }
  });
};

export default useGuidelines;

import { useEffect, useState } from 'react';

import GuidelineService from '../../lib/services/guidelineService';
import { UserProfile } from '../../lib/types';
import { GuidelineItem, UserPreferences } from '../components/PersonalizedGuidelines';
import { ScreeningRecommendation } from '../components/types';

// Helper function to sort guidelines by age relevance
const getSortedGuidelinesByAgeRelevance = (
  guidelines: GuidelineItem[],
  userProfile: UserProfile | null
) => {
  if (!userProfile) return guidelines;

  return [...guidelines].sort((a, b) => {
    // Check if guideline A is relevant for the user's current age
    const aRelevantNow = a.ageRanges.some(
      (range) =>
        userProfile.age >= range.min && (range.max === null || userProfile.age <= range.max)
    );

    // Check if guideline B is relevant for the user's current age
    const bRelevantNow = b.ageRanges.some(
      (range) =>
        userProfile.age >= range.min && (range.max === null || userProfile.age <= range.max)
    );

    // If one is relevant now and the other isn't, prioritize the relevant one
    if (aRelevantNow && !bRelevantNow) return -1;
    if (!aRelevantNow && bRelevantNow) return 1;

    // If both are either relevant or not relevant, sort by how close they are to becoming relevant
    const aClosestRange = a.ageRanges.reduce(
      (closest, range) => {
        const distance = range.min - userProfile.age;
        if (distance > 0 && (closest === null || distance < closest)) {
          return distance;
        }
        return closest;
      },
      null as number | null
    );

    const bClosestRange = b.ageRanges.reduce(
      (closest, range) => {
        const distance = range.min - userProfile.age;
        if (distance > 0 && (closest === null || distance < closest)) {
          return distance;
        }
        return closest;
      },
      null as number | null
    );

    // If one has an upcoming range and the other doesn't, prioritize the one with upcoming
    if (aClosestRange !== null && bClosestRange === null) return -1;
    if (aClosestRange === null && bClosestRange !== null) return 1;

    // If both have upcoming ranges, sort by which one comes first
    if (aClosestRange !== null && bClosestRange !== null) {
      return aClosestRange - bClosestRange;
    }

    // If nothing else distinguishes them, sort alphabetically
    return a.name.localeCompare(b.name);
  });
};

export const useGuidelines = (userProfile: UserProfile | null) => {
  const [guidelines, setGuidelines] = useState<GuidelineItem[]>([]);
  const [screenings, setScreenings] = useState<ScreeningRecommendation[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    selectedGuidelineIds: [],
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load guidelines and user screenings from the database
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

        // Load screenings directly from the database
        const userScreenings = await GuidelineService.getUserScreenings(userProfile.userId);
        setScreenings(userScreenings);

        // Extract selected guideline IDs from the screenings
        const selectedIds = userScreenings.map((screening) => screening.id);
        setUserPreferences({ selectedGuidelineIds: selectedIds });
      } catch (error) {
        console.error('Error loading guidelines and screenings:', error);
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

  // Add guideline to recommended list
  const addToRecommended = async (guidelineId: string, frequencyMonths?: number) => {
    if (!userProfile) return;

    // Find the guideline to get its details
    const guideline = guidelines.find((g) => g.id === guidelineId);
    if (!guideline) return;

    try {
      // Create screening record with custom frequency in the database
      const success = await GuidelineService.addScreeningForUser(
        guidelineId,
        userProfile.userId,
        frequencyMonths || guideline.frequencyMonths
      );

      if (success) {
        // Refresh screenings from the database
        const updatedScreenings = await GuidelineService.getUserScreenings(userProfile.userId);
        setScreenings(updatedScreenings);

        // Update selected guideline IDs
        const selectedIds = updatedScreenings.map((screening) => screening.id);
        setUserPreferences({ selectedGuidelineIds: selectedIds });
      }
    } catch (error) {
      console.error('Error adding guideline to screenings:', error);
    }
  };

  // Remove guideline from recommended list
  const removeFromRecommended = async (guidelineId: string) => {
    if (!userProfile) return;

    try {
      // Remove the screening from the database
      const success = await GuidelineService.removeUserScreening(userProfile.userId, guidelineId);

      if (success) {
        // Refresh screenings from the database
        const updatedScreenings = await GuidelineService.getUserScreenings(userProfile.userId);
        setScreenings(updatedScreenings);

        // Update selected guideline IDs
        const selectedIds = updatedScreenings.map((screening) => screening.id);
        setUserPreferences({ selectedGuidelineIds: selectedIds });
      }
    } catch (error) {
      console.error('Error removing guideline from screenings:', error);
    }
  };

  // Add a new method to the hook
  const refreshScreenings = async () => {
    if (!userProfile?.userId) return;

    try {
      setIsLoading(true);
      const userScreenings = await GuidelineService.getUserScreenings(userProfile.userId);
      setScreenings(userScreenings);

      // Extract selected guideline IDs
      const selectedIds = userScreenings.map((screening) => screening.id);
      setUserPreferences({ selectedGuidelineIds: selectedIds });
    } catch (error) {
      console.error('Error refreshing screenings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    guidelines,
    screenings,
    userPreferences,
    availableTags,
    isLoading,
    getFilteredGuidelines,
    getFilteredScreenings,
    addToRecommended,
    removeFromRecommended,
    refreshScreenings,
  };
};

export default useGuidelines;

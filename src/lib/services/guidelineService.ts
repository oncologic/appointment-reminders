import {
  GuidelineItem,
  UserPreferences,
} from '../../app/components/PersonalizedGuidelines';
import { UserProfile } from '../types';
import { getToolsAndResourcesForGuideline } from '../mockData';

// Type definitions for a guideline
export interface AgeRange {
  min: number;
  max: number | null;
  label: string;
  frequency?: string;
  frequencyMonths?: number;
}

export interface GuidelineResource {
  name: string;
  url: string;
  description?: string;
  type: 'risk' | 'resource';
}

// Initial set of health guidelines as examples
export const INITIAL_GUIDELINES = [
  // ... existing code ...
];

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  selectedGuidelineIds: ['2', '1', '3'], // Breast cancer (2), Colorectal cancer (1), Cervical cancer (3)
};

const STORAGE_KEYS = {
  GUIDELINES: 'health_guidelines',
  USER_PREFERENCES: 'user_preferences',
};

// Helper functions for interacting with localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) {
      return defaultValue;
    }
    const parsedValue = JSON.parse(storedValue);
    return parsedValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Guideline service methods
export const GuidelineService = {
  // Get all guidelines (both public and user's private guidelines)
  getGuidelines: (userId?: string): GuidelineItem[] => {
    const allGuidelines = getFromStorage<GuidelineItem[]>(
      STORAGE_KEYS.GUIDELINES,
      INITIAL_GUIDELINES
    );

    // If no userId provided, return all guidelines
    if (!userId) {
      return allGuidelines;
    }

    // Return public guidelines and user's private guidelines
    return allGuidelines.filter(
      (g) => g.visibility === 'public' || (g.visibility === 'private' && g.createdBy === userId)
    );
  },

  // Get only public guidelines
  getPublicGuidelines: (): GuidelineItem[] => {
    const allGuidelines = GuidelineService.getGuidelines();
    return allGuidelines.filter((g) => g.visibility === 'public');
  },

  // Get a user's private guidelines
  getUserGuidelines: (userId: string): GuidelineItem[] => {
    const allGuidelines = GuidelineService.getGuidelines();
    return allGuidelines.filter((g) => g.visibility === 'private' && g.createdBy === userId);
  },

  // Add a new guideline with visibility and user info
  addGuideline: (guideline: GuidelineItem, userId: string, isAdmin: boolean): GuidelineItem[] => {
    // Validate the visibility based on user permissions
    if (guideline.visibility === 'public' && !isAdmin) {
      guideline.visibility = 'private';
    }

    // Set the creator
    guideline.createdBy = userId;

    const guidelines = GuidelineService.getGuidelines();
    const updatedGuidelines = [...guidelines, guideline];
    GuidelineService.saveGuidelines(updatedGuidelines);
    return updatedGuidelines;
  },

  // Update a guideline with permission check
  updateGuideline: (
    guideline: GuidelineItem,
    userId: string,
    isAdmin: boolean
  ): GuidelineItem[] => {
    const guidelines = GuidelineService.getGuidelines();

    // Find the original guideline
    const originalGuideline = guidelines.find((g) => g.id === guideline.id);

    // If guideline doesn't exist or user doesn't have permission to edit
    if (!originalGuideline || (!isAdmin && originalGuideline.createdBy !== userId)) {
      return guidelines; // Return unchanged
    }

    // If trying to change from private to public, check admin status
    if (
      originalGuideline.visibility === 'private' &&
      guideline.visibility === 'public' &&
      !isAdmin
    ) {
      guideline.visibility = 'private'; // Force private if not admin
    }

    // Update the guideline
    const updatedGuidelines = guidelines.map((g) => (g.id === guideline.id ? guideline : g));
    GuidelineService.saveGuidelines(updatedGuidelines);
    return updatedGuidelines;
  },

  // Delete a guideline with permission check
  deleteGuideline: (id: string, userId: string, isAdmin: boolean): GuidelineItem[] => {
    const guidelines = GuidelineService.getGuidelines();
    const guidelineToDelete = guidelines.find((g) => g.id === id);

    // If guideline doesn't exist or user doesn't have permission to delete
    if (!guidelineToDelete || (!isAdmin && guidelineToDelete.createdBy !== userId)) {
      return guidelines; // Return unchanged
    }

    const updatedGuidelines = guidelines.filter((g) => g.id !== id);
    GuidelineService.saveGuidelines(updatedGuidelines);
    return updatedGuidelines;
  },

  // Save all guidelines
  saveGuidelines: (guidelines: GuidelineItem[]): void => {
    saveToStorage(STORAGE_KEYS.GUIDELINES, guidelines);
  },

  // Get user profile
  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      const response = await fetch('/api/users/me');
      
      if (!response.ok) {
        if (response.status === 401) {
          return null; // Not authenticated
        }
        throw new Error(`Error fetching user profile: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  // Save user profile (updates existing profile)
  saveUserProfile: async (profile: UserProfile): Promise<boolean> => {
    if (!profile || !profile.userId) {
      console.error('Invalid user profile data');
      return false;
    }
    
    try {
      const response = await fetch(`/api/users/${profile.userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating user profile: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  },

  // Get user preferences
  getUserPreferences: (): UserPreferences => {
    return getFromStorage<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_USER_PREFERENCES);
  },

  // Save user preferences
  saveUserPreferences: (preferences: UserPreferences): void => {
    saveToStorage(STORAGE_KEYS.USER_PREFERENCES, preferences);
  },

  // Reset all data to defaults (only resets guidelines and preferences, not user profile)
  resetToDefaults: (): void => {
    GuidelineService.saveGuidelines(INITIAL_GUIDELINES);
    GuidelineService.saveUserPreferences(DEFAULT_USER_PREFERENCES);
    // No longer resetting user profile as it's stored in the database
  },

  // Get guidelines relevant to the user
  getRelevantGuidelines: async (userId: string): Promise<GuidelineItem[]> => {
    try {
      // Fetch user profile to get age and gender
      const userProfile = await GuidelineService.getUserProfile();
      if (!userProfile) {
        return [];
      }
      
      const { age, gender } = userProfile;
      const guidelines = GuidelineService.getGuidelines(userId);
  
      return guidelines.filter((guideline) => {
        // Check gender relevance
        const genderRelevant =
          guideline.genders.includes('all') ||
          guideline.genders.includes(gender as 'male' | 'female');
  
        if (!genderRelevant) return false;
  
        // Check age ranges
        let ageRelevant = false;
        for (const range of guideline.ageRanges) {
          if (age >= range.min && (range.max === null || age <= range.max)) {
            ageRelevant = true;
            break;
          }
        }
  
        return ageRelevant;
      });
    } catch (error) {
      console.error('Error getting relevant guidelines:', error);
      return [];
    }
  },

  // Get guidelines coming up in the next few years
  getUpcomingGuidelines: async (userId: string, yearsAhead = 5): Promise<GuidelineItem[]> => {
    try {
      // Fetch user profile to get age and gender
      const userProfile = await GuidelineService.getUserProfile();
      if (!userProfile) {
        return [];
      }
      
      const { age, gender } = userProfile;
      const guidelines = GuidelineService.getGuidelines(userId);
      const relevantNow = await GuidelineService.getRelevantGuidelines(userId);
  
      return guidelines.filter((guideline) => {
        // Skip if already relevant
        if (relevantNow.some((g) => g.id === guideline.id)) {
          return false;
        }
  
        // Check gender relevance
        const genderRelevant =
          guideline.genders.includes('all') ||
          guideline.genders.includes(gender as 'male' | 'female');
  
        if (!genderRelevant) return false;
  
        // Check if it will be relevant in the next X years
        let comingSoon = false;
        for (const range of guideline.ageRanges) {
          if (range.min > age && range.min <= age + yearsAhead) {
            comingSoon = true;
            break;
          }
        }
  
        return comingSoon;
      });
    } catch (error) {
      console.error('Error getting upcoming guidelines:', error);
      return [];
    }
  },

  /**
   * Create a personalized version of a public guideline
   * @param guidelineId ID of the original guideline
   * @param userId ID of the user creating the personalized version
   * @returns The new personalized guideline
   */
  createPersonalizedGuideline: (guidelineId: string, userId: string): GuidelineItem => {
    // Find the original guideline
    const originalGuideline = GuidelineService.getGuidelines().find((g) => g.id === guidelineId);

    if (!originalGuideline) {
      throw new Error('Original guideline not found');
    }

    // Get any resources and risk tools from the mock data
    const { tools: riskTools, resources } = getToolsAndResourcesForGuideline(guidelineId);

    // Create a new guideline based on the original
    const personalizedGuideline: GuidelineItem = {
      ...JSON.parse(JSON.stringify(originalGuideline)), // Deep copy
      id: `personal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${originalGuideline.name} (Personalized)`,
      visibility: 'private',
      createdBy: userId,
      originalGuidelineId: originalGuideline.id,
      // Ensure resources are properly copied over
      resources: [
        ...(originalGuideline.resources || []),
        // Convert from GuidelineResource format to simplified resource format
        ...resources.map((r) => ({
          name: r.title,
          url: r.url,
          description: r.description,
          type: 'resource',
        })),
        // Convert from RiskAssessmentTool format to simplified resource format
        ...riskTools.map((r) => ({
          name: r.name,
          url: r.url,
          description: r.description,
          type: 'risk',
        })),
      ],
    };

    // Add to guidelines
    const guidelines = GuidelineService.getGuidelines();
    guidelines.push(personalizedGuideline);
    GuidelineService.saveGuidelines(guidelines);

    return personalizedGuideline;
  },

  /**
   * Mark a guideline as completed today
   * @param guidelineId ID of the guideline that was completed
   * @returns The updated guideline with lastCompletedDate and nextDueDate
   */
  markGuidelineCompleted: async (guidelineId: string): Promise<GuidelineItem | null> => {
    const guidelines = GuidelineService.getGuidelines();
    const guidelineIndex = guidelines.findIndex((g) => g.id === guidelineId);

    if (guidelineIndex === -1) {
      return null;
    }

    const guideline = guidelines[guidelineIndex];
    const today = new Date();

    // Update the guideline with completion date
    const updatedGuideline = {
      ...guideline,
      lastCompletedDate: today.toISOString(),
      nextDueDate: await GuidelineService.calculateNextDueDate(guideline, today),
    };

    // Save the updated guideline
    guidelines[guidelineIndex] = updatedGuideline;
    GuidelineService.saveGuidelines(guidelines);

    return updatedGuideline;
  },

  /**
   * Calculate when a guideline will next be due based on its frequency
   * @param guideline The guideline to calculate for
   * @param fromDate The date to calculate from (defaults to today)
   * @returns ISO date string for when the guideline will next be due
   */
  calculateNextDueDate: async (guideline: GuidelineItem, fromDate = new Date()): Promise<string> => {
    const userProfile = await GuidelineService.getUserProfile();
    if (!userProfile) {
      // If no user profile, just use default frequency
      const defaultFrequency = guideline.frequencyMonths || 12; // Default to annual
      const nextDue = new Date(fromDate);
      nextDue.setMonth(nextDue.getMonth() + defaultFrequency);
      return nextDue.toISOString();
    }

    // Find the relevant age range for the user
    const relevantAgeRange = guideline.ageRanges.find(
      (range) =>
        userProfile.age >= range.min && (range.max === null || userProfile.age <= range.max)
    );

    // Get the minimum frequency in months (age-specific or default)
    const minFrequencyMonths = relevantAgeRange?.frequencyMonths || guideline.frequencyMonths || 12; // Default to annual if not specified

    // For a follow-up/next due date, use the minimum frequency
    // (We want to remind users at the earliest they might need it)
    const nextDue = new Date(fromDate);
    nextDue.setMonth(nextDue.getMonth() + minFrequencyMonths);

    return nextDue.toISOString();
  },

  // Helper: Convert guideline to screening recommendation format
  convertGuidelinesToScreenings: (
    guidelines: GuidelineItem[],
    userPreferences: UserPreferences,
    userProfile: UserProfile
  ): ScreeningRecommendation[] => {
    const screenings: ScreeningRecommendation[] = [];
    const selectedIds = userPreferences.selectedGuidelineIds || [];

    selectedIds.forEach((id) => {
      const guideline = guidelines.find((g) => g.id === id);
      if (!guideline) return;

      // Get the matching screening from the mock data if available
      // This is used for demo purposes to show completed screenings with results
      const mockUpcomingScreening = upcomingScreenings.find(
        (s) => s.id === guideline.id || s.title.toLowerCase() === guideline.name.toLowerCase()
      );

      const status = 'due';
      const dueDate = new Date().toISOString();
      const lastCompleted = null;
      const notes = null;

      // const { status, dueDate, lastCompleted, notes } = getScreeningStatus(
      //   guideline,
      //   userProfile,
      //   userPreferences
      // );

      // Create screening object
      const screening: ScreeningRecommendation = {
        id: guideline.id,
        name: guideline.name,
        description: guideline.description,
        frequency: guideline.frequency || 'As recommended',
        ageRange: guideline.ageRanges,
        ageRangeDetails: guideline.ageRanges,
        status,
        dueDate,
        lastCompleted: lastCompleted || undefined,
        notes: notes || undefined,
        tags: guideline.tags,
        // Add previousResults if they exist in the mock data
        previousResults: mockUpcomingScreening?.previousResults || [],
      };

      screenings.push(screening);
    });

    return screenings;
  },
};

export default GuidelineService;

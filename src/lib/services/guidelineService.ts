import {
  GuidelineItem,
  UserPreferences,
  UserProfile,
} from '../../app/components/PersonalizedGuidelines';
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
  {
    id: 'prostate_screening',
    name: 'Prostate Cancer Screening',
    description: 'Recommendations for prostate cancer screening through PSA testing.',
    frequency: 'Based on risk factors and PSA levels',
    frequencyMonths: 12, // Default to annual but can be adjusted
    category: 'Cancer Screening',
    genders: ['male'] as ('male' | 'female' | 'all')[],
    ageRanges: [
      {
        min: 40,
        max: 44,
        label: '40-44',
        frequency: 'Consider baseline screening for high-risk men',
        frequencyMonths: 12, // Annual for high-risk
        notes: 'Including African American men and those with family history',
      },
      {
        min: 45,
        max: 49,
        label: '45-49',
        frequency: 'Consider screening for high-risk men',
        frequencyMonths: 12, // Annual for high-risk
        notes: 'Discuss benefits and risks with healthcare provider',
      },
      {
        min: 50,
        max: 69,
        label: '50-69',
        frequency: 'Consider screening every 1-2 years',
        frequencyMonths: 24, // Every 2 years is typical
        notes: 'Based on PSA levels and individual risk assessment',
      },
      {
        min: 70,
        max: null,
        label: '70+',
        frequency: 'Individualized decision based on health status',
        frequencyMonths: 24, // Every 2 years if continuing screening
        notes: 'Limited benefit for men with less than 10-15 year life expectancy',
      },
    ],
    visibility: 'public' as 'public' | 'private',
    createdBy: 'system',
    tags: ['cancer', "men's health", 'preventive'],
    resources: [
      {
        name: 'Prostate Cancer Risk Calculator',
        url: 'https://www.pcpcc.org/tools/prostate-cancer-risk-calculator',
        description:
          'Assessment tool to help determine individual risk of prostate cancer based on multiple factors',
        type: 'risk' as 'risk',
      },
      {
        name: 'American Cancer Society Guidelines',
        url: 'https://www.cancer.org/cancer/prostate-cancer/detection-diagnosis-staging/acs-recommendations.html',
        description: 'Official screening recommendations from the American Cancer Society',
        type: 'resource' as 'resource',
      },
    ],
  },
  {
    id: 'mammogram',
    name: 'Mammogram Screening',
    description: 'Breast cancer screening through mammography for early detection.',
    frequency: 'Every 1-2 years depending on age and risk factors',
    frequencyMonths: 12, // Default to annual but overridden at age ranges
    category: 'Cancer Screening',
    genders: ['female'] as ('male' | 'female' | 'all')[],
    ageRanges: [
      {
        min: 40,
        max: 44,
        label: '40-44',
        frequency: 'Optional annual screening',
        frequencyMonths: 12, // Annual
        notes: 'Individual decision based on personal values and risk factors',
      },
      {
        min: 45,
        max: 54,
        label: '45-54',
        frequency: 'Annual screening recommended',
        frequencyMonths: 12, // Annual
        notes: 'More frequent for those with family history or genetic risk factors',
      },
      {
        min: 55,
        max: 74,
        label: '55-74',
        frequency: 'Every 1-2 years',
        frequencyMonths: 24, // Every 2 years
        notes: 'Option to continue annual screening based on preference',
      },
      {
        min: 75,
        max: null,
        label: '75+',
        frequency: 'Individualized decision',
        frequencyMonths: 24, // Every 2 years if continuing
        notes: 'Based on overall health and expected longevity',
      },
    ],
    visibility: 'public' as 'public' | 'private',
    createdBy: 'system',
    tags: ['cancer', "women's health", 'preventive'],
    resources: [
      {
        name: 'Breast Cancer Risk Assessment Tool',
        url: 'https://bcrisktool.cancer.gov/',
        description:
          'Calculate your five-year and lifetime risks of developing invasive breast cancer',
        type: 'risk' as 'risk',
      },
      {
        name: 'Dense Breast Tissue Information',
        url: 'https://www.cancer.gov/types/breast/breast-changes/dense-breasts',
        description:
          'Information about dense breast tissue and additional screening considerations',
        type: 'resource' as 'resource',
      },
      {
        name: 'Mammogram Preparation Guidelines',
        url: 'https://www.cdc.gov/cancer/breast/basic_info/mammograms.htm',
        description: 'How to prepare for your mammogram screening appointment',
        type: 'resource' as 'resource',
      },
    ],
  },
];

// Initial user profile
export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Jane Doe',
  age: 38,
  dateOfBirth: '1986-06-15', // Added DOB for a 38-year-old (as of 2024)
  gender: 'female',
  riskFactors: {
    familyHistoryBreastCancer: false,
    familyHistoryColonCancer: false,
    smoking: false,
    sunExposure: 'moderate',
  },
  isAdmin: false,
  userId: 'user_default',
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  selectedGuidelineIds: ['2', '1', '3'], // Breast cancer (2), Colorectal cancer (1), Cervical cancer (3)
};

const STORAGE_KEYS = {
  GUIDELINES: 'health_guidelines',
  USER_PROFILE: 'user_profile',
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
  getUserProfile: (): UserProfile => {
    return getFromStorage<UserProfile>(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER_PROFILE);
  },

  // Save user profile
  saveUserProfile: (profile: UserProfile): void => {
    saveToStorage(STORAGE_KEYS.USER_PROFILE, profile);
  },

  // Get user preferences
  getUserPreferences: (): UserPreferences => {
    return getFromStorage<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_USER_PREFERENCES);
  },

  // Save user preferences
  saveUserPreferences: (preferences: UserPreferences): void => {
    saveToStorage(STORAGE_KEYS.USER_PREFERENCES, preferences);
  },

  // Reset all data to defaults
  resetToDefaults: (): void => {
    GuidelineService.saveGuidelines(INITIAL_GUIDELINES);
    GuidelineService.saveUserProfile(DEFAULT_USER_PROFILE);
    GuidelineService.saveUserPreferences(DEFAULT_USER_PREFERENCES);
  },

  // Get guidelines relevant to the user
  getRelevantGuidelines: (age: number, gender: string): GuidelineItem[] => {
    const guidelines = GuidelineService.getGuidelines();

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
  },

  // Get guidelines coming up in the next few years
  getUpcomingGuidelines: (age: number, gender: string, yearsAhead = 5): GuidelineItem[] => {
    const guidelines = GuidelineService.getGuidelines();
    const relevantNow = GuidelineService.getRelevantGuidelines(age, gender);

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
  markGuidelineCompleted: (guidelineId: string): GuidelineItem | null => {
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
      nextDueDate: GuidelineService.calculateNextDueDate(guideline, today),
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
  calculateNextDueDate: (guideline: GuidelineItem, fromDate = new Date()): string => {
    const userProfile = GuidelineService.getUserProfile();
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
};

export default GuidelineService;

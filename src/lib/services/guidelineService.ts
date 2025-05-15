import { GuidelineItem, UserPreferences } from '../../app/components/PersonalizedGuidelines';
import { ScreeningRecommendation } from '../../app/components/types';
import { getToolsAndResourcesForGuideline, upcomingScreenings } from '../mockData';
import { UserProfile } from '../types';

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

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  selectedGuidelineIds: ['2', '1', '3'], // Breast cancer (2), Colorectal cancer (1), Cervical cancer (3)
};

// Guideline service methods
export const GuidelineService = {
  // Helper function to convert API guidelines to our GuidelineItem format
  _formatGuidelineFromApi: (guideline: any): GuidelineItem => {
    return {
      id: guideline.id,
      name: guideline.name,
      description: guideline.description,
      frequency: guideline.frequency,
      frequencyMonths: guideline.frequency_months,
      frequencyMonthsMax: guideline.frequency_months_max,
      category: guideline.category,
      genders: guideline.genders,
      visibility: guideline.visibility,
      createdBy: guideline.created_by,
      tags: guideline.tags || [],
      originalGuidelineId: guideline.original_guideline_id,
      lastCompletedDate: guideline.last_completed_date,
      nextDueDate: guideline.next_due_date,
      // Map age ranges from guideline_age_ranges to ageRanges
      ageRanges: (guideline.guideline_age_ranges || []).map((range: any) => ({
        id: range.id,
        min: range.min_age,
        max: range.max_age,
        label: range.label,
        frequency: range.frequency,
        frequencyMonths: range.frequency_months,
        frequencyMonthsMax: range.frequency_months_max,
        notes: range.notes,
      })),
      resources: (guideline.guideline_resources || []).map((resource: any) => ({
        id: resource.id,
        name: resource.name,
        url: resource.url,
        description: resource.description,
        type: resource.type,
      })),
    };
  },

  // Get all guidelines (both public and user's private guidelines)
  getGuidelines: async (userId?: string): Promise<GuidelineItem[]> => {
    try {
      const url = userId ? `/api/guidelines?userId=${userId}` : '/api/guidelines';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch guidelines: ${response.status}`);
      }

      const data = await response.json();
      // Handle response where guidelines are nested in a "guidelines" property
      const guidelines = data.guidelines || data;

      // Map the response to match our GuidelineItem type
      return guidelines.map(GuidelineService._formatGuidelineFromApi);
    } catch (error) {
      console.error('Error fetching guidelines:', error);
      return [];
    }
  },

  // Get only public guidelines
  getPublicGuidelines: async (): Promise<GuidelineItem[]> => {
    try {
      const response = await fetch('/api/guidelines?visibility=public');

      if (!response.ok) {
        throw new Error(`Failed to fetch public guidelines: ${response.status}`);
      }

      const data = await response.json();
      const guidelines = data.guidelines || data;

      // Map the response to match our GuidelineItem type
      return guidelines.map(GuidelineService._formatGuidelineFromApi);
    } catch (error) {
      console.error('Error fetching public guidelines:', error);
      return [];
    }
  },

  // Get a user's private guidelines
  getUserGuidelines: async (userId: string): Promise<GuidelineItem[]> => {
    try {
      const response = await fetch(`/api/guidelines?userId=${userId}&visibility=private`);

      if (!response.ok) {
        throw new Error(`Failed to fetch user guidelines: ${response.status}`);
      }

      const data = await response.json();
      const guidelines = data.guidelines || data;

      // Map the response to match our GuidelineItem type
      return guidelines.map(GuidelineService._formatGuidelineFromApi);
    } catch (error) {
      console.error('Error fetching user guidelines:', error);
      return [];
    }
  },

  // Add a new guideline with visibility and user info
  addGuideline: async (
    guideline: GuidelineItem,
    userId: string,
    isAdmin: boolean
  ): Promise<GuidelineItem[]> => {
    // Validate the visibility based on user permissions
    if (guideline.visibility === 'public' && !isAdmin) {
      guideline.visibility = 'private';
    }

    // Set the creator
    guideline.createdBy = userId;

    // Save the guideline to the database
    const response = await fetch('/api/guidelines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guideline,
        ageRanges: guideline.ageRanges,
        resources: guideline.resources || [],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save guideline');
    }

    return GuidelineService.getGuidelines();
  },

  // Update a guideline with permission check
  updateGuideline: async (
    guideline: GuidelineItem,
    userId: string,
    isAdmin: boolean
  ): Promise<GuidelineItem[]> => {
    try {
      // Find the original guideline
      const response = await fetch(`/api/guidelines/${guideline.id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch original guideline: ${response.status}`);
      }

      const data = await response.json();
      const originalGuideline = data.guideline || data;

      // If guideline doesn't exist or user doesn't have permission to edit
      if (!originalGuideline || (!isAdmin && originalGuideline.created_by !== userId)) {
        return GuidelineService.getGuidelines();
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
      const updateResponse = await fetch(`/api/guidelines/${guideline.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guideline,
          ageRanges: guideline.ageRanges,
          resources: guideline.resources || [],
        }),
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update guideline: ${updateResponse.status}`);
      }

      return GuidelineService.getGuidelines();
    } catch (error) {
      console.error('Error updating guideline:', error);
      return GuidelineService.getGuidelines();
    }
  },

  // Delete a guideline with permission check
  deleteGuideline: async (
    id: string,
    userId: string,
    isAdmin: boolean
  ): Promise<GuidelineItem[]> => {
    try {
      // Find the original guideline
      const response = await fetch(`/api/guidelines/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch guideline for deletion: ${response.status}`);
      }

      const data = await response.json();
      const guidelineToDelete = data.guideline || data;

      // If guideline doesn't exist or user doesn't have permission to delete
      if (!guidelineToDelete || (!isAdmin && guidelineToDelete.created_by !== userId)) {
        return GuidelineService.getGuidelines();
      }

      // Delete the guideline
      const deleteResponse = await fetch(`/api/guidelines/${id}`, {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete guideline: ${deleteResponse.status}`);
      }

      return GuidelineService.getGuidelines();
    } catch (error) {
      console.error('Error deleting guideline:', error);
      return GuidelineService.getGuidelines();
    }
  },

  // Get user profile
  getUserProfile: (() => {
    // Add a simple cache to prevent duplicate calls
    let cachedUserProfile: UserProfile | null = null;
    let profileCacheTime = 0;
    const CACHE_TTL = 10000; // 10 seconds

    return async (): Promise<UserProfile | null> => {
      // Check if we have a valid cached profile
      const now = Date.now();
      if (cachedUserProfile && now - profileCacheTime < CACHE_TTL) {
        return cachedUserProfile;
      }

      try {
        const response = await fetch('/api/users/me');

        if (!response.ok) {
          if (response.status === 401) {
            return null; // Not authenticated
          }
          throw new Error(`Error fetching user profile: ${response.status}`);
        }

        const userData = await response.json();
        // Cache the result
        cachedUserProfile = userData;
        profileCacheTime = now;

        return userData;
      } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
      }
    };
  })(),

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
  getUserPreferences: async (userId: string): Promise<UserPreferences> => {
    try {
      const response = await fetch(`/api/users/${userId}/preferences`);

      if (!response.ok) {
        return DEFAULT_USER_PREFERENCES;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return DEFAULT_USER_PREFERENCES;
    }
  },

  // Save user preferences
  saveUserPreferences: async (userId: string, preferences: UserPreferences): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/${userId}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      return response.ok;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
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
      const guidelines = await GuidelineService.getGuidelines(userId);

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
      const guidelines = await GuidelineService.getGuidelines(userId);
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
  createPersonalizedGuideline: async (
    guidelineId: string,
    userId: string
  ): Promise<GuidelineItem> => {
    try {
      // Find the original guideline
      const response = await fetch(`/api/guidelines/${guidelineId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch original guideline: ${response.status}`);
      }

      const data = await response.json();
      const originalGuideline = data.guideline || data;

      if (!originalGuideline) {
        throw new Error('Original guideline not found');
      }

      // Get any resources and risk tools from the mock data
      const { tools: riskTools, resources } = getToolsAndResourcesForGuideline(guidelineId);

      // Create a new guideline based on the original
      const personalizedGuideline = {
        ...JSON.parse(JSON.stringify(originalGuideline)), // Deep copy
        id: undefined, // Let the server generate a new ID
        name: `${originalGuideline.name} (Personalized)`,
        visibility: 'private',
        created_by: userId, // Use snake_case for API
        original_guideline_id: originalGuideline.id,
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

      // Create the personalized guideline via API
      const createResponse = await fetch('/api/guidelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guideline: personalizedGuideline,
          ageRanges: originalGuideline.guideline_age_ranges || [],
          resources: personalizedGuideline.resources || [],
        }),
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create personalized guideline: ${createResponse.status}`);
      }

      const createdData = await createResponse.json();
      const createdGuideline = createdData.guideline || createdData;

      return GuidelineService._formatGuidelineFromApi(createdGuideline);
    } catch (error) {
      console.error('Error creating personalized guideline:', error);
      throw error;
    }
  },

  /**
   * Mark a guideline as completed today
   * @param guidelineId ID of the guideline that was completed
   * @returns The updated guideline with lastCompletedDate and nextDueDate
   */
  markGuidelineCompleted: async (guidelineId: string): Promise<GuidelineItem | null> => {
    try {
      const today = new Date();

      // Calculate the next due date
      const guidelineResponse = await fetch(`/api/guidelines/${guidelineId}`);

      if (!guidelineResponse.ok) {
        throw new Error(`Failed to fetch guideline: ${guidelineResponse.status}`);
      }

      const data = await guidelineResponse.json();
      const guideline = data.guideline || data;
      const formattedGuideline = GuidelineService._formatGuidelineFromApi(guideline);
      const nextDueDate = await GuidelineService.calculateNextDueDate(formattedGuideline, today);

      // Update the guideline with completion date
      const updateResponse = await fetch(`/api/guidelines/${guidelineId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedDate: today.toISOString(),
          nextDueDate,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to mark guideline as completed: ${updateResponse.status}`);
      }

      const updatedData = await updateResponse.json();
      const updatedGuideline = updatedData.guideline || updatedData;

      return GuidelineService._formatGuidelineFromApi(updatedGuideline);
    } catch (error) {
      console.error('Error marking guideline as completed:', error);
      return null;
    }
  },

  /**
   * Calculate when a guideline will next be due based on its frequency
   * @param guideline The guideline to calculate for
   * @param fromDate The date to calculate from (defaults to today)
   * @returns ISO date string for when the guideline will next be due
   */
  calculateNextDueDate: async (
    guideline: GuidelineItem,
    fromDate = new Date()
  ): Promise<string> => {
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
  convertGuidelinesToScreenings: async (
    guidelines: GuidelineItem[],
    userId: string
  ): Promise<ScreeningRecommendation[]> => {
    try {
      const userProfile = await GuidelineService.getUserProfile();
      const userPreferences = await GuidelineService.getUserPreferences(userId);

      if (!userProfile) {
        return [];
      }

      const screenings: ScreeningRecommendation[] = [];
      const selectedIds = userPreferences.selectedGuidelineIds || [];

      for (const id of selectedIds) {
        const guideline = guidelines.find((g) => g.id === id);
        if (!guideline) continue;

        // Get the matching screening from the mock data if available
        // This is used for demo purposes to show completed screenings with results
        const mockUpcomingScreening = upcomingScreenings.find(
          (s: { id: string; title: string }) =>
            s.id === guideline.id || s.title.toLowerCase() === guideline.name.toLowerCase()
        );

        // Determine status based on due date and last completed date
        let status: 'due' | 'upcoming' | 'overdue' | 'completed' = 'due';
        let dueDate = guideline.nextDueDate || new Date().toISOString();
        let lastCompleted = guideline.lastCompletedDate || null;

        if (guideline.lastCompletedDate) {
          const lastCompletedDate = new Date(guideline.lastCompletedDate);
          const nextDueDate = new Date(guideline.nextDueDate || '');
          const now = new Date();

          if (nextDueDate > now) {
            status = 'upcoming';
          } else {
            status = 'overdue';
          }
        }

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
          notes: undefined,
          tags: guideline.tags,
          // Add previousResults if they exist in the mock data
          previousResults: mockUpcomingScreening?.previousResults || [],
        };

        screenings.push(screening);
      }

      return screenings;
    } catch (error) {
      console.error('Error converting guidelines to screenings:', error);
      return [];
    }
  },

  // Add a screening for a user with custom frequency
  addScreeningForUser: async (
    guidelineId: string,
    userId: string,
    frequencyMonths?: number,
    startAge?: number
  ): Promise<boolean> => {
    try {
      // Find the guideline to get its details
      const guidelines = await GuidelineService.getGuidelines();
      const guideline = guidelines.find((g) => g.id === guidelineId);

      if (!guideline) {
        throw new Error('Guideline not found');
      }

      // Calculate the next due date based on frequency
      const now = new Date();
      const nextDueDate = new Date();
      nextDueDate.setMonth(now.getMonth() + (frequencyMonths || guideline.frequencyMonths || 12));

      // Set the time to end of day (23:59:59) to make the display cleaner
      nextDueDate.setHours(23, 59, 59, 0);

      // Find the default start age if not provided
      const defaultStartAge =
        startAge || guideline.ageRanges.length > 0
          ? Math.min(...guideline.ageRanges.map((range) => range.min))
          : null;

      // Create the screening record payload
      const screeningPayload = {
        guideline_id: guidelineId,
        user_id: userId,
        personalized: false,
        frequency: frequencyMonths || guideline.frequencyMonths || 12,
        start_age: defaultStartAge,
        status: 'due',
        next_due_date: nextDueDate.toISOString(),
        notes: '',
      };

      // Create the screening record
      const response = await fetch('/api/screenings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(screeningPayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Failed to create screening:', response.status, responseData);
        throw new Error(
          `Failed to create screening: ${response.status} - ${JSON.stringify(responseData)}`
        );
      }

      return true;
    } catch (error) {
      console.error('Error adding screening for user:', error);
      return false;
    }
  },

  // Get user screenings from the database
  getUserScreenings: async (userId: string): Promise<ScreeningRecommendation[]> => {
    try {
      const response = await fetch(`/api/screenings?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch user screenings: ${response.status}`);
      }

      const data = await response.json();
      const screenings = data.screenings || [];

      // Map the database records to ScreeningRecommendation format
      return screenings.map((screening: any) => {
        const guideline = screening.guidelines;

        // Determine status based on due date and completed date
        let status: 'due' | 'upcoming' | 'overdue' | 'completed' = screening.status || 'due';

        if (screening.last_completed_date) {
          const lastCompletedDate = new Date(screening.last_completed_date);
          const nextDueDate = new Date(screening.next_due_date || '');
          const now = new Date();

          if (status !== 'completed') {
            if (nextDueDate > now) {
              status = 'upcoming';
            } else {
              status = 'overdue';
            }
          }
        }

        return {
          id: screening.guideline_id,
          name: guideline?.name || 'Unknown Screening',
          description: guideline?.description || '',
          frequency: guideline?.frequency || 'As recommended',
          frequencyMonths: screening.frequency || guideline?.frequency_months,
          startAge: screening.start_age,
          ageRange: guideline?.guideline_age_ranges || [],
          ageRangeDetails: guideline?.guideline_age_ranges || [],
          status,
          dueDate: screening.next_due_date || new Date().toISOString(),
          lastCompleted: screening.last_completed_date,
          notes: screening.notes,
          tags: guideline?.tags || [],
          previousResults: [],
        };
      });
    } catch (error) {
      console.error('Error fetching user screenings:', error);
      return [];
    }
  },

  // Remove a screening from the database
  removeUserScreening: async (userId: string, guidelineId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/screenings/${guidelineId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove screening: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error removing user screening:', error);
      return false;
    }
  },

  // Update a screening's completion date
  updateScreeningCompletionDate: async (
    guidelineId: string,
    completionDate: string,
    userId?: string
  ): Promise<boolean> => {
    try {
      // If userId is not provided, get the current user profile
      let userIdToUse = userId;
      if (!userIdToUse) {
        const userProfile = await GuidelineService.getUserProfile();
        if (!userProfile || !userProfile.id) {
          throw new Error('User profile not found or missing ID');
        }
        userIdToUse = userProfile.id;
      }

      // Calculate the next due date based on the guideline's frequency
      const guidelines = await GuidelineService.getGuidelines();
      const guideline = guidelines.find((g) => g.id === guidelineId);

      if (!guideline) {
        throw new Error('Guideline not found');
      }

      // Set next due date based on the completion date and frequency
      const completionDateObj = new Date(completionDate);
      const nextDueDate = new Date(completionDateObj);
      nextDueDate.setMonth(
        nextDueDate.getMonth() + (guideline.frequencyMonths || 12) // Default to annual if not specified
      );

      // Update the screening in the database
      const response = await fetch(`/api/screenings/${guidelineId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userIdToUse,
          last_completed_date: completionDate,
          next_due_date: nextDueDate.toISOString(),
          status: 'completed',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update screening completion date: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating screening completion date:', error);
      return false;
    }
  },
};

export default GuidelineService;

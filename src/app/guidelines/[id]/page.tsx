'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import { getToolsAndResourcesForGuideline } from '../../../lib/mockData';
import GuidelineService from '../../../lib/services/guidelineService';
import GuidelineDetail, {
  GuidelineResource,
  RiskAssessmentTool,
} from '../../components/GuidelineDetail';
import { GuidelineItem, UserProfile } from '../../components/PersonalizedGuidelines';

const GuidelinePage = () => {
  const params = useParams();
  const router = useRouter();
  const guidelineId = params.id as string;

  const [guideline, setGuideline] = useState<GuidelineItem | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPreferences, setUserPreferences] = useState<{ selectedGuidelineIds: string[] }>({
    selectedGuidelineIds: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setIsLoading(true);

      // Load user profile
      const profile = GuidelineService.getUserProfile();
      if (!profile) {
        setError('User profile not found. Please set up your profile first.');
        setIsLoading(false);
        return;
      }
      setUserProfile(profile);

      // Load guidelines
      const allGuidelines = GuidelineService.getGuidelines(profile.userId);
      const foundGuideline = allGuidelines.find((g) => g.id === guidelineId);

      if (!foundGuideline) {
        setError('Guideline not found.');
        setIsLoading(false);
        return;
      }

      setGuideline(foundGuideline);

      // Load user preferences
      const prefs = GuidelineService.getUserPreferences();
      setUserPreferences(prefs);
    } catch (err) {
      console.error('Error loading guideline:', err);
      setError('An error occurred while loading the guideline.');
    } finally {
      setIsLoading(false);
    }
  }, [guidelineId]);

  const handleAddToPersonalGuidelines = () => {
    if (!guideline || !userPreferences) return;

    const updatedIds = [...userPreferences.selectedGuidelineIds, guideline.id];
    const updatedPreferences = {
      ...userPreferences,
      selectedGuidelineIds: updatedIds,
    };

    GuidelineService.saveUserPreferences(updatedPreferences);
    setUserPreferences(updatedPreferences);
  };

  const handleCustomizeGuideline = (customizedGuideline: GuidelineItem) => {
    // Navigate to the edit page for the newly created personalized guideline
    router.push(`/guidelines/edit/${customizedGuideline.id}`);
  };

  // Get tools and resources for this guideline from mock data
  const { tools, resources } = getToolsAndResourcesForGuideline(guidelineId);

  // Check if this guideline is already in user's personal list
  const isPersonalized = userPreferences?.selectedGuidelineIds.includes(guidelineId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-700">Loading guideline...</p>
        </div>
      </div>
    );
  }

  if (error || !guideline || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-red-600">{error || 'An error occurred.'}</p>
          <div className="mt-4">
            <Link
              href="/guidelines"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <FaArrowLeft className="text-sm" /> Back to guidelines
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/guidelines"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <FaArrowLeft className="text-sm" /> Back to guidelines
          </Link>
        </div>

        <GuidelineDetail
          guideline={guideline}
          userProfile={userProfile}
          riskTools={tools}
          resources={resources}
          isPersonalized={isPersonalized}
          onAddToPersonal={handleAddToPersonalGuidelines}
          onCustomize={handleCustomizeGuideline}
        />
      </div>
    </div>
  );
};

export default GuidelinePage;

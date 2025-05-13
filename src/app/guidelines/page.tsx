'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa';

import { UserProfile } from '@/lib/types';

import GuidelineService from '../../lib/services/guidelineService';
import AgeBasedRecommendations from '../components/AgeBasedRecommendations';
import AllGuidelinesView from '../components/AllGuidelinesView';
import GuidelineTabs from '../components/GuidelineTabs';
import GuidelinesBuilder from '../components/GuidelinesBuilder';
import ManageGuidelinesAdminView from '../components/ManageGuidelinesAdminView';
import RecommendedScreeningsView from '../components/RecommendedScreeningsView';
import ScreeningFiltersSidebar from '../components/ScreeningFiltersSidebar';
import UserProfileForm from '../components/UserProfileForm';
import { GuidelineView } from '../components/types';
import useGuidelines from '../hooks/useGuidelines';
import useUser from '../hooks/useUser';

const GuidelinesPage = () => {
  const { user, isLoading: isUserLoading, error: userError, refetch: refetchUser } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [currentView, setCurrentView] = useState<GuidelineView>(GuidelineView.MyScreenings);
  const [filterStatus, setFilterStatus] = useState<string[]>([
    'due',
    'overdue',
    'upcoming',
    'completed',
  ]);
  const [showCurrentlyRelevant, setShowCurrentlyRelevant] = useState(true);
  const [showFutureRecommendations, setShowFutureRecommendations] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Update local state when API data is received
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setUserProfile(user);
      } else if (!isUserLoading && !user) {
        // If not loading and no user data from API, try to get from user profile API
        const profileData = await GuidelineService.getUserProfile();
        if (profileData) {
          setUserProfile(profileData);
        }
      }
    };

    fetchUserProfile();
  }, [user, isUserLoading]);

  // Use the custom hook to manage guidelines and related logic
  const {
    guidelines,
    screenings,
    userPreferences,
    isLoading: isGuidelinesLoading,
    getFilteredGuidelines,
    getFilteredScreenings,
    addToRecommended,
    removeFromRecommended,
  } = useGuidelines(userProfile);

  // Toggle status filter (due, overdue, upcoming, completed)
  const toggleStatusFilter = (status: string) => {
    if (filterStatus.includes(status)) {
      setFilterStatus(filterStatus.filter((s) => s !== status));
    } else {
      setFilterStatus([...filterStatus, status]);
    }
  };

  // Save user profile - this will update both local storage and API
  const handleSaveUserProfile = async (profile: UserProfile) => {
    setUserProfile(profile);
    await GuidelineService.saveUserProfile(profile);

    // After saving, refetch from the API to ensure consistency
    await refetchUser();
  };

  // Get filtered screenings based on current filter settings
  const filteredScreenings = getFilteredScreenings(
    filterStatus,
    showCurrentlyRelevant,
    showFutureRecommendations
  );

  // Get filtered guidelines for the All Guidelines view
  const filteredGuidelines = getFilteredGuidelines(searchQuery, selectedCategory);

  // Check if user has selected any guidelines
  const hasSelectedGuidelines =
    userPreferences.selectedGuidelineIds && userPreferences.selectedGuidelineIds.length > 0;

  // Add handlers for edit and delete guidelines
  const handleEditGuideline = (guideline: any) => {
    // Logic to edit a guideline
    console.log('Edit guideline:', guideline);
    // You would typically set some state and show an edit form
  };

  const handleDeleteGuideline = async (guidelineId: string) => {
    // Check if userProfile exists
    if (!userProfile) {
      toast.error('User profile not found. Please log in again.');
      return;
    }

    // Confirm deletion with the user
    if (
      window.confirm(
        'Are you sure you want to delete this guideline? This action cannot be undone.'
      )
    ) {
      try {
        // Call the service to delete the guideline
        await GuidelineService.deleteGuideline(
          guidelineId,
          userProfile.userId,
          userProfile.isAdmin
        );

        // Show success toast
        toast.success('Guideline deleted successfully');

        // Refresh guidelines data after deletion
        window.location.reload();
      } catch (error) {
        console.error('Error deleting guideline:', error);
        toast.error('Failed to delete guideline. Please try again later.');
      }
    }
  };

  const isLoading = isUserLoading || isGuidelinesLoading;

  if (isLoading || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-700">
            {isLoading
              ? 'Loading user and guidelines...'
              : userError
                ? `Error loading user data: ${userError.message}`
                : 'No user profile found. Please set up your profile first.'}
          </p>
          {!isLoading && !userProfile && (
            <div className="mt-4">
              <button
                onClick={() => setCurrentView(GuidelineView.UserProfile)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Set Up Profile
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case GuidelineView.MyScreenings:
        return (
          <RecommendedScreeningsView
            screenings={filteredScreenings}
            handleRemoveFromRecommended={removeFromRecommended}
            hasSelectedGuidelines={hasSelectedGuidelines}
            onBrowseGuidelines={() => setCurrentView(GuidelineView.AllGuidelinesView)}
            userProfile={userProfile}
          />
        );
      case GuidelineView.AllGuidelinesView:
        return (
          <AllGuidelinesView
            guidelines={guidelines}
            userProfile={userProfile}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            filteredGuidelines={filteredGuidelines}
            handleAddToRecommended={addToRecommended}
          />
        );
      case GuidelineView.NewGuideline:
        return (
          <div className="space-y-6">
            <GuidelinesBuilder userProfile={userProfile} setCurrentView={setCurrentView} />
          </div>
        );
      case GuidelineView.UserProfile:
        return (
          <UserProfileForm
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onSave={handleSaveUserProfile}
          />
        );
      case GuidelineView.ManageGuidelinesAdmin:
        return (
          <ManageGuidelinesAdminView
            guidelines={guidelines}
            userProfile={userProfile}
            isAdmin={userProfile.isAdmin}
            onEditGuideline={handleEditGuideline}
            onDeleteGuideline={handleDeleteGuideline}
          />
        );
      default:
        return null;
    }
  };

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

          <div className="flex items-center gap-2">
            <span className="text-gray-600">
              Welcome, {userProfile.firstName} {userProfile.lastName} ({userProfile.age},{' '}
              {userProfile.gender})
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Health Screening Guidelines</h1>
        <p className="text-gray-600 mb-8">
          Recommended health screenings based on your age, gender, and risk factors
        </p>

        <GuidelineTabs
          currentView={currentView}
          setCurrentView={setCurrentView}
          isAdmin={userProfile.isAdmin}
          userId={userProfile.userId}
        />

        {/* Age-based recommendations section - only show in recommended view */}
        {currentView === GuidelineView.MyScreenings && (
          <AgeBasedRecommendations screenings={screenings} userProfile={userProfile} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - only show in recommended view */}
          {currentView === GuidelineView.MyScreenings && (
            <div className="lg:col-span-1">
              <ScreeningFiltersSidebar
                filterStatus={filterStatus}
                toggleStatusFilter={toggleStatusFilter}
                showCurrentlyRelevant={showCurrentlyRelevant}
                setShowCurrentlyRelevant={setShowCurrentlyRelevant}
                showFutureRecommendations={showFutureRecommendations}
                setShowFutureRecommendations={setShowFutureRecommendations}
              />
            </div>
          )}

          {/* Main content */}
          <div
            className={
              currentView === GuidelineView.MyScreenings ? 'lg:col-span-3' : 'lg:col-span-4'
            }
          >
            {renderCurrentView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesPage;

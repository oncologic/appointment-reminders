'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCog, FaUser } from 'react-icons/fa';

import { UserProfile } from '@/lib/types';

import GuidelinesBuilder from '../../components/GuidelinesBuilder';
import PersonalizedGuidelines, {
  GuidelineItem,
  UserPreferences,
} from '../../components/PersonalizedGuidelines';
import { GuidelineView } from '../../components/types';
import useUser from '../../hooks/useUser';

enum View {
  PersonalizedView,
  AllGuidelines,
  ManageGuidelines,
  UserProfile,
}

const ManageGuidelinesPage = () => {
  const [guidelines, setGuidelines] = useState<GuidelineItem[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    selectedGuidelineIds: [],
  });
  const [currentView, setCurrentView] = useState<View>(View.PersonalizedView);
  const [localUserProfile, setLocalUserProfile] = useState<UserProfile | null>(null);

  // Use the user hook to fetch the user profile from the API
  const { user: apiUserProfile, isLoading, error, refetch } = useUser();

  // Fetch guidelines from the API
  const fetchGuidelines = async (userId: string) => {
    try {
      const response = await fetch(`/api/guidelines?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setGuidelines(data.guidelines || data);
      } else {
        console.error('Failed to fetch guidelines:', await response.text());
        setGuidelines([]);
      }
    } catch (error) {
      console.error('Error fetching guidelines:', error);
      setGuidelines([]);
    }
  };

  // Fetch user preferences from the API
  const fetchUserPreferences = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/preferences`);
      if (response.ok) {
        const data = await response.json();
        setUserPreferences(data);
      } else {
        console.error('Failed to fetch user preferences:', await response.text());
        setUserPreferences({ selectedGuidelineIds: [] });
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      setUserPreferences({ selectedGuidelineIds: [] });
    }
  };

  // Initialize data when user profile is loaded from API
  useEffect(() => {
    if (apiUserProfile) {
      setLocalUserProfile(apiUserProfile);
      fetchGuidelines(apiUserProfile.userId);
      fetchUserPreferences(apiUserProfile.userId);
    }
  }, [apiUserProfile]);

  const handleSavePreferences = async (preferences: UserPreferences) => {
    setUserPreferences(preferences);

    if (localUserProfile) {
      try {
        const response = await fetch(`/api/users/${localUserProfile.userId}/preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferences),
        });

        if (!response.ok) {
          console.error('Failed to save preferences:', await response.text());
        }
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    }
  };

  const handleSaveGuidelines = async () => {
    if (localUserProfile) {
      await fetchGuidelines(localUserProfile.userId);
    }
  };

  const handleSaveUserProfile = async (updatedProfile: UserProfile) => {
    setLocalUserProfile(updatedProfile);

    // Save updated profile to the API
    try {
      if (updatedProfile.userId) {
        // Convert to the format expected by the API (matching UserProfileDB)
        const apiUpdateData = {
          first_name: updatedProfile.firstName,
          last_name: updatedProfile.lastName,
          gender: updatedProfile.gender,
          // Add other fields as needed
        };

        const response = await fetch(`/api/users/${updatedProfile.userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiUpdateData),
        });

        if (!response.ok) {
          console.error('Failed to update user profile:', await response.text());
        } else {
          // Refresh user data after successful update
          await refetch();
        }

        // Risk factors might need a separate API call
        if (updatedProfile.riskFactors) {
          try {
            const riskResponse = await fetch(`/api/users/${updatedProfile.userId}/risk-factors`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedProfile.riskFactors),
            });

            if (!riskResponse.ok) {
              console.error('Failed to update risk factors:', await riskResponse.text());
            }
          } catch (error) {
            console.error('Error updating risk factors:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  // Render the user profile form
  const renderUserProfileForm = () => {
    if (!localUserProfile) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Your Profile</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="userFirstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              <input
                type="text"
                id="userFirstName"
                value={localUserProfile.firstName}
                onChange={(e) =>
                  setLocalUserProfile({ ...localUserProfile, firstName: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
              />
            </div>
            <div>
              <label
                htmlFor="userLastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <input
                type="text"
                id="userLastName"
                value={localUserProfile.lastName}
                onChange={(e) =>
                  setLocalUserProfile({ ...localUserProfile, lastName: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
              />
            </div>
          </div>

          <div>
            <label htmlFor="userAge" className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              id="userAge"
              value={localUserProfile.age}
              onChange={(e) =>
                setLocalUserProfile({ ...localUserProfile, age: parseInt(e.target.value) || 0 })
              }
              className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={localUserProfile.gender === 'male'}
                  onChange={() => setLocalUserProfile({ ...localUserProfile, gender: 'male' })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Male</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={localUserProfile.gender === 'female'}
                  onChange={() => setLocalUserProfile({ ...localUserProfile, gender: 'female' })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Female</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={localUserProfile.gender === 'other'}
                  onChange={() => setLocalUserProfile({ ...localUserProfile, gender: 'other' })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Other</span>
              </label>
            </div>
          </div>
          {/* 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Factors</label>
            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={Boolean(localUserProfile.riskFactors?.familyHistoryBreastCancer)}
                  onChange={(e) =>
                    setLocalUserProfile({
                      ...localUserProfile,
                      riskFactors: {
                        ...localUserProfile.riskFactors,
                        familyHistoryBreastCancer: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Family history of breast cancer</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={Boolean(localUserProfile.riskFactors?.familyHistoryColonCancer)}
                  onChange={(e) =>
                    setLocalUserProfile({
                      ...localUserProfile,
                      riskFactors: {
                        ...localUserProfile.riskFactors,
                        familyHistoryColonCancer: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Family history of colon cancer</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={Boolean(localUserProfile.riskFactors?.smoking)}
                  onChange={(e) =>
                    setLocalUserProfile({
                      ...localUserProfile,
                      riskFactors: {
                        ...localUserProfile.riskFactors,
                        smoking: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Current or former smoker</span>
              </label>
            </div>
          </div> */}

          <div className="pt-4">
            <button
              onClick={() => {
                handleSaveUserProfile(localUserProfile);
                setCurrentView(View.PersonalizedView);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Profile and View Recommendations
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAllGuidelines = () => {
    // Organize guidelines by category
    const categorizedGuidelines: Record<string, GuidelineItem[]> = {};

    // Filter guidelines to only show public ones or ones created by the current user
    const visibleGuidelines = guidelines.filter(
      (g) => g.visibility === 'public' || g.createdBy === localUserProfile?.userId
    );

    visibleGuidelines.forEach((guideline) => {
      if (!categorizedGuidelines[guideline.category]) {
        categorizedGuidelines[guideline.category] = [];
      }
      categorizedGuidelines[guideline.category].push(guideline);
    });

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">All Health Guidelines</h2>

        {Object.keys(categorizedGuidelines).length === 0 ? (
          <p className="text-gray-500 italic">No guidelines available.</p>
        ) : (
          Object.entries(categorizedGuidelines).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((guideline) => (
                  <div
                    key={guideline.id}
                    className="border border-gray-200 rounded-md p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-800">
                        <Link href={`/guidelines/${guideline.id}`} className="hover:text-blue-600">
                          {guideline.name}
                        </Link>
                      </h4>
                      {guideline.visibility === 'private' && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          Private
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{guideline.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {guideline.frequency}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        Age: {guideline.ageRanges.map((r) => r.label).join(', ')}
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        Gender:{' '}
                        {guideline.genders.includes('all') ? 'All' : guideline.genders.join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-700">Loading user profile and guidelines...</p>
        </div>
      </div>
    );
  }

  // Show error state if API request failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-red-500">Error loading user profile. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Require authentication to view this page
  if (!localUserProfile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-700">Please sign in to view this page.</p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/guidelines"
          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mb-4"
        >
          <FaArrowLeft className="text-sm" /> Back to guidelines
        </Link>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Health Guidelines Manager</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView(View.PersonalizedView)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentView === View.PersonalizedView
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Personalized View
            </button>
            <button
              onClick={() => setCurrentView(View.AllGuidelines)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentView === View.AllGuidelines
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Guidelines
            </button>
            <button
              onClick={() => setCurrentView(View.ManageGuidelines)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentView === View.ManageGuidelines
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaCog className="inline mr-1" /> Manage Guidelines
            </button>
            <button
              onClick={() => setCurrentView(View.UserProfile)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentView === View.UserProfile
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaUser className="inline mr-1" /> Update Profile
            </button>
          </div>
        </div>

        {currentView === View.PersonalizedView && (
          <PersonalizedGuidelines
            guidelines={guidelines.filter(
              (g) => g.visibility === 'public' || g.createdBy === localUserProfile.userId
            )}
            userProfile={localUserProfile}
            userPreferences={userPreferences}
            onSavePreferences={handleSavePreferences}
          />
        )}

        {currentView === View.AllGuidelines && renderAllGuidelines()}
        {currentView === View.ManageGuidelines && (
          <GuidelinesBuilder
            userProfile={localUserProfile}
            setCurrentView={(view) => {
              if (view === GuidelineView.AllGuidelinesView) {
                setCurrentView(View.AllGuidelines);
              } else {
                setCurrentView(View.PersonalizedView);
              }
            }}
          />
        )}
        {currentView === View.UserProfile && renderUserProfileForm()}
      </div>
    </div>
  );
};

export default ManageGuidelinesPage;

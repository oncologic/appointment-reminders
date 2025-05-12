'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCog, FaUser } from 'react-icons/fa';

import GuidelineService from '../../../lib/services/guidelineService';
import GuidelinesBuilder from '../../components/GuidelinesBuilder';
import PersonalizedGuidelines, {
  GuidelineItem,
  UserPreferences,
  UserProfile,
} from '../../components/PersonalizedGuidelines';

enum View {
  PersonalizedView,
  AllGuidelines,
  ManageGuidelines,
  UserProfile,
}

const ManageGuidelinesPage = () => {
  const [guidelines, setGuidelines] = useState<GuidelineItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({} as UserProfile);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({} as UserPreferences);
  const [currentView, setCurrentView] = useState<View>(View.PersonalizedView);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from service on mount
  useEffect(() => {
    setIsLoading(true);

    const profile = GuidelineService.getUserProfile() || {
      name: 'Jane Doe',
      age: 38,
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
    setUserProfile(profile);

    // Load guidelines based on user permissions
    setGuidelines(GuidelineService.getGuidelines(profile.userId));

    const prefs = GuidelineService.getUserPreferences() || { selectedGuidelineIds: [] };
    setUserPreferences(prefs);

    setIsLoading(false);
  }, []);

  const handleSavePreferences = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    GuidelineService.saveUserPreferences(preferences);
  };

  const handleSaveGuidelines = (updatedGuidelines: GuidelineItem[]) => {
    // We don't need to call saveGuidelines directly - the methods in GuidelineService
    // handle this internally based on permissions
    setGuidelines(GuidelineService.getGuidelines(userProfile.userId));
  };

  const handleSaveUserProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    GuidelineService.saveUserProfile(updatedProfile);

    // Reload guidelines with the updated userId in case it changed
    setGuidelines(GuidelineService.getGuidelines(updatedProfile.userId));
  };

  const renderUserProfileForm = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Your Profile</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="userName"
              value={userProfile.name}
              onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
            />
          </div>

          <div>
            <label htmlFor="userAge" className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              id="userAge"
              value={userProfile.age}
              onChange={(e) =>
                setUserProfile({ ...userProfile, age: parseInt(e.target.value) || 0 })
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
                  checked={userProfile.gender === 'male'}
                  onChange={() => setUserProfile({ ...userProfile, gender: 'male' })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Male</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={userProfile.gender === 'female'}
                  onChange={() => setUserProfile({ ...userProfile, gender: 'female' })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Female</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={userProfile.gender === 'other'}
                  onChange={() => setUserProfile({ ...userProfile, gender: 'other' })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Other</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Factors</label>
            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={Boolean(userProfile.riskFactors?.familyHistoryBreastCancer)}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      riskFactors: {
                        ...userProfile.riskFactors,
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
                  checked={Boolean(userProfile.riskFactors?.familyHistoryColonCancer)}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      riskFactors: {
                        ...userProfile.riskFactors,
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
                  checked={Boolean(userProfile.riskFactors?.smoking)}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      riskFactors: {
                        ...userProfile.riskFactors,
                        smoking: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Current or former smoker</span>
              </label>
            </div>
          </div>

          {/* Admin settings - only shown for development/testing purposes */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Developer Settings</h3>
            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={Boolean(userProfile.isAdmin)}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      isAdmin: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Administrator Access</span>
              </label>
              <div>
                <label htmlFor="userId" className="block text-xs text-gray-500 mb-1">
                  User ID (for testing different users)
                </label>
                <input
                  type="text"
                  id="userId"
                  value={userProfile.userId}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      userId: e.target.value || 'user_default',
                    })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700 text-sm"
                  placeholder="user_default"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                handleSaveUserProfile(userProfile);
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
      (g) => g.visibility === 'public' || g.createdBy === userProfile.userId
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-700">Loading guidelines...</p>
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
              (g) => g.visibility === 'public' || g.createdBy === userProfile.userId
            )}
            userProfile={userProfile}
            userPreferences={userPreferences}
            onSavePreferences={handleSavePreferences}
          />
        )}

        {currentView === View.AllGuidelines && renderAllGuidelines()}
        {currentView === View.ManageGuidelines && <GuidelinesBuilder userProfile={userProfile} />}
        {currentView === View.UserProfile && renderUserProfileForm()}
      </div>
    </div>
  );
};

export default ManageGuidelinesPage;

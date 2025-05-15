import React, { useState } from 'react';
import { FaSpinner, FaUser } from 'react-icons/fa';

import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/types';

interface UserProfileFormProps {
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  onSave: (profile: UserProfile) => void;
}

// Calculate age based on date of birth
const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // Adjust age if birthday hasn't occurred yet this year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Generate a date of birth based on age
const generateDOB = (age: number): string => {
  const today = new Date();
  const year = today.getFullYear() - age;
  const month = today.getMonth() + 1; // JS months are 0-indexed
  const day = 1; // Default to first of month

  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  userProfile,
  setUserProfile,
  onSave,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!userProfile) return null;

  // Handle date of birth change
  const handleDOBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDOB = e.target.value;
    const newAge = calculateAge(newDOB);

    setUserProfile({
      ...userProfile,
      dateOfBirth: newDOB,
      age: newAge,
    });
  };

  // Initialize DOB if it doesn't exist but age does
  const initialDOB = userProfile.dateOfBirth || generateDOB(userProfile.age);

  // Save profile to API
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Get current user from Supabase
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setErrorMessage('Not authenticated. Please log in.');
        return;
      }

      // Prepare data for API
      const userData = {
        first_name: userProfile.firstName,
        last_name: userProfile.lastName,
        date_of_birth: userProfile.dateOfBirth,
        gender: userProfile.gender,
      };

      // Update user profile via API
      const response = await fetch(`/api/users/${userProfile.userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      // Call the onSave callback with the updated profile
      onSave(userProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <FaUser className="mr-2 text-blue-600" /> User Profile
      </h2>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
          {errorMessage}
        </div>
      )}

      <form onSubmit={saveProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={userProfile.firstName}
              onChange={(e) => setUserProfile({ ...userProfile, firstName: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={userProfile.lastName}
              onChange={(e) => setUserProfile({ ...userProfile, lastName: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            id="dateOfBirth"
            value={initialDOB}
            onChange={handleDOBChange}
            className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Age (calculated)
          </label>
          <input
            type="number"
            id="age"
            value={userProfile.age}
            disabled
            className="w-full border border-gray-300 rounded-md p-2 text-gray-700 bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Age is automatically calculated from your date of birth
          </p>
        </div>

        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">Gender</p>
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
        {/* 
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">Risk Factors</p>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={userProfile.riskFactors?.smoking === true}
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
              <span className="ml-2 text-sm text-gray-700">Smoking</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={userProfile.riskFactors?.familyHistoryBreastCancer === true}
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
              <span className="ml-2 text-sm text-gray-700">Family History of Breast Cancer</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={userProfile.riskFactors?.familyHistoryColonCancer === true}
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
              <span className="ml-2 text-sm text-gray-700">Family History of Colon Cancer</span>
            </label>
          </div>
        </div> */}

        <div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;

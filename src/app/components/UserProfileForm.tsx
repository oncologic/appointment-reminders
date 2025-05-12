import React from 'react';
import { FaUser } from 'react-icons/fa';

import { UserProfile } from './PersonalizedGuidelines';

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <FaUser className="mr-2 text-blue-600" /> User Profile
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(userProfile);
        }}
        className="space-y-6"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={userProfile.name}
            onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
            className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
          />
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
          </div>
        </div>

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
        </div>

        <div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;

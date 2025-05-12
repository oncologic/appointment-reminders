import { useEffect, useState } from 'react';
import { FaGlobe, FaLock, FaPlus, FaSave, FaTag, FaTrash, FaUndo } from 'react-icons/fa';

import GuidelineService from '../../lib/services/guidelineService';
import { AgeRange, GuidelineItem, UserProfile } from './PersonalizedGuidelines';

const CATEGORIES = [
  'General Health',
  'Cancer Screening',
  'Preventive Care',
  'Cardiovascular Health',
  'Mental Health',
  'Dental Health',
  'Vision Health',
  'Metabolic Health',
];

interface AgeRangeFormState {
  min: string;
  max: string;
  frequency: string;
  frequencyMonths: string; // Minimum frequency in months
  frequencyMonthsMax: string; // Maximum frequency in months
  notes: string;
}

const DEFAULT_GUIDELINE: GuidelineItem = {
  id: '',
  name: '',
  description: '',
  ageRanges: [{ min: 18, max: null, label: '18+' }],
  genders: ['all'],
  category: 'General Health',
  visibility: 'private',
  tags: [],
};

interface GuidelinesBuilderProps {
  userProfile: UserProfile;
}

const GuidelinesBuilder = ({ userProfile }: GuidelinesBuilderProps) => {
  const [guidelines, setGuidelines] = useState<GuidelineItem[]>([]);
  const [currentGuideline, setCurrentGuideline] = useState<GuidelineItem>({ ...DEFAULT_GUIDELINE });
  const [isEditing, setIsEditing] = useState(false);
  const [ageRange, setAgeRange] = useState<AgeRangeFormState>({
    min: '18',
    max: '',
    frequency: '',
    frequencyMonths: '',
    frequencyMonthsMax: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [tagInput, setTagInput] = useState('');

  // Load guidelines on component mount
  useEffect(() => {
    const loadedGuidelines = GuidelineService.getGuidelines(userProfile.userId);
    setGuidelines(loadedGuidelines);
    setIsLoading(false);
  }, [userProfile.userId]);

  const generateId = () => {
    return Date.now().toString();
  };

  const handleAddGuideline = () => {
    setIsEditing(false);
    setCurrentGuideline({
      ...DEFAULT_GUIDELINE,
      id: generateId(),
      visibility: userProfile.isAdmin ? 'public' : 'private', // Default to private unless admin
      tags: [],
    });
    setAgeRange({
      min: '18',
      max: '',
      frequency: '',
      frequencyMonths: '',
      frequencyMonthsMax: '',
      notes: '',
    });
  };

  const handleEditGuideline = (guideline: GuidelineItem) => {
    // Check if user has permission to edit this guideline
    if (
      !userProfile.isAdmin &&
      guideline.createdBy !== userProfile.userId &&
      guideline.visibility === 'public'
    ) {
      alert("You don't have permission to edit this public guideline.");
      return;
    }

    setIsEditing(true);
    setCurrentGuideline({ ...guideline });
    setAgeRange({
      min: '',
      max: '',
      frequency: '',
      frequencyMonths: '',
      frequencyMonthsMax: '',
      notes: '',
    });
  };

  const handleDeleteGuideline = (id: string) => {
    const guideline = guidelines.find((g) => g.id === id);

    // Check if user has permission to delete this guideline
    if (
      !userProfile.isAdmin &&
      guideline?.createdBy !== userProfile.userId &&
      guideline?.visibility === 'public'
    ) {
      alert("You don't have permission to delete this public guideline.");
      return;
    }

    const updatedGuidelines = GuidelineService.deleteGuideline(
      id,
      userProfile.userId,
      userProfile.isAdmin
    );
    setGuidelines(updatedGuidelines);
  };

  const handleResetDefaults = () => {
    if (!userProfile.isAdmin) {
      alert('Only administrators can reset guidelines to defaults.');
      return;
    }

    if (window.confirm('This will reset all guidelines to default values. Are you sure?')) {
      GuidelineService.resetToDefaults();
      const loadedGuidelines = GuidelineService.getGuidelines(userProfile.userId);
      setGuidelines(loadedGuidelines);
    }
  };

  const handleSaveGuideline = () => {
    // Make sure we have at least one age range
    if (currentGuideline.ageRanges.length === 0) {
      alert('Please add at least one age range for this guideline.');
      return;
    }

    // Make sure we have a proper ID
    const guidelineToSave = {
      ...currentGuideline,
      id: currentGuideline.id || generateId(),
    };

    // Derive the overall frequency description from age ranges
    if (guidelineToSave.ageRanges.length > 0) {
      if (guidelineToSave.ageRanges.every((range) => range.frequency)) {
        if (guidelineToSave.ageRanges.length === 1) {
          // If only one age range, use its frequency
          guidelineToSave.frequency = guidelineToSave.ageRanges[0].frequency;
        } else {
          // If multiple age ranges with frequencies, indicate it varies
          guidelineToSave.frequency = 'Varies by age';
        }
      } else {
        // If some age ranges don't have frequencies, use a default
        guidelineToSave.frequency = 'See age-specific recommendations';
      }
    }

    if (isEditing) {
      const updatedGuidelines = GuidelineService.updateGuideline(
        guidelineToSave,
        userProfile.userId,
        userProfile.isAdmin
      );
      setGuidelines(updatedGuidelines);
    } else {
      const updatedGuidelines = GuidelineService.addGuideline(
        guidelineToSave,
        userProfile.userId,
        userProfile.isAdmin
      );
      setGuidelines(updatedGuidelines);
    }

    // Reset form
    setCurrentGuideline({ ...DEFAULT_GUIDELINE });
    setAgeRange({
      min: '18',
      max: '',
      frequency: '',
      frequencyMonths: '',
      frequencyMonthsMax: '',
      notes: '',
    });
    setTagInput('');
    setIsEditing(false);
  };

  const handleAddAgeRange = () => {
    if (!ageRange.min) {
      alert('Please specify a minimum age');
      return;
    }

    const min = parseInt(ageRange.min);
    const max = ageRange.max ? parseInt(ageRange.max) : null;
    const label = max ? `${min}-${max}` : `${min}+`;

    const newRange: AgeRange = {
      min,
      max,
      label,
    };

    // Add frequency and notes if provided
    if (ageRange.frequency) {
      newRange.frequency = ageRange.frequency;
    }

    // Add frequency in months if provided
    if (ageRange.frequencyMonths) {
      newRange.frequencyMonths = parseInt(ageRange.frequencyMonths);
    }

    // Add maximum frequency in months if provided
    if (ageRange.frequencyMonthsMax) {
      newRange.frequencyMonthsMax = parseInt(ageRange.frequencyMonthsMax);
    }

    if (ageRange.notes) {
      newRange.notes = ageRange.notes;
    }

    setCurrentGuideline({
      ...currentGuideline,
      ageRanges: [...currentGuideline.ageRanges, newRange],
    });

    // Reset the form fields for adding another range
    setAgeRange({
      min: '',
      max: '',
      frequency: '',
      frequencyMonths: '',
      frequencyMonthsMax: '',
      notes: '',
    });
  };

  const handleRemoveAgeRange = (index: number) => {
    setCurrentGuideline({
      ...currentGuideline,
      ageRanges: currentGuideline.ageRanges.filter((_, i) => i !== index),
    });
  };

  const handleGenderChange = (gender: 'male' | 'female' | 'all') => {
    let newGenders = [...currentGuideline.genders];

    if (gender === 'all') {
      newGenders = ['all'];
    } else {
      // Remove 'all' if it exists
      newGenders = newGenders.filter((g) => g !== 'all');

      // Toggle the specific gender
      if (newGenders.includes(gender)) {
        newGenders = newGenders.filter((g) => g !== gender);
      } else {
        newGenders.push(gender);
      }

      // If no gender is selected, default to 'all'
      if (newGenders.length === 0) {
        newGenders = ['all'];
      }
    }

    setCurrentGuideline({
      ...currentGuideline,
      genders: newGenders,
    });
  };

  const handleVisibilityChange = (visibility: 'public' | 'private') => {
    // Only allow admins to set public visibility
    if (visibility === 'public' && !userProfile.isAdmin) {
      alert('Only administrators can create public guidelines.');
      return;
    }

    setCurrentGuideline({
      ...currentGuideline,
      visibility,
    });
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    // Get current tags or initialize empty array
    const currentTags = currentGuideline.tags || [];

    // Check if tag already exists
    if (currentTags.includes(tagInput.toLowerCase().trim())) {
      setTagInput('');
      return;
    }

    // Add new tag
    setCurrentGuideline({
      ...currentGuideline,
      tags: [...currentTags, tagInput.toLowerCase().trim()],
    });

    // Clear input
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!currentGuideline.tags) return;

    setCurrentGuideline({
      ...currentGuideline,
      tags: currentGuideline.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const filterGuidelines = (guidelines: GuidelineItem[]) => {
    if (visibilityFilter === 'all') {
      return guidelines;
    }
    return guidelines.filter((g) => g.visibility === visibilityFilter);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-700">Loading guidelines...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Guideline Builder</h2>
        <div className="flex items-center gap-3">
          {userProfile.isAdmin && (
            <button
              onClick={handleResetDefaults}
              className="text-red-600 hover:text-red-800 flex items-center gap-1"
              title="Reset to default guidelines"
            >
              <FaUndo className="text-sm" /> Reset to Defaults
            </button>
          )}
          <div>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as 'all' | 'public' | 'private')}
              className="border border-gray-300 rounded p-1 text-sm"
            >
              <option value="all">All Guidelines</option>
              <option value="public">Public Only</option>
              <option value="private">My Private Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-700">
            {isEditing ? 'Edit Guideline' : 'Add New Guideline'}
          </h3>
          <button
            onClick={handleAddGuideline}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <FaPlus className="text-sm" /> New Guideline
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={currentGuideline.name}
              onChange={(e) => setCurrentGuideline({ ...currentGuideline, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
              placeholder="e.g. Annual Physical Exam"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={currentGuideline.description}
              onChange={(e) =>
                setCurrentGuideline({ ...currentGuideline, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
              rows={2}
              placeholder="Describe the screening or health check"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={currentGuideline.category}
              onChange={(e) =>
                setCurrentGuideline({ ...currentGuideline, category: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Gender</p>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={currentGuideline.genders.includes('all')}
                  onChange={() => handleGenderChange('all')}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">All</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={currentGuideline.genders.includes('male')}
                  onChange={() => handleGenderChange('male')}
                  className="h-4 w-4 text-blue-600 rounded"
                  disabled={currentGuideline.genders.includes('all')}
                />
                <span className="ml-2 text-sm text-gray-700">Male</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={currentGuideline.genders.includes('female')}
                  onChange={() => handleGenderChange('female')}
                  className="h-4 w-4 text-blue-600 rounded"
                  disabled={currentGuideline.genders.includes('all')}
                />
                <span className="ml-2 text-sm text-gray-700">Female</span>
              </label>
            </div>
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Visibility</p>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={currentGuideline.visibility === 'private'}
                  onChange={() => handleVisibilityChange('private')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                  <FaLock className="text-xs" /> Private (Only visible to you)
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={currentGuideline.visibility === 'public'}
                  onChange={() => handleVisibilityChange('public')}
                  className="h-4 w-4 text-blue-600"
                  disabled={!userProfile.isAdmin}
                />
                <span
                  className={`ml-2 text-sm flex items-center gap-1 ${!userProfile.isAdmin ? 'text-gray-400' : 'text-gray-700'}`}
                >
                  <FaGlobe className="text-xs" /> Public (Visible to all users)
                </span>
              </label>
            </div>
            {!userProfile.isAdmin && (
              <p className="text-xs text-gray-500 mt-1">
                Only administrators can create public guidelines.
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Age Ranges</label>
              <button
                onClick={handleAddAgeRange}
                disabled={!ageRange.min}
                className={`text-sm flex items-center gap-1 ${
                  ageRange.min
                    ? 'text-blue-600 hover:text-blue-800'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaPlus className="text-xs" /> Add Range
              </button>
            </div>

            {/* Display existing age ranges */}
            <div className="space-y-2 mb-3">
              {currentGuideline.ageRanges.map((range, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 border border-gray-100 rounded"
                >
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {range.label}
                  </span>
                  {range.frequency && (
                    <span className="text-sm text-gray-600">
                      Frequency: {range.frequency}
                      {range.frequencyMonths && range.frequencyMonthsMax
                        ? ` (${range.frequencyMonths}-${range.frequencyMonthsMax} months)`
                        : range.frequencyMonths
                          ? ` (min ${range.frequencyMonths} months)`
                          : ''}
                    </span>
                  )}
                  {range.notes && (
                    <span className="text-sm text-gray-500 italic">Note: {range.notes}</span>
                  )}
                  <button
                    onClick={() => handleRemoveAgeRange(index)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Age range form */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div>
                <label htmlFor="ageMin" className="block text-xs text-gray-500 mb-1">
                  Min Age*
                </label>
                <input
                  type="number"
                  id="ageMin"
                  value={ageRange.min}
                  onChange={(e) => setAgeRange({ ...ageRange, min: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="ageMax" className="block text-xs text-gray-500 mb-1">
                  Max Age
                </label>
                <input
                  type="number"
                  id="ageMax"
                  value={ageRange.max}
                  onChange={(e) => setAgeRange({ ...ageRange, max: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                  min="0"
                  placeholder="Empty for no limit"
                />
              </div>
              <div>
                <label htmlFor="ageFrequency" className="block text-xs text-gray-500 mb-1">
                  Age-Specific Frequency
                </label>
                <input
                  type="text"
                  id="ageFrequency"
                  value={ageRange.frequency}
                  onChange={(e) => setAgeRange({ ...ageRange, frequency: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                  placeholder="e.g. Every 1-3 years"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label htmlFor="ageFrequencyMonths" className="block text-xs text-gray-500 mb-1">
                  Min Frequency (months)
                </label>
                <input
                  type="number"
                  id="ageFrequencyMonths"
                  value={ageRange.frequencyMonths}
                  onChange={(e) => setAgeRange({ ...ageRange, frequencyMonths: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                  placeholder="e.g. 12 for annual minimum"
                  min="1"
                />
              </div>
              <div>
                <label htmlFor="ageFrequencyMonthsMax" className="block text-xs text-gray-500 mb-1">
                  Max Frequency (months)
                </label>
                <input
                  type="number"
                  id="ageFrequencyMonthsMax"
                  value={ageRange.frequencyMonthsMax}
                  onChange={(e) => setAgeRange({ ...ageRange, frequencyMonthsMax: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                  placeholder="e.g. 36 for every 3 years maximum"
                  min="1"
                />
              </div>
            </div>
            <div className="mb-2">
              <label htmlFor="ageNotes" className="block text-xs text-gray-500 mb-1">
                Age-Specific Notes
              </label>
              <input
                type="text"
                id="ageNotes"
                value={ageRange.notes}
                onChange={(e) => setAgeRange({ ...ageRange, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                placeholder="e.g. More frequent with risk factors"
              />
            </div>
          </div>

          <div>
            <div className="block text-sm font-medium text-gray-700 mb-1">Tags</div>

            {/* Display current tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {currentGuideline.tags?.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-600 hover:text-red-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add new tag */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="border border-gray-300 rounded-md p-2 text-gray-700 flex-grow"
                placeholder="Add a tag (e.g. cancer, heart)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                onClick={handleAddTag}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 flex items-center gap-1"
              >
                <FaTag className="text-sm" /> Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Press Enter or click Add to add a tag</p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSaveGuideline}
              disabled={!currentGuideline.name || currentGuideline.ageRanges.length === 0}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                ${
                  currentGuideline.name && currentGuideline.ageRanges.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
              <FaSave className="mr-2" /> {isEditing ? 'Update Guideline' : 'Save Guideline'}
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-3">Current Guidelines</h3>
        {guidelines.length === 0 ? (
          <p className="text-gray-500 italic">No guidelines added yet.</p>
        ) : (
          <div className="space-y-3">
            {filterGuidelines(guidelines).map((guideline) => (
              <div
                key={guideline.id}
                className="border border-gray-200 rounded-md p-3 hover:bg-gray-50"
              >
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-800">{guideline.name}</h4>
                    {guideline.visibility === 'public' ? (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FaGlobe className="text-xs" /> Public
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FaLock className="text-xs" /> Private
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {(userProfile.isAdmin ||
                      guideline.createdBy === userProfile.userId ||
                      guideline.visibility === 'private') && (
                      <>
                        <button
                          onClick={() => handleEditGuideline(guideline)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGuideline(guideline.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{guideline.description}</p>

                {/* Age ranges with frequency details */}
                {guideline.ageRanges.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Age-Specific Recommendations:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-1">
                      {guideline.ageRanges.map((range, index) => (
                        <div key={index} className="text-xs bg-gray-50 p-1 rounded">
                          <span className="font-medium">{range.label}:</span>{' '}
                          {range.frequency || guideline.frequency}
                          {range.notes && (
                            <span className="block italic text-gray-500">{range.notes}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {guideline.frequency}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    {guideline.category}
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    Gender:{' '}
                    {guideline.genders.includes('all') ? 'All' : guideline.genders.join(', ')}
                  </span>
                </div>

                {/* Tags */}
                {guideline.tags && guideline.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {guideline.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs capitalize"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidelinesBuilder;

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaGlobe, FaLock, FaPlus, FaSave, FaTag, FaTrash, FaUndo } from 'react-icons/fa';

import GuidelineService from '../../lib/services/guidelineService';
import { UserProfile } from '../../lib/types';
import GuidelineForm from './GuidelineForm';
import { AgeRange, GuidelineItem } from './PersonalizedGuidelines';
import { GuidelineView } from './types';

export const CATEGORIES = [
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

interface Resource {
  name: string;
  url: string;
  description?: string;
  type: 'risk' | 'resource';
}

const DEFAULT_GUIDELINE: GuidelineItem = {
  id: '',
  name: '',
  description: '',
  ageRanges: [{ min: 18, max: null, label: '18+' }],
  genders: ['all'],
  category: 'General Health',
  visibility: 'private',
  resources: [],
};

interface GuidelinesBuilderProps {
  userProfile: UserProfile;
  setCurrentView: (view: GuidelineView) => void;
}

const GuidelinesBuilder = ({ userProfile, setCurrentView }: GuidelinesBuilderProps) => {
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

  // Resources state
  const [resourceName, setResourceName] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceType, setResourceType] = useState<'risk' | 'resource'>('resource');

  // Load guidelines on component mount
  useEffect(() => {
    const loadGuidelines = async () => {
      try {
        const loadedGuidelines = await GuidelineService.getGuidelines(userProfile.userId);
        setGuidelines(loadedGuidelines);
      } catch (error) {
        console.error('Error loading guidelines:', error);
        toast.error('Failed to load guidelines');
      } finally {
        setIsLoading(false);
      }
    };

    loadGuidelines();
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
    });
    setAgeRange({
      min: '18',
      max: '',
      frequency: '',
      frequencyMonths: '',
      frequencyMonthsMax: '',
      notes: '',
    });
    // Reset resource fields
    setResourceName('');
    setResourceUrl('');
    setResourceDescription('');
    setResourceType('resource');
  };

  const handleEditGuideline = (guideline: GuidelineItem) => {
    // Check if user has permission to edit this guideline
    if (
      !userProfile.isAdmin &&
      guideline.createdBy !== userProfile.userId &&
      guideline.visibility === 'public'
    ) {
      toast.error("You don't have permission to edit this public guideline.");
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
    // Reset resource fields
    setResourceName('');
    setResourceUrl('');
    setResourceDescription('');
    setResourceType('resource');
  };

  const handleDeleteGuideline = async (id: string) => {
    const guideline = guidelines.find((g) => g.id === id);

    // Check if user has permission to delete this guideline
    if (
      !userProfile.isAdmin &&
      guideline?.createdBy !== userProfile.userId &&
      guideline?.visibility === 'public'
    ) {
      toast.error("You don't have permission to delete this public guideline.");
      return;
    }

    try {
      const updatedGuidelines = await GuidelineService.deleteGuideline(
        id,
        userProfile.userId,
        userProfile.isAdmin
      );
      setGuidelines(updatedGuidelines);
      toast.success('Guideline deleted successfully');
    } catch (error) {
      console.error('Error deleting guideline:', error);
      toast.error('Failed to delete guideline');
    }
  };

  const handleResetDefaults = () => {
    if (!userProfile.isAdmin) {
      toast.error('Only administrators can reset guidelines to defaults.');
      return;
    }

    if (window.confirm('This will reset all guidelines to default values. Are you sure?')) {
      // This function doesn't exist anymore since we're using the API
      toast.error('This functionality is not available when using the API.');
    }
  };

  const handleSaveGuideline = async () => {
    // Make sure we have at least one age range
    if (currentGuideline.ageRanges.length === 0) {
      toast.error('Please add at least one age range for this guideline.');
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

    try {
      let updatedGuidelines;

      if (isEditing) {
        updatedGuidelines = await GuidelineService.updateGuideline(
          guidelineToSave,
          userProfile.userId,
          userProfile.isAdmin
        );

        toast.success('Guideline updated successfully!');
      } else {
        updatedGuidelines = await GuidelineService.addGuideline(
          guidelineToSave,
          userProfile.userId,
          userProfile.isAdmin
        );

        toast.success('Guideline created successfully!');
        // Navigate to All Guidelines view
        setCurrentView(GuidelineView.AllGuidelinesView);
      }

      setGuidelines(updatedGuidelines);

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
      // Reset resource fields
      setResourceName('');
      setResourceUrl('');
      setResourceDescription('');
      setResourceType('resource');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save guideline:', error);
      toast.error('Failed to save guideline. Please try again.');
    }
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

  const handleAddResource = () => {
    if (!resourceName.trim() || !resourceUrl.trim()) {
      toast.error('Please enter both a name and URL for the resource');
      return;
    }

    const newResource: Resource = {
      name: resourceName.trim(),
      url: resourceUrl.trim(),
      description: resourceDescription.trim() || undefined,
      type: resourceType,
    };

    setCurrentGuideline({
      ...currentGuideline,
      resources: [...(currentGuideline.resources || []), newResource],
    });

    // Reset form fields
    setResourceName('');
    setResourceUrl('');
    setResourceDescription('');
    setResourceType('resource');
  };

  const handleRemoveResource = (index: number) => {
    if (!currentGuideline.resources) return;

    setCurrentGuideline({
      ...currentGuideline,
      resources: currentGuideline.resources.filter((_, i) => i !== index),
    });
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
              className="border border-gray-300 rounded p-1 text-sm text-gray-700"
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
            <div className="block text-sm font-medium text-gray-700 mb-1">
              Resources & Risk Tools
            </div>

            {/* Display current resources */}
            <div className="space-y-2 mb-4">
              {currentGuideline.resources &&
                currentGuideline.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-start p-2 border border-gray-200 rounded bg-gray-50"
                  >
                    <div className="flex-grow">
                      <div className="font-medium">{resource.name}</div>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {resource.url}
                      </a>
                      {resource.description && (
                        <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveResource(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>

            {/* Add new resource */}
            <div className="border border-gray-200 rounded-md p-3 space-y-3 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700">Add Resource</h4>
              <div>
                <label htmlFor="resourceName" className="block text-xs text-gray-500 mb-1">
                  Name*
                </label>
                <input
                  type="text"
                  id="resourceName"
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                  placeholder="e.g. Risk Assessment Tool"
                />
              </div>

              <div>
                <label htmlFor="resourceUrl" className="block text-xs text-gray-500 mb-1">
                  URL*
                </label>
                <input
                  type="url"
                  id="resourceUrl"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                  placeholder="https://example.com/resource"
                />
              </div>

              <div>
                <label htmlFor="resourceDescription" className="block text-xs text-gray-500 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  id="resourceDescription"
                  value={resourceDescription}
                  onChange={(e) => setResourceDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                  placeholder="Brief description of this resource"
                />
              </div>

              <div>
                <label htmlFor="resourceType" className="block text-xs text-gray-500 mb-1">
                  Resource Type
                </label>
                <select
                  id="resourceType"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value as 'resource' | 'risk')}
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                >
                  <option value="resource">Information Resource</option>
                  <option value="risk">Risk Assessment Tool</option>
                </select>
              </div>

              <button
                onClick={handleAddResource}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 w-full"
              >
                Add Resource
              </button>
            </div>
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
    </div>
  );
};

export default GuidelinesBuilder;

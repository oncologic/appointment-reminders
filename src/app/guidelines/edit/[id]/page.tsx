'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

import GuidelineService from '../../../../lib/services/guidelineService';
import { AgeRange, GuidelineItem, UserProfile } from '../../../components/PersonalizedGuidelines';

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

const EditGuidelinePage = () => {
  const params = useParams();
  const router = useRouter();
  const guidelineId = params.id as string;

  const [guideline, setGuideline] = useState<GuidelineItem | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('');
  const [frequencyMonths, setFrequencyMonths] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [genders, setGenders] = useState<('male' | 'female' | 'all')[]>(['all']);
  const [ageRanges, setAgeRanges] = useState<AgeRange[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // New age range form
  const [newAgeRange, setNewAgeRange] = useState({
    min: '',
    max: '',
    frequency: '',
    frequencyMonths: '',
    notes: '',
  });

  // State for editing existing age ranges
  const [editingAgeRangeIndex, setEditingAgeRangeIndex] = useState<number | null>(null);
  const [editingAgeRange, setEditingAgeRange] = useState<{
    min: string;
    max: string;
    frequency: string;
    frequencyMonths: string;
    notes: string;
  }>({
    min: '',
    max: '',
    frequency: '',
    frequencyMonths: '',
    notes: '',
  });

  const [resources, setResources] = useState<
    { name: string; url: string; description?: string; type: 'resource' | 'risk' }[]
  >([]);
  const [resourceName, setResourceName] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceType, setResourceType] = useState<'resource' | 'risk'>('resource');
  const [originalGuideline, setOriginalGuideline] = useState<GuidelineItem | null>(null);

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

      // Load guideline
      const allGuidelines = GuidelineService.getGuidelines(profile.userId);
      const foundGuideline = allGuidelines.find((g) => g.id === guidelineId);

      if (!foundGuideline) {
        setError('Guideline not found.');
        setIsLoading(false);
        return;
      }

      // Check if user has permission to edit
      if (
        !profile.isAdmin &&
        foundGuideline.createdBy !== profile.userId &&
        foundGuideline.visibility === 'public'
      ) {
        setError("You don't have permission to edit this guideline.");
        setIsLoading(false);
        return;
      }

      setGuideline(foundGuideline);

      // Populate form fields
      setName(foundGuideline.name);
      setDescription(foundGuideline.description);
      setFrequency(foundGuideline.frequency || '');
      setFrequencyMonths(foundGuideline.frequencyMonths);
      setCategory(foundGuideline.category);
      setGenders(foundGuideline.genders);
      setAgeRanges(foundGuideline.ageRanges);
      setVisibility(foundGuideline.visibility);
      setTags(foundGuideline.tags || []);
      setResources(foundGuideline.resources || []);

      // If this is a personalized guideline, load the original for reference
      if (foundGuideline.originalGuidelineId) {
        const originalGuidelineItem = allGuidelines.find(
          (g) => g.id === foundGuideline.originalGuidelineId
        );
        if (originalGuidelineItem) {
          setOriginalGuideline(originalGuidelineItem);
        }
      }
    } catch (err) {
      console.error('Error loading guideline:', err);
      setError('An error occurred while loading the guideline.');
    } finally {
      setIsLoading(false);
    }
  }, [guidelineId]);

  const handleGenderChange = (gender: 'male' | 'female' | 'all') => {
    let newGenders = [...genders];

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

    setGenders(newGenders);
  };

  const handleAddAgeRange = () => {
    if (!newAgeRange.min) {
      alert('Please specify a minimum age');
      return;
    }

    const min = parseInt(newAgeRange.min);
    const max = newAgeRange.max ? parseInt(newAgeRange.max) : null;
    const label = max ? `${min}-${max}` : `${min}+`;

    const ageRange: AgeRange = {
      min,
      max,
      label,
    };

    // Add frequency and notes if provided
    if (newAgeRange.frequency) {
      ageRange.frequency = newAgeRange.frequency;
    }

    if (newAgeRange.frequencyMonths) {
      ageRange.frequencyMonths = parseInt(newAgeRange.frequencyMonths);
    }

    if (newAgeRange.notes) {
      ageRange.notes = newAgeRange.notes;
    }

    setAgeRanges([...ageRanges, ageRange]);
    setNewAgeRange({
      min: '',
      max: '',
      frequency: '',
      frequencyMonths: '',
      notes: '',
    });
  };

  const handleRemoveAgeRange = (index: number) => {
    setAgeRanges(ageRanges.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    // Check if tag already exists
    if (tags.includes(tagInput.toLowerCase().trim())) {
      setTagInput('');
      return;
    }

    // Add new tag
    setTags([...tags, tagInput.toLowerCase().trim()]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleVisibilityChange = (vis: 'public' | 'private') => {
    // Only allow admins to set public visibility
    if (vis === 'public' && userProfile && !userProfile.isAdmin) {
      alert('Only administrators can create public guidelines.');
      return;
    }

    setVisibility(vis);
  };

  const handleAddResource = () => {
    if (!resourceName.trim() || !resourceUrl.trim()) {
      alert('Please enter both a name and URL for the resource');
      return;
    }

    const newResource = {
      name: resourceName.trim(),
      url: resourceUrl.trim(),
      description: resourceDescription.trim() || undefined,
      type: resourceType,
    };

    setResources([...resources, newResource]);
    setResourceName('');
    setResourceUrl('');
    setResourceDescription('');
    setResourceType('resource');
  };

  const handleRemoveResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!userProfile || !guideline) return;

    // Validate form
    if (!name.trim()) {
      alert('Please enter a name for the guideline');
      return;
    }

    if (ageRanges.length === 0) {
      alert('Please add at least one age range for this guideline');
      return;
    }

    // Prepare guideline object
    const updatedGuideline: GuidelineItem = {
      ...guideline,
      name,
      description,
      frequency,
      frequencyMonths,
      category,
      genders,
      ageRanges,
      visibility,
      tags,
      resources,
    };

    // Save to service
    GuidelineService.updateGuideline(updatedGuideline, userProfile.userId, userProfile.isAdmin);

    // Navigate back to guideline detail page
    router.push(`/guidelines/${guidelineId}`);
  };

  const handleEditAgeRange = (index: number) => {
    const range = ageRanges[index];
    setEditingAgeRangeIndex(index);
    setEditingAgeRange({
      min: range.min.toString(),
      max: range.max ? range.max.toString() : '',
      frequency: range.frequency || '',
      frequencyMonths: range.frequencyMonths ? range.frequencyMonths.toString() : '',
      notes: range.notes || '',
    });
  };

  const handleUpdateAgeRange = () => {
    if (editingAgeRangeIndex === null) return;
    if (!editingAgeRange.min) {
      alert('Please specify a minimum age');
      return;
    }

    const min = parseInt(editingAgeRange.min);
    const max = editingAgeRange.max ? parseInt(editingAgeRange.max) : null;
    const label = max ? `${min}-${max}` : `${min}+`;

    const updatedRange: AgeRange = {
      min,
      max,
      label,
    };

    // Add frequency and notes if provided
    if (editingAgeRange.frequency) {
      updatedRange.frequency = editingAgeRange.frequency;
    }

    if (editingAgeRange.frequencyMonths) {
      updatedRange.frequencyMonths = parseInt(editingAgeRange.frequencyMonths);
    }

    if (editingAgeRange.notes) {
      updatedRange.notes = editingAgeRange.notes;
    }

    const newAgeRanges = [...ageRanges];
    newAgeRanges[editingAgeRangeIndex] = updatedRange;

    setAgeRanges(newAgeRanges);
    setEditingAgeRangeIndex(null);
    setEditingAgeRange({
      min: '',
      max: '',
      frequency: '',
      frequencyMonths: '',
      notes: '',
    });
  };

  const handleCancelEdit = () => {
    setEditingAgeRangeIndex(null);
    setEditingAgeRange({
      min: '',
      max: '',
      frequency: '',
      frequencyMonths: '',
      notes: '',
    });
  };

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Link
            href={`/guidelines/${guidelineId}`}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <FaArrowLeft className="text-sm" /> Back to guideline
          </Link>
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaSave className="mr-2" /> Save Changes
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Guideline</h1>

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                rows={3}
                placeholder="Describe the screening or health check"
              />
            </div>

            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Overall Frequency (can be overridden in age ranges)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                  placeholder="e.g. Annual, Every 2 years, or 'Varies by age'"
                />
                <div>
                  <label htmlFor="frequencyMonths" className="block text-xs text-gray-500 mb-1">
                    Frequency in Months
                  </label>
                  <input
                    type="number"
                    id="frequencyMonths"
                    value={frequencyMonths === undefined ? '' : frequencyMonths}
                    onChange={(e) =>
                      setFrequencyMonths(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                    placeholder="e.g. 12 for annual, 24 for biennial"
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
                    checked={genders.includes('all')}
                    onChange={() => handleGenderChange('all')}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">All</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={genders.includes('male')}
                    onChange={() => handleGenderChange('male')}
                    className="h-4 w-4 text-blue-600 rounded"
                    disabled={genders.includes('all')}
                  />
                  <span className="ml-2 text-sm text-gray-700">Male</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={genders.includes('female')}
                    onChange={() => handleGenderChange('female')}
                    className="h-4 w-4 text-blue-600 rounded"
                    disabled={genders.includes('all')}
                  />
                  <span className="ml-2 text-sm text-gray-700">Female</span>
                </label>
              </div>
            </div>

            <div>
              <div className="block text-sm font-medium text-gray-700 mb-1">Age Ranges</div>

              <div className="space-y-2 mb-3">
                {ageRanges.map((range, index) => (
                  <div
                    key={index}
                    className="flex flex-col p-3 border border-gray-200 rounded bg-gray-50"
                  >
                    {editingAgeRangeIndex === index ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Min Age*</label>
                            <input
                              type="number"
                              value={editingAgeRange.min}
                              onChange={(e) =>
                                setEditingAgeRange({ ...editingAgeRange, min: e.target.value })
                              }
                              className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Max Age</label>
                            <input
                              type="number"
                              value={editingAgeRange.max}
                              onChange={(e) =>
                                setEditingAgeRange({ ...editingAgeRange, max: e.target.value })
                              }
                              className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                            <input
                              type="text"
                              value={editingAgeRange.frequency}
                              onChange={(e) =>
                                setEditingAgeRange({
                                  ...editingAgeRange,
                                  frequency: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                              placeholder="e.g. Every 3 years for this age group"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Frequency in Months
                            </label>
                            <input
                              type="number"
                              value={editingAgeRange.frequencyMonths}
                              onChange={(e) =>
                                setEditingAgeRange({
                                  ...editingAgeRange,
                                  frequencyMonths: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                              placeholder="e.g. 36 for every 3 years"
                              min="1"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Notes</label>
                          <input
                            type="text"
                            value={editingAgeRange.notes}
                            onChange={(e) =>
                              setEditingAgeRange({ ...editingAgeRange, notes: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                            placeholder="e.g. More frequent for high-risk individuals"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateAgeRange}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {range.label}
                          </span>
                          <div className="space-x-2">
                            <button
                              onClick={() => handleEditAgeRange(index)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemoveAgeRange(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        {range.frequency && (
                          <span className="text-sm text-gray-600 block">
                            Frequency: {range.frequency}
                            {range.frequencyMonths && ` (${range.frequencyMonths} months)`}
                          </span>
                        )}
                        {range.notes && (
                          <span className="text-sm text-gray-500 italic block">
                            Note: {range.notes}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="border border-gray-200 rounded-md p-3 space-y-3 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700">Add Age Range</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="ageMin" className="block text-xs text-gray-500 mb-1">
                      Min Age*
                    </label>
                    <input
                      type="number"
                      id="ageMin"
                      value={newAgeRange.min}
                      onChange={(e) => setNewAgeRange({ ...newAgeRange, min: e.target.value })}
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="ageMax" className="block text-xs text-gray-500 mb-1">
                      Max Age (empty for no limit)
                    </label>
                    <input
                      type="number"
                      id="ageMax"
                      value={newAgeRange.max}
                      onChange={(e) => setNewAgeRange({ ...newAgeRange, max: e.target.value })}
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="ageFrequency" className="block text-xs text-gray-500 mb-1">
                      Age-Specific Frequency
                    </label>
                    <input
                      type="text"
                      id="ageFrequency"
                      value={newAgeRange.frequency}
                      onChange={(e) =>
                        setNewAgeRange({ ...newAgeRange, frequency: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                      placeholder="e.g. Every 3 years for this age group"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ageFrequencyMonths"
                      className="block text-xs text-gray-500 mb-1"
                    >
                      Frequency in Months
                    </label>
                    <input
                      type="number"
                      id="ageFrequencyMonths"
                      value={newAgeRange.frequencyMonths}
                      onChange={(e) =>
                        setNewAgeRange({ ...newAgeRange, frequencyMonths: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                      placeholder="e.g. 36 for every 3 years"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="ageNotes" className="block text-xs text-gray-500 mb-1">
                    Age-Specific Notes
                  </label>
                  <input
                    type="text"
                    id="ageNotes"
                    value={newAgeRange.notes}
                    onChange={(e) => setNewAgeRange({ ...newAgeRange, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                    placeholder="e.g. More frequent for high-risk individuals"
                  />
                </div>

                <button
                  onClick={handleAddAgeRange}
                  className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 w-full"
                >
                  Add Age Range
                </button>
              </div>
            </div>

            <div>
              <div className="block text-sm font-medium text-gray-700 mb-1">Tags</div>

              {/* Display current tags */}
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
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
                  className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <div className="block text-sm font-medium text-gray-700 mb-1">
                Resources & Risk Tools
              </div>

              {/* Display current resources */}
              <div className="space-y-2 mb-4">
                {resources.map((resource, index) => (
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

              {/* Display original guideline resources if this is a personalized version */}
              {originalGuideline &&
                originalGuideline.resources &&
                originalGuideline.resources.length > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-md mb-4">
                    <h5 className="text-sm font-medium text-blue-800 mb-2">
                      Resources & Risk Tools from Original Guideline
                    </h5>
                    <div className="space-y-2">
                      {originalGuideline.resources.map((resource, index) => (
                        <div key={index} className="p-2 border border-blue-200 rounded bg-white">
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
                      ))}
                    </div>
                  </div>
                )}

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

            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">Visibility</p>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={visibility === 'private'}
                    onChange={() => handleVisibilityChange('private')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Private (Only visible to you)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={visibility === 'public'}
                    onChange={() => handleVisibilityChange('public')}
                    className="h-4 w-4 text-blue-600"
                    disabled={!userProfile.isAdmin}
                  />
                  <span
                    className={`ml-2 text-sm ${
                      !userProfile.isAdmin ? 'text-gray-400' : 'text-gray-700'
                    }`}
                  >
                    Public (Visible to all users)
                  </span>
                </label>
              </div>
              {!userProfile.isAdmin && (
                <p className="text-xs text-gray-500 mt-1">
                  Only administrators can create public guidelines.
                </p>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <FaSave className="mr-2" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditGuidelinePage;

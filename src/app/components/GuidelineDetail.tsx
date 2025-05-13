import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FaBookmark,
  FaCalendarPlus,
  FaCheckCircle,
  FaClone,
  FaExternalLinkAlt,
  FaPen,
  FaTag,
} from 'react-icons/fa';

import GuidelineService from '../../lib/services/guidelineService';
import { UserProfile } from '../../lib/types';
import { AgeRange, GuidelineItem } from './PersonalizedGuidelines';

export interface RiskAssessmentTool {
  id: string;
  name: string;
  description: string;
  url: string;
  organization: string;
  tags?: string[];
}

export interface GuidelineResource {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  type: 'professional' | 'patient' | 'research';
}

interface GuidelineDetailProps {
  guideline: GuidelineItem;
  userProfile: UserProfile;
  riskTools?: RiskAssessmentTool[];
  resources?: GuidelineResource[];
  isPersonalized?: boolean;
  onAddToPersonal?: () => void;
  onCustomize?: (guideline: GuidelineItem) => void;
}

const GuidelineDetail = ({
  guideline,
  userProfile,
  riskTools = [],
  resources = [],
  isPersonalized = false,
  onAddToPersonal,
  onCustomize,
}: GuidelineDetailProps) => {
  const [showAllAgeRanges, setShowAllAgeRanges] = useState(false);
  const [showAllResources, setShowAllResources] = useState(false);
  const [updatedGuideline, setUpdatedGuideline] = useState(guideline);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);

  // Use updatedGuideline instead of guideline for display
  useEffect(() => {
    setUpdatedGuideline(guideline);
  }, [guideline]);

  // Determine which age range is relevant for the current user
  const relevantAgeRange = updatedGuideline.ageRanges.find(
    (range) => userProfile.age >= range.min && (range.max === null || userProfile.age <= range.max)
  );

  // Get other age ranges (for expanding view)
  const otherAgeRanges = updatedGuideline.ageRanges.filter((range) => range !== relevantAgeRange);

  // Determine if user can customize this guideline
  const canCustomize = userProfile.isAdmin || updatedGuideline.visibility === 'public';

  // Format dates for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not recorded';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle marking a guideline as completed
  const handleMarkCompleted = async () => {
    const result = await GuidelineService.markGuidelineCompleted(updatedGuideline.id);
    if (result) {
      setUpdatedGuideline(result);
      setCompletedMessage(
        'Marked as completed. Your next screening is due ' + formatDate(result.nextDueDate)
      );

      // Clear message after 5 seconds
      setTimeout(() => {
        setCompletedMessage(null);
      }, 5000);
    }
  };

  // Handle creating a personalized copy of this guideline
  const handleCreatePersonalCopy = async () => {
    if (!userProfile) return;

    try {
      // Create a personalized copy using the service method
      const personalizedGuideline = await GuidelineService.createPersonalizedGuideline(
        guideline.id,
        userProfile.userId
      );

      // Notify parent component
      if (onCustomize) {
        onCustomize(personalizedGuideline);
      }
    } catch (error) {
      console.error('Error creating personalized guideline:', error);
      alert('There was an error creating your personalized guideline.');
    }
  };

  // Check if this is a personalized version with an original
  const isPersonalizedVersion = Boolean(guideline.originalGuidelineId);

  // Get original guideline if this is a personalized version
  const [originalGuideline, setOriginalGuideline] = useState<GuidelineItem | null>(null);
  useEffect(() => {
    const loadOriginalGuideline = async () => {
      if (guideline.originalGuidelineId) {
        const guidelines = await GuidelineService.getGuidelines();
        const original = guidelines.find(
          (g: GuidelineItem) => g.id === guideline.originalGuidelineId
        );
        if (original) {
          setOriginalGuideline(original);
        }
      }
    };

    loadOriginalGuideline();
  }, [guideline.originalGuidelineId]);

  // Filter resources to show based on expandable view
  const displayedResources = showAllResources ? resources : resources.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{updatedGuideline.name}</h1>
          <div className="flex gap-2">
            {!isPersonalized && onAddToPersonal && (
              <button
                onClick={onAddToPersonal}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600"
              >
                <FaBookmark className="mr-1" /> Add to My Guidelines
              </button>
            )}
            {canCustomize && (
              <button
                onClick={handleCreatePersonalCopy}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaClone className="mr-1" /> Create Personal Copy
              </button>
            )}
            <Link
              href={`/appointments/new?screening=${encodeURIComponent(updatedGuideline.name)}`}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600"
            >
              <FaCalendarPlus className="mr-1" /> Schedule
            </Link>
          </div>
        </div>

        <p className="text-gray-600 text-lg mb-6">{updatedGuideline.description}</p>

        {/* Completion status */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Completion Status</h2>
              <div className="mt-2 space-y-1">
                {updatedGuideline.lastCompletedDate && (
                  <p className="text-gray-700">
                    <span className="font-medium">Last completed:</span>{' '}
                    {formatDate(updatedGuideline.lastCompletedDate)}
                  </p>
                )}
                {updatedGuideline.nextDueDate && (
                  <p className="text-gray-700">
                    <span className="font-medium">Next due:</span>{' '}
                    {formatDate(updatedGuideline.nextDueDate)}
                  </p>
                )}
                {!updatedGuideline.lastCompletedDate && !updatedGuideline.nextDueDate && (
                  <p className="text-gray-500 italic">No completion data available</p>
                )}
              </div>
            </div>

            {/* <button
              onClick={handleMarkCompleted}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <FaCheckCircle className="mr-2" /> Mark as Completed Today
            </button> */}
          </div>

          {completedMessage && (
            <div className="mt-3 p-3 bg-green-50 text-green-800 rounded-md border border-green-200">
              {completedMessage}
            </div>
          )}
        </div>

        {/* Current age-specific recommendation */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Recommendation for Your Age Group
          </h2>
          {relevantAgeRange ? (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <h3 className="font-medium text-blue-800">
                  Ages {relevantAgeRange.label}
                  <FaCheckCircle className="ml-2 inline-block text-green-600" />
                </h3>
                <span className="text-sm font-medium bg-white text-blue-800 px-3 py-1 rounded-full">
                  Your Age Group
                </span>
              </div>
              <p className="text-gray-700">
                <span className="font-medium">Frequency:</span>{' '}
                {relevantAgeRange.frequency || guideline.frequency}
              </p>
              {relevantAgeRange.notes && (
                <p className="text-gray-700 mt-1">
                  <span className="font-medium">Notes:</span> {relevantAgeRange.notes}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-md">
              <p className="text-gray-700">
                No specific recommendation for your current age ({userProfile.age}).
              </p>
            </div>
          )}

          {/* Other age recommendations (expandable) */}
          {otherAgeRanges.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowAllAgeRanges(!showAllAgeRanges)}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                {showAllAgeRanges ? 'Hide' : 'Show'} recommendations for other age groups
                <svg
                  className={`ml-1 h-4 w-4 transform ${
                    showAllAgeRanges ? 'rotate-180' : ''
                  } transition-transform`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {showAllAgeRanges && (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {otherAgeRanges.map((range, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border-l-4 border-gray-300 p-3 rounded-md"
                    >
                      <h3 className="font-medium text-gray-800">Ages {range.label}</h3>
                      <p className="text-gray-700 text-sm">
                        <span className="font-medium">Frequency:</span>{' '}
                        {range.frequency || guideline.frequency}
                      </p>
                      {range.notes && (
                        <p className="text-gray-700 text-sm mt-1">
                          <span className="font-medium">Notes:</span> {range.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Risk Assessment Tools and Resources Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Resources & Risk Assessments</h2>

          {/* Risk Assessment Tools */}
          {riskTools.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Risk Assessment Tools</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {riskTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md"
                  >
                    <h3 className="font-medium text-gray-800 mb-1">{tool.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{tool.description}</p>
                    <p className="text-xs text-gray-500 mb-3">Source: {tool.organization}</p>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Go to assessment tool <FaExternalLinkAlt className="ml-1 text-xs" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guideline resources */}
          {guideline.resources && guideline.resources.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                {isPersonalizedVersion ? 'Personalized Resources' : 'Available Resources'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guideline.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <h4 className="font-medium text-gray-800">{resource.name}</h4>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm block mt-1"
                    >
                      {resource.url}
                    </a>
                    {resource.description && (
                      <p className="text-sm text-gray-600 mt-2">{resource.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Original guideline resources */}
          {isPersonalizedVersion &&
            originalGuideline?.resources &&
            originalGuideline.resources.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  Resources from Original Guideline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {originalGuideline.resources.map((resource, index) => (
                    <div key={index} className="border border-blue-100 bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800">{resource.name}</h4>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm block mt-1"
                      >
                        {resource.url}
                      </a>
                      {resource.description && (
                        <p className="text-sm text-gray-600 mt-2">{resource.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {(!guideline.resources || guideline.resources.length === 0) &&
            (!originalGuideline?.resources || originalGuideline.resources.length === 0) &&
            riskTools.length === 0 && (
              <p className="text-gray-500 italic">
                No resources or risk assessment tools available for this guideline.
              </p>
            )}
        </div>

        {/* Customization Section */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Customize This Guideline</h2>
          <p className="text-gray-600 mb-4">
            Want to personalize this guideline based on your specific health needs?
          </p>
          <div className="flex gap-3">
            <Link
              href={`/guidelines/edit/${guideline.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaPen className="mr-2" /> Edit Guideline
            </Link>
            <button
              onClick={handleCreatePersonalCopy}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaClone className="mr-2" /> Create Personal Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelineDetail;

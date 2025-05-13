'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { GuidelineView } from './types';

interface AgeRange {
  min: number | null;
  max: number | null;
  label: string;
  frequency?: string;
  frequencyMonths?: number;
  frequencyMonthsMax?: number;
  notes?: string;
}

interface Resource {
  name: string;
  url: string;
  description?: string;
  type: 'risk' | 'resource';
}

interface GuidelineData {
  name: string;
  description: string;
  category: string;
  genders: string[];
  visibility: string;
  tags?: string[];
  frequency?: string;
  frequencyMonths?: number;
  frequencyMonthsMax?: number;
  resources?: Resource[];
}

interface GuidelineFormProps {
  guideline: GuidelineData;
  ageRanges: AgeRange[];
  resources?: Resource[];
  setCurrentView: (view: GuidelineView) => void;
}

const GuidelineForm: React.FC<GuidelineFormProps> = ({
  guideline,
  ageRanges,
  resources = [],
  setCurrentView,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/guidelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guideline,
          ageRanges,
          resources,
        }),
      });

      if (response.status === 201) {
        // Show success toast
        toast.success('Guideline created successfully!');

        // Navigate to All Guidelines view
        setCurrentView(GuidelineView.AllGuidelinesView);

        // Refresh the page data
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create guideline');
      }
    } catch (error) {
      console.error('Error creating guideline:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`
          bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 
          transition flex items-center 
          ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
        `}
      >
        {isSubmitting ? 'Saving...' : 'Save Guideline'}
      </button>
    </div>
  );
};

export default GuidelineForm;

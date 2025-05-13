'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { GuidelineView } from '../components/types';

interface AgeRange {
  min: number | null;
  max: number | null;
  label: string;
  frequency?: string;
  frequencyMonths?: number;
  frequencyMonthsMax?: number;
  notes?: string;
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
}

interface UseGuidelineSubmitProps {
  setCurrentView: (view: GuidelineView) => void;
  onSuccess?: () => void;
}

export const useGuidelineSubmit = ({ setCurrentView, onSuccess }: UseGuidelineSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const submitGuideline = async (guideline: GuidelineData, ageRanges: AgeRange[]) => {
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
        }),
      });

      if (response.status === 201) {
        // Show success toast
        toast.success('Guideline created successfully!');

        // Navigate to All Guidelines view
        setCurrentView(GuidelineView.AllGuidelinesView);

        // Refresh the page data
        router.refresh();

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }

        return true;
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create guideline');
        return false;
      }
    } catch (error) {
      console.error('Error creating guideline:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitGuideline,
    isSubmitting,
  };
};

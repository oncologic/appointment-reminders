import { AgeRange } from './PersonalizedGuidelines';

export interface ScreeningResult {
  date: string;
  provider: {
    id: string;
    name: string;
    specialty?: string;
  };
  result: 'clear' | 'abnormal' | 'pending';
  notes?: string;
  providerDetails?: {
    name: string;
    specialty?: string;
    clinic?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface ScreeningRecommendation {
  id: string;
  name: string;
  description: string;
  frequency: string;
  ageRange: AgeRange[];
  ageRangeDetails: AgeRange[];
  tags?: string[];
  lastCompleted?: string;
  dueDate: string;
  status: 'completed' | 'due' | 'overdue' | 'upcoming';
  notes?: string;
  previousResults?: ScreeningResult[];
}

export enum GuidelineView {
  MyScreenings = 'myScreenings',
  AllGuidelinesView = 'allGuidelines',
  NewGuideline = 'newGuideline',
  UserProfile = 'userProfile',
  ManageGuidelinesAdmin = 'manageGuidelinesAdmin',
}

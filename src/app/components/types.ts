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
  frequency?: string;
  frequencyMonths?: number;
  startAge?: number;
  ageRange: AgeRange[];
  ageRangeDetails: AgeRange[];
  status: 'due' | 'upcoming' | 'overdue' | 'completed';
  dueDate?: string;
  lastCompleted?: string;
  notes?: string;
  tags?: string[];
  previousResults?: ScreeningResult[];
  icon?: string;
  iconColor?: string;
  bgColor?: string;
  friendRecommendations?: any[];
  schedulePath?: string;
  detailsPath?: string;
}

export enum GuidelineView {
  MyScreenings = 'myScreenings',
  AllGuidelinesView = 'allGuidelines',
  NewGuideline = 'newGuideline',
  UserProfile = 'userProfile',
  ManageGuidelinesAdmin = 'manageGuidelinesAdmin',
}

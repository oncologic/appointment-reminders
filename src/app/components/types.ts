import { AgeRange } from './PersonalizedGuidelines';

export interface ScreeningRecommendation {
  id: string;
  name: string;
  description: string;
  frequency: string;
  ageRange: string;
  ageRangeDetails: AgeRange[];
  tags?: string[];
  lastCompleted?: string;
  dueDate: string;
  status: 'completed' | 'due' | 'overdue' | 'upcoming';
  notes?: string;
}

export enum GuidelineView {
  RecommendedView,
  AllGuidelinesView,
  ManageGuidelines,
  UserProfile,
}

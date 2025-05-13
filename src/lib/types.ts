export interface UserProfile {
  id: string;
  name: string;
  gender: string;
  age: number;
  dateOfBirth?: string;
  email?: string;
  familyHistory?: string[];
  conditions?: string[];
  medications?: string[];
  allergies?: string[];
  lastPhysical?: string;
  height?: string;
  weight?: string;
  bloodType?: string;
  avatarUrl?: string;
}

// Enhanced UserProfile that includes database fields
export interface UserProfileDB {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  created_at: string;
  updated_at: string;
  admin_role?: string;
}

// Appointment type
export interface Appointment {
  id: string;
  date: Date;
  title: string;
  type: 'Examination' | 'Treatment' | 'Consultation';
  provider: string;
  providerId?: string;
  location: string;
  notes?: string;
  detailsPath: string;
  completed: boolean;
  // Additional fields for tooltip display
  description?: string;
  startTime?: string;
  endTime?: string;
  doctor?: string;
  result?: {
    status: string;
    notes: string;
    date: string;
  };
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  age: number;
  dateOfBirth?: string; // ISO date string format
  gender: 'male' | 'female' | 'other';
  riskFactors: {
    [key: string]: boolean | string;
  };
  isAdmin: boolean;
  userId: string;
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
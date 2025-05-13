import { createClient } from '@/lib/supabase/server';
import { UserProfile, UserProfileDB } from '@/lib/types';

import { getUserAdminRole } from './roleService';

/**
 * Get a user profile by ID
 */
export async function getUserById(userId: string): Promise<UserProfileDB | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users')
    .select(
      `
      user_id,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      gender,
      created_at,
      updated_at
    `
    )
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  if (!data) return null;

  // Get the user's admin role
  const { role: adminRole } = await getUserAdminRole(userId);

  return {
    ...data,
    admin_role: adminRole,
  };
}

/**
 * Update a user's profile information
 */
export async function updateUserProfile(
  userId: string,
  userProfile: Partial<UserProfileDB>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Remove fields that shouldn't be directly updated
  const { user_id, created_at, updated_at, admin_role, ...updateData } = userProfile;

  const { error } = await supabase.from('users').update(updateData).eq('user_id', userId);

  if (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Convert database user profile to application user profile format
 */
export function convertToUserProfile(dbProfile: UserProfileDB): UserProfile {
  // Calculate age from date_of_birth
  const age = dbProfile.date_of_birth ? calculateAge(new Date(dbProfile.date_of_birth)) : 0;

  return {
    firstName: dbProfile.first_name || '',
    lastName: dbProfile.last_name || '',
    age,
    dateOfBirth: dbProfile.date_of_birth,
    gender: (dbProfile.gender as 'male' | 'female' | 'other') || 'other',
    riskFactors: {}, // Risk factors would need to be loaded separately
    isAdmin: dbProfile.admin_role === 'admin',
    userId: dbProfile.user_id,
  };
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const m = today.getMonth() - dateOfBirth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
}

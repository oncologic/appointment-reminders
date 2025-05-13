import { UserProfile, UserProfileDB } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

/**
 * Get a user profile by ID
 */
export async function getUserById(userId: string): Promise<UserProfileDB | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select(`
      user_id,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      gender,
      created_at,
      updated_at,
      user_admin_roles (
        admin_roles (
          role
        )
      )
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  if (!data) return null;

  // Extract admin role from the nested structure
  let adminRole = 'regular';
  if (data.user_admin_roles && 
      data.user_admin_roles.length > 0 && 
      data.user_admin_roles[0].admin_roles && 
      Array.isArray(data.user_admin_roles[0].admin_roles) &&
      data.user_admin_roles[0].admin_roles[0]?.role) {
    adminRole = data.user_admin_roles[0].admin_roles[0].role;
  }

  return {
    ...data,
    admin_role: adminRole
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

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('user_id', userId);

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
  const age = dbProfile.date_of_birth
    ? calculateAge(new Date(dbProfile.date_of_birth))
    : 0;

  return {
    name: `${dbProfile.first_name || ''} ${dbProfile.last_name || ''}`.trim(),
    age,
    dateOfBirth: dbProfile.date_of_birth,
    gender: (dbProfile.gender as 'male' | 'female' | 'other') || 'other',
    riskFactors: {}, // Risk factors would need to be loaded separately
    isAdmin: dbProfile.admin_role === 'admin',
    userId: dbProfile.user_id
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
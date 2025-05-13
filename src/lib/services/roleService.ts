import { createClient } from '@/lib/supabase/server';

/**
 * Get the highest admin role for a user
 * @param userId The user ID to check
 * @returns An object with the highest role and isAdmin flag
 */
export async function getUserAdminRole(
  userId: string
): Promise<{ role: string; isAdmin: boolean }> {
  const supabase = createClient();

  const { data: userData } = await supabase
    .from('users')
    .select(
      `
      user_admin_roles (
        admin_roles (
          role
        )
      )
    `
    )
    .eq('user_id', userId)
    .single();

  // Extract admin role from the nested structure
  let adminRole = 'regular';
  if (userData?.user_admin_roles && userData.user_admin_roles.length > 0) {
    // Define role hierarchy (higher index = higher priority)
    const roleHierarchy = ['regular', 'contributor', 'expert', 'admin'];

    // Extract all roles from the user_admin_roles array
    const userRoles = userData.user_admin_roles
      .map((userRole: any) => {
        // Type assertion to handle the ambiguous structure
        const adminRoles = userRole.admin_roles as any;
        if (Array.isArray(adminRoles)) {
          return adminRoles[0]?.role;
        } else {
          return adminRoles?.role;
        }
      })
      .filter(Boolean);

    // Find the highest role based on hierarchy position
    if (userRoles.length > 0) {
      let highestRoleIndex = -1;

      userRoles.forEach((role: string) => {
        const roleIndex = roleHierarchy.indexOf(role);
        if (roleIndex > highestRoleIndex) {
          highestRoleIndex = roleIndex;
          adminRole = role;
        }
      });
    }
  }

  return {
    role: adminRole,
    isAdmin: adminRole === 'admin',
  };
}

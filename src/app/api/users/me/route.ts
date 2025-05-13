import { NextRequest, NextResponse } from 'next/server';
import { getUserById, convertToUserProfile } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';

// GET /api/users/me
export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client for the current request
    const supabase = createClient();
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const userProfile = await getUserById(userId);
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Convert to application format
    const formattedProfile = convertToUserProfile(userProfile);
    
    return NextResponse.json(formattedProfile);
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
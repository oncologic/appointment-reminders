import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserProfile, convertToUserProfile } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';

// GET /api/users/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Check if the user is requesting their own profile or has admin permissions
    if (session.user.id !== params.id) {
      // TODO: Implement admin permission check
      // For now we'll only allow users to access their own profile
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    const userProfile = await getUserById(params.id);
    
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

// PATCH /api/users/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Check if the user is updating their own profile or has admin permissions
    if (session.user.id !== params.id) {
      // TODO: Implement admin permission check
      // For now we'll only allow users to update their own profile
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    // Get the request body
    const updateData = await request.json();
    
    // Update the user profile
    const result = await updateUserProfile(params.id, updateData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update user profile' },
        { status: 400 }
      );
    }
    
    // Get and return the updated profile
    const updatedProfile = await getUserById(params.id);
    
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  // Create Supabase client
  const supabase = createClient();

  // Get the current session to determine user ID if not provided
  let userIdToUse = userId;

  if (!userIdToUse) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    userIdToUse = session.user.id;
  }

  // Query for screenings belonging to the user
  const { data: screenings, error } = await supabase
    .from('user_screenings')
    .select('*, guidelines(*)')
    .eq('user_id', userIdToUse);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ screenings });
}

export async function POST(request: NextRequest) {
  // Create Supabase client
  const supabase = createClient();

  // Get session for authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Only allow authenticated users to create screenings
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Parse request body
    const requestData = await request.json();

    // Ensure the user_id in the request matches the authenticated user
    // or allow override if explicitly provided (for admin purposes)
    if (!requestData.user_id) {
      requestData.user_id = userId;
    }

    // Add created_at and updated_at timestamps
    requestData.created_at = new Date().toISOString();
    requestData.updated_at = new Date().toISOString();

    // Insert the screening record
    const { data: newScreening, error: screeningError } = await supabase
      .from('user_screenings')
      .insert(requestData)
      .select()
      .single();

    if (screeningError) {
      return NextResponse.json({ error: screeningError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        screening: newScreening,
        message: 'Screening created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating screening:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

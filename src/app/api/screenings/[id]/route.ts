import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const guidelineId = params.id;

  // Create Supabase client
  const supabase = createClient();

  // Get session for authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Only allow authenticated users
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Query for the specific screening
  const { data: screening, error } = await supabase
    .from('user_screenings')
    .select('*, guidelines(*)')
    .eq('guideline_id', guidelineId)
    .eq('user_id', userId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!screening) {
    return NextResponse.json({ error: 'Screening not found' }, { status: 404 });
  }

  return NextResponse.json({ screening });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guidelineId = params.id;

  // Create Supabase client
  const supabase = createClient();

  // Get session for authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Only allow authenticated users
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Optional: Parse request to check if we need a specific user ID (for admin purposes)
  let requestData = {};
  try {
    requestData = await request.json();
  } catch (error) {
    // If no JSON body provided, use empty object
    requestData = {};
  }

  const targetUserId = (requestData as any).user_id || userId;

  // For security, only allow deleting other users' screenings if admin role check would go here
  // For now, only allow users to delete their own screenings
  if (targetUserId !== userId) {
    // Here you'd add admin role check before proceeding
    return NextResponse.json(
      { error: "Unauthorized to delete other users' screenings" },
      { status: 403 }
    );
  }

  // Delete the screening
  const { error } = await supabase
    .from('user_screenings')
    .delete()
    .eq('guideline_id', guidelineId)
    .eq('user_id', targetUserId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

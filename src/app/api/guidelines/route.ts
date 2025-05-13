import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const visibility = searchParams.get('visibility');
  const category = searchParams.get('category');
  const query = searchParams.get('q');
  
  // Create Supabase client
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  // Get the current session to determine user ID
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  // Start building the query
  let guidelinesQuery = supabase
    .from('guidelines')
    .select(`
      *,
      guideline_age_ranges(*)
    `);
    
  // Filter by visibility
  if (visibility) {
    guidelinesQuery = guidelinesQuery.eq('visibility', visibility);
  } else if (userId) {
    // If no visibility filter but user is logged in, show public + their private
    guidelinesQuery = guidelinesQuery.or(`visibility.eq.public,and(visibility.eq.private,created_by.eq.${userId})`);
  } else {
    // If no user, only show public
    guidelinesQuery = guidelinesQuery.eq('visibility', 'public');
  }
  
  // Apply additional filters
  if (category) {
    guidelinesQuery = guidelinesQuery.eq('category', category);
  }
  
  // Apply text search if query parameter is provided
  if (query) {
    guidelinesQuery = guidelinesQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  }
  
  // Execute the query
  const { data: guidelines, error } = await guidelinesQuery;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ guidelines });
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  // Get session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // Only allow authenticated users to create guidelines
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const userId = session.user.id;
    
    // Parse request body
    const requestData = await request.json();
    const { guideline, ageRanges } = requestData;
    
    // Make sure logged-in user is the creator
    guideline.created_by = userId;
    
    // Non-admin users can only create private guidelines
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
      
    const isAdmin = userRole?.role === 'admin';
    if (!isAdmin && guideline.visibility === 'public') {
      guideline.visibility = 'private';
    }
    
    // Insert the guideline
    const { data: newGuideline, error: guidelineError } = await supabase
      .from('guidelines')
      .insert(guideline)
      .select()
      .single();
      
    if (guidelineError) {
      return NextResponse.json({ error: guidelineError.message }, { status: 500 });
    }
    
    // Insert age ranges if provided
    if (ageRanges && ageRanges.length > 0) {
      // Add guideline_id to each age range
      const ageRangesWithGuidelineId = ageRanges.map((range: any) => ({
        ...range,
        guideline_id: newGuideline.id
      }));
      
      const { error: ageRangesError } = await supabase
        .from('guideline_age_ranges')
        .insert(ageRangesWithGuidelineId);
        
      if (ageRangesError) {
        return NextResponse.json({ error: ageRangesError.message }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      guideline: newGuideline,
      message: 'Guideline created successfully' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating guideline:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
} 
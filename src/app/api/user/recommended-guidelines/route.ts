import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  // Create Supabase client
  const cookieStore = cookies();
  const supabase = createClient();
  
  // Get session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // Only allow authenticated users to access recommendations
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const userId = session.user.id;
    
    // Get the user's profile for personalization
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (profileError) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    const { age, gender, risk_factors } = userProfile;
    
    // Query parameters for optional filtering
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const includeUpcoming = searchParams.get('upcoming') === 'true';
    const upcomingYears = parseInt(searchParams.get('upcoming_years') || '5', 10);
    
    // Base query for public guidelines
    let guidelinesQuery = supabase
      .from('guidelines')
      .select(`
        *,
        guideline_age_ranges(*)
      `)
      .eq('visibility', 'public');
    
    // Add category filter if specified
    if (category) {
      guidelinesQuery = guidelinesQuery.eq('category', category);
    }
    
    // Execute query to get all potential guidelines
    const { data: allGuidelines, error: guidelinesError } = await guidelinesQuery;
    
    if (guidelinesError) {
      return NextResponse.json({ error: guidelinesError.message }, { status: 500 });
    }
    
    // Filter guidelines based on user profile
    const recommendations = {
      current: [] as any[],   // Guidelines that apply now
      upcoming: [] as any[]   // Guidelines that will apply in the future
    };
    
    for (const guideline of allGuidelines) {
      // First, check gender relevance
      const genderFilter = guideline.genders;
      if (!genderFilter.includes('all') && !genderFilter.includes(gender)) {
        continue; // Skip if not applicable to this gender
      }
      
      // Then, check age relevance
      const ageRanges = guideline.guideline_age_ranges;
      let currentlyRelevant = false;
      let upcomingRelevant = false;
      
      for (const range of ageRanges) {
        // Check if in current age range
        if (age >= range.min_age && (range.max_age === null || age <= range.max_age)) {
          currentlyRelevant = true;
          break;
        }
        
        // Check if in upcoming age range (if requested)
        if (includeUpcoming && range.min_age > age && range.min_age <= age + upcomingYears) {
          upcomingRelevant = true;
          // Don't break, continue checking if there's a current age range
        }
      }
      
      if (currentlyRelevant) {
        recommendations.current.push({
          ...guideline,
          status: 'current'
        });
      } else if (upcomingRelevant) {
        recommendations.upcoming.push({
          ...guideline,
          status: 'upcoming'
        });
      }
    }
    
    // Get the user's selections to mark selected guidelines
    const { data: userSelections, error: selectionsError } = await supabase
      .from('user_guideline_selections')
      .select('guideline_id')
      .eq('user_id', userId);
      
    if (!selectionsError && userSelections) {
      const selectedIds = userSelections.map((s: { guideline_id: string }) => s.guideline_id);
      
      // Mark selected guidelines
      recommendations.current = recommendations.current.map(g => ({
        ...g,
        isSelected: selectedIds.includes(g.id)
      }));
      
      recommendations.upcoming = recommendations.upcoming.map(g => ({
        ...g,
        isSelected: selectedIds.includes(g.id)
      }));
    }
    
    return NextResponse.json({
      recommendations,
      userProfile: {
        age,
        gender,
        risk_factors
      }
    });
    
  } catch (error) {
    console.error('Error getting guideline recommendations:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 
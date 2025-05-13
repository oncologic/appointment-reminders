import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Create Supabase client
  const cookieStore = cookies();
  const supabase = createClient();
  
  // Get session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // Only allow authenticated users to personalize guidelines
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const userId = session.user.id;
    
    // First check if the original guideline exists
    const { data: originalGuideline, error: guidelineError } = await supabase
      .from('guidelines')
      .select('*')
      .eq('id', id)
      .single();
      
    if (guidelineError) {
      if (guidelineError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Guideline not found' }, { status: 404 });
      }
      return NextResponse.json({ error: guidelineError.message }, { status: 500 });
    }
    
    // Get age ranges for the original guideline
    const { data: originalAgeRanges, error: ageRangesError } = await supabase
      .from('guideline_age_ranges')
      .select('*')
      .eq('guideline_id', id);
      
    if (ageRangesError) {
      return NextResponse.json({ error: ageRangesError.message }, { status: 500 });
    }
    
    // Get resources for the original guideline
    const { data: originalResources, error: resourcesError } = await supabase
      .from('guideline_resources')
      .select('*')
      .eq('guideline_id', id);
      
    if (resourcesError) {
      return NextResponse.json({ error: resourcesError.message }, { status: 500 });
    }
    
    // Parse request body for customization options
    const requestData = await request.json();
    const { customizations = {} } = requestData;
    
    // Create a new personalized guideline
    const personalizedGuideline = {
      name: `${originalGuideline.name} (Personalized)`,
      description: originalGuideline.description,
      frequency: originalGuideline.frequency,
      frequency_months: originalGuideline.frequency_months,
      frequency_months_max: originalGuideline.frequency_months_max,
      category: originalGuideline.category,
      genders: originalGuideline.genders,
      visibility: 'private',
      created_by: userId,
      tags: originalGuideline.tags,
      original_guideline_id: id,
      ...customizations  // Apply any customizations from the request
    };
    
    // Insert the new personalized guideline
    const { data: newGuideline, error: insertError } = await supabase
      .from('guidelines')
      .insert(personalizedGuideline)
      .select()
      .single();
      
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    
    // Copy over the age ranges with the new guideline ID
    if (originalAgeRanges && originalAgeRanges.length > 0) {
      const newAgeRanges = originalAgeRanges.map((range: any) => {
        // Remove ID from original to get a new one generated
        const { id: rangeId, guideline_id, ...rangeData } = range;
        return {
          ...rangeData,
          guideline_id: newGuideline.id,
          // Apply any age range customizations here if needed
        };
      });
      
      const { error: ageRangeInsertError } = await supabase
        .from('guideline_age_ranges')
        .insert(newAgeRanges);
        
      if (ageRangeInsertError) {
        // If this fails, delete the guideline to avoid orphaned records
        await supabase.from('guidelines').delete().eq('id', newGuideline.id);
        return NextResponse.json({ error: ageRangeInsertError.message }, { status: 500 });
      }
    }
    
    // Copy over the resources with the new guideline ID
    if (originalResources && originalResources.length > 0) {
      const newResources = originalResources.map((resource: any) => {
        // Remove ID from original to get a new one generated
        const { id: resourceId, guideline_id, ...resourceData } = resource;
        return {
          ...resourceData,
          guideline_id: newGuideline.id
        };
      });
      
      const { error: resourceInsertError } = await supabase
        .from('guideline_resources')
        .insert(newResources);
        
      if (resourceInsertError) {
        console.error('Error copying resources:', resourceInsertError);
        // Don't fail the request just for resources
      }
    }
    
    // Add this guideline to the user's selected guidelines (user_guideline_selections)
    const { error: selectionError } = await supabase
      .from('user_guideline_selections')
      .insert({
        user_id: userId,
        guideline_id: newGuideline.id,
        selected_at: new Date().toISOString()
      });
      
    if (selectionError) {
      console.error('Error adding to user selections:', selectionError);
      // Don't fail just for selection error
    }
    
    return NextResponse.json({
      guideline: newGuideline,
      message: 'Guideline personalized successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error personalizing guideline:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 
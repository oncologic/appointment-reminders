import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  // Create Supabase client
  const supabase = createClient();
  
  // Get session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // Only allow authenticated users to view their selections
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const userId = session.user.id;
    
    // Fetch the user's guideline selections with guideline details
    const { data, error } = await supabase
      .from('user_guideline_selections')
      .select(`
        *,
        guideline:guideline_id(
          *,
          guideline_age_ranges(*),
          guideline_resources(*)
        )
      `)
      .eq('user_id', userId)
      .order('selected_at', { ascending: false });
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ selections: data });
    
  } catch (error) {
    console.error('Error fetching guideline selections:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Create Supabase client
  const supabase = createClient();
  
  // Get session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // Only allow authenticated users to create selections
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const userId = session.user.id;
    
    // Parse request body
    const { guidelineId } = await request.json();
    
    if (!guidelineId) {
      return NextResponse.json({ error: 'Guideline ID is required' }, { status: 400 });
    }
    
    // Check if the guideline exists
    const { data: guideline, error: guidelineError } = await supabase
      .from('guidelines')
      .select('*')
      .eq('id', guidelineId)
      .single();
      
    if (guidelineError) {
      if (guidelineError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Guideline not found' }, { status: 404 });
      }
      return NextResponse.json({ error: guidelineError.message }, { status: 500 });
    }
    
    // Check if the selection already exists
    const { data: existingSelection, error: selectionError } = await supabase
      .from('user_guideline_selections')
      .select('*')
      .eq('user_id', userId)
      .eq('guideline_id', guidelineId)
      .maybeSingle();
      
    if (selectionError) {
      return NextResponse.json({ error: selectionError.message }, { status: 500 });
    }
    
    // If the selection already exists, update the selected_at timestamp
    if (existingSelection) {
      const { data: updatedSelection, error: updateError } = await supabase
        .from('user_guideline_selections')
        .update({ selected_at: new Date().toISOString() })
        .eq('id', existingSelection.id)
        .select()
        .single();
        
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      
      return NextResponse.json({ 
        selection: updatedSelection,
        message: 'Guideline selection updated' 
      });
    }
    
    // Otherwise, create a new selection
    const { data: newSelection, error: insertError } = await supabase
      .from('user_guideline_selections')
      .insert({
        user_id: userId,
        guideline_id: guidelineId,
        selected_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      selection: newSelection,
      message: 'Guideline selected successfully' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error selecting guideline:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Create Supabase client
  const supabase = createClient();
  
  // Get session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // Only allow authenticated users to delete their selections
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const userId = session.user.id;
    
    // Parse request body
    const { guidelineId } = await request.json();
    
    if (!guidelineId) {
      return NextResponse.json({ error: 'Guideline ID is required' }, { status: 400 });
    }
    
    // Delete the selection
    const { error: deleteError } = await supabase
      .from('user_guideline_selections')
      .delete()
      .eq('user_id', userId)
      .eq('guideline_id', guidelineId);
      
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Guideline selection removed' 
    });
    
  } catch (error) {
    console.error('Error removing guideline selection:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
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
  
  // Get session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // Only allow authenticated users to mark guidelines as completed
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const userId = session.user.id;
    
    // First check if the guideline exists
    const { data: guideline, error: guidelineError } = await supabase
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
    
    // Parse request body for optional completion details
    const requestData = await request.json();
    const { completionDate = new Date().toISOString(), notes } = requestData;
    
    // Calculate the next due date based on frequency
    const nextDueDate = calculateNextDueDate(guideline, completionDate);
    
    // Update the guideline with completion information
    const { data: updatedGuideline, error: updateError } = await supabase
      .from('guidelines')
      .update({
        last_completed_date: completionDate,
        next_due_date: nextDueDate
      })
      .eq('id', id)
      .select()
      .single();
      
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    // Also create a record in a user_guideline_completions table to track history
    const { error: completionError } = await supabase
      .from('user_guideline_completions')
      .insert({
        user_id: userId,
        guideline_id: id,
        completion_date: completionDate,
        notes: notes
      });
      
    if (completionError) {
      console.error('Error recording completion history:', completionError);
      // Don't fail the request, but log the error
    }
    
    return NextResponse.json({
      guideline: updatedGuideline,
      message: 'Guideline marked as completed'
    });
    
  } catch (error) {
    console.error('Error marking guideline as completed:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// Calculate the next due date based on the guideline frequency
function calculateNextDueDate(guideline: any, fromDateStr: string): string {
  // Parse the completion date
  const fromDate = new Date(fromDateStr);
  
  // Default to annual (12 months) if no frequency specified
  let frequencyMonths = guideline.frequency_months || 12;
  
  // Calculate the next due date
  const nextDueDate = new Date(fromDate);
  nextDueDate.setMonth(nextDueDate.getMonth() + frequencyMonths);
  
  return nextDueDate.toISOString();
} 
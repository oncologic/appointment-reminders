import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getUserAdminRole } from '@/lib/services/roleService';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const visibility = searchParams.get('visibility');
  const category = searchParams.get('category');
  const query = searchParams.get('q');

  // Create Supabase client
  const supabase = createClient();

  // Get the current session to determine user ID
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // Start building the query
  let guidelinesQuery = supabase.from('guidelines').select(`
      *,
      guideline_age_ranges(*),
      guideline_resources(*)
    `);

  // Filter by visibility
  if (visibility) {
    guidelinesQuery = guidelinesQuery.eq('visibility', visibility);
  } else if (userId) {
    // If no visibility filter but user is logged in, show public + their private
    guidelinesQuery = guidelinesQuery.or(
      `visibility.eq.public,and(visibility.eq.private,created_by.eq.${userId})`
    );
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
  // Create Supabase client
  const supabase = createClient();

  // Get session for authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Only allow authenticated users to create guidelines
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Parse request body
    const requestData = await request.json();
    const { guideline, ageRanges, resources } = requestData;

    // Convert camelCase properties to snake_case to match DB schema
    const guidelineData = {
      name: guideline.name,
      description: guideline.description,
      frequency: guideline.frequency,
      frequency_months: guideline.frequencyMonths || guideline.frequency_months,
      frequency_months_max: guideline.frequencyMonthsMax || guideline.frequency_months_max,
      category: guideline.category,
      genders: guideline.genders,
      visibility: guideline.visibility,
      tags: guideline.tags,
      original_guideline_id: guideline.originalGuidelineId || guideline.original_guideline_id,
      last_completed_date: guideline.lastCompletedDate || guideline.last_completed_date,
      next_due_date: guideline.nextDueDate || guideline.next_due_date,
      created_by: userId,
    };

    // Non-admin users can only create private guidelines
    const { isAdmin } = await getUserAdminRole(userId);

    if (!isAdmin && guidelineData.visibility === 'public') {
      guidelineData.visibility = 'private';
    }

    // Insert the guideline
    const { data: newGuideline, error: guidelineError } = await supabase
      .from('guidelines')
      .insert(guidelineData)
      .select()
      .single();

    if (guidelineError) {
      return NextResponse.json({ error: guidelineError.message }, { status: 500 });
    }

    // Insert age ranges if provided
    if (ageRanges && ageRanges.length > 0) {
      // Map the age ranges to match the database schema
      const ageRangesWithGuidelineId = ageRanges.map(
        (range: {
          min?: number | null;
          max?: number | null;
          min_age?: number | null;
          max_age?: number | null;
          label: string;
          frequency?: string;
          frequency_months?: number;
          frequencyMonths?: number;
          frequency_months_max?: number;
          frequencyMonthsMax?: number;
          notes?: string;
        }) => ({
          guideline_id: newGuideline.id,
          min_age: range.min_age || range.min || null,
          max_age: range.max_age || range.max || null,
          label: range.label,
          frequency: range.frequency || guidelineData.frequency,
          frequency_months: range.frequency_months || range.frequencyMonths,
          frequency_months_max: range.frequency_months_max || range.frequencyMonthsMax,
          notes: range.notes,
        })
      );

      const { error: ageRangesError } = await supabase
        .from('guideline_age_ranges')
        .insert(ageRangesWithGuidelineId);

      if (ageRangesError) {
        return NextResponse.json({ error: ageRangesError.message }, { status: 500 });
      }
    }

    // Insert resources if provided
    if (resources && resources.length > 0) {
      // Map the resources to match the database schema
      const resourcesWithGuidelineId = resources.map(
        (resource: {
          name: string;
          url: string;
          description?: string;
          type: 'risk' | 'resource';
        }) => ({
          guideline_id: newGuideline.id,
          name: resource.name,
          url: resource.url,
          description: resource.description || null,
          type: resource.type || 'resource',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      );

      const { error: resourcesError } = await supabase
        .from('guideline_resources')
        .insert(resourcesWithGuidelineId);

      if (resourcesError) {
        console.error('Error inserting resources:', resourcesError);
        // Don't fail the entire request just because resources failed
      }
    }

    return NextResponse.json(
      {
        guideline: newGuideline,
        message: 'Guideline created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating guideline:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

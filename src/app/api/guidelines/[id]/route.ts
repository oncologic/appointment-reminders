import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getUserAdminRole } from '@/lib/services/roleService';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const cookieStore = cookies();
    const supabase = createClient();

    // Get the current session to determine user ID
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Fetch the guideline with its age ranges
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

    // Check permission - users can only access public guidelines or their own private ones
    if (guideline.visibility === 'private' && guideline.created_by !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch age ranges for this guideline
    const { data: ageRanges, error: ageRangesError } = await supabase
      .from('guideline_age_ranges')
      .select('*')
      .eq('guideline_id', id);

    if (ageRangesError) {
      return NextResponse.json({ error: ageRangesError.message }, { status: 500 });
    }

    // Fetch resources for this guideline
    const { data: resources, error: resourcesError } = await supabase
      .from('guideline_resources')
      .select('*')
      .eq('guideline_id', id);

    if (resourcesError) {
      return NextResponse.json({ error: resourcesError.message }, { status: 500 });
    }

    return NextResponse.json({
      guideline: {
        ...guideline,
        ageRanges,
        resources: resources || [],
      },
    });
  } catch (error) {
    console.error('Error fetching guideline:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const cookieStore = cookies();
  const supabase = createClient();

  // Get session for authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Only allow authenticated users to update guidelines
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // First check if the guideline exists and if user has permission
    const { data: existingGuideline, error: checkError } = await supabase
      .from('guidelines')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Guideline not found' }, { status: 404 });
      }
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    // Check if user has permission to edit this guideline
    const { isAdmin } = await getUserAdminRole(userId);

    if (!isAdmin && existingGuideline.created_by !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this guideline' },
        { status: 403 }
      );
    }

    // Parse request body
    const requestData = await request.json();
    const { guideline, ageRanges, resources } = requestData;

    // Non-admin users can only create private guidelines
    if (!isAdmin && guideline.visibility === 'public') {
      guideline.visibility = 'private';
    }

    // Update the guideline
    const { data: updatedGuideline, error: updateError } = await supabase
      .from('guidelines')
      .update(guideline)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update age ranges if provided
    if (ageRanges) {
      // First delete existing age ranges
      const { error: deleteAgeRangesError } = await supabase
        .from('guideline_age_ranges')
        .delete()
        .eq('guideline_id', id);

      if (deleteAgeRangesError) {
        return NextResponse.json({ error: deleteAgeRangesError.message }, { status: 500 });
      }

      // Then insert new age ranges
      if (ageRanges.length > 0) {
        const ageRangesWithGuidelineId = ageRanges.map((range: any) => ({
          ...range,
          guideline_id: id,
        }));

        const { error: insertAgeRangesError } = await supabase
          .from('guideline_age_ranges')
          .insert(ageRangesWithGuidelineId);

        if (insertAgeRangesError) {
          return NextResponse.json({ error: insertAgeRangesError.message }, { status: 500 });
        }
      }
    }

    // Update resources if provided
    if (resources) {
      // First delete existing resources
      const { error: deleteResourcesError } = await supabase
        .from('guideline_resources')
        .delete()
        .eq('guideline_id', id);

      if (deleteResourcesError) {
        return NextResponse.json({ error: deleteResourcesError.message }, { status: 500 });
      }

      // Then insert new resources
      if (resources.length > 0) {
        const resourcesWithGuidelineId = resources.map((resource: any) => ({
          ...resource,
          guideline_id: id,
        }));

        const { error: insertResourcesError } = await supabase
          .from('guideline_resources')
          .insert(resourcesWithGuidelineId);

        if (insertResourcesError) {
          return NextResponse.json({ error: insertResourcesError.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({
      guideline: updatedGuideline,
      message: 'Guideline updated successfully',
    });
  } catch (error) {
    console.error('Error updating guideline:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const cookieStore = cookies();
  const supabase = createClient();

  // Get session for authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Only allow authenticated users to delete guidelines
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // First check if the guideline exists and if user has permission
    const { data: existingGuideline, error: checkError } = await supabase
      .from('guidelines')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Guideline not found' }, { status: 404 });
      }
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    // Check if user has permission to delete this guideline
    const { isAdmin } = await getUserAdminRole(userId);

    if (!isAdmin && existingGuideline.created_by !== userId) {
      return NextResponse.json(
        {
          error: 'You do not have permission to delete this guideline',
        },
        { status: 403 }
      );
    }

    // Explicitly delete related records first to ensure clean deletion

    // 1. Delete age ranges associated with this guideline
    const { error: ageRangesDeleteError } = await supabase
      .from('guideline_age_ranges')
      .delete()
      .eq('guideline_id', id);

    if (ageRangesDeleteError) {
      console.error('Error deleting guideline age ranges:', ageRangesDeleteError);
      return NextResponse.json({ error: ageRangesDeleteError.message }, { status: 500 });
    }

    // 2. Delete resources associated with this guideline
    const { error: resourcesDeleteError } = await supabase
      .from('guideline_resources')
      .delete()
      .eq('guideline_id', id);

    if (resourcesDeleteError) {
      console.error('Error deleting guideline resources:', resourcesDeleteError);
      return NextResponse.json({ error: resourcesDeleteError.message }, { status: 500 });
    }

    // 3. Delete any user_selected_guidelines references to this guideline
    const { error: userSelectionsDeleteError } = await supabase
      .from('user_selected_guidelines')
      .delete()
      .eq('guideline_id', id);

    if (userSelectionsDeleteError) {
      console.error('Error deleting user guideline selections:', userSelectionsDeleteError);
      // Continue with deletion even if this fails
    }

    // 4. Delete any screening_results associated with this guideline
    const { error: screeningResultsDeleteError } = await supabase
      .from('screening_results')
      .delete()
      .eq('guideline_id', id);

    if (screeningResultsDeleteError) {
      console.error('Error deleting screening results:', screeningResultsDeleteError);
      // Continue with deletion even if this fails
    }

    // Finally, delete the guideline itself
    const { error: deleteError } = await supabase.from('guidelines').delete().eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Guideline deleted successfully' });
  } catch (error) {
    console.error('Error deleting guideline:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

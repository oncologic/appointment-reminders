import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const guidelineId = params.id;
  const searchParams = request.nextUrl.searchParams;
  const includeAppointments = searchParams.get('includeAppointments') === 'true';
  const includeArchived = searchParams.get('includeArchived') === 'true'; // Default to false

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
  let query = supabase
    .from('user_screenings')
    .select('*, guidelines(*)')
    .eq('guideline_id', guidelineId)
    .eq('user_id', userId);

  // Only show non-archived screenings by default
  if (!includeArchived) {
    query = query.eq('archived', false);
  }

  const { data: screening, error } = await query.single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!screening) {
    return NextResponse.json({ error: 'Screening not found' }, { status: 404 });
  }

  // If appointments are requested, fetch them as well
  if (includeAppointments) {
    // First check by guideline_id (which is the screening_id in appointments)
    const { data: appointmentsByGuidelineId, error: appointmentsError1 } = await supabase
      .from('appointments')
      .select('*')
      .eq('screening_id', guidelineId)
      .eq('user_id', userId);

    if (appointmentsError1) {
      return NextResponse.json({ error: appointmentsError1.message }, { status: 500 });
    }

    // Also check by screening.id in case that's used instead
    const { data: appointmentsById, error: appointmentsError2 } = await supabase
      .from('appointments')
      .select('*')
      .eq('screening_id', screening.id)
      .eq('user_id', userId);

    if (appointmentsError2) {
      return NextResponse.json({ error: appointmentsError2.message }, { status: 500 });
    }

    // Combine both results, avoiding duplicates
    const combinedAppointments = [...appointmentsByGuidelineId];
    for (const appt of appointmentsById) {
      if (!combinedAppointments.some((a) => a.id === appt.id)) {
        combinedAppointments.push(appt);
      }
    }

    // Sort by appointment date descending
    combinedAppointments.sort(
      (a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
    );

    // Map database appointments to Appointment interface
    const mappedAppointments = combinedAppointments.map((dbAppointment) => ({
      id: dbAppointment.id,
      date: new Date(dbAppointment.appointment_date),
      title: dbAppointment.title,
      type: dbAppointment.type,
      provider: dbAppointment.provider_name,
      providerId: dbAppointment.provider_id,
      location: dbAppointment.location,
      notes: dbAppointment.notes || undefined,
      detailsPath: `/appointments/${dbAppointment.id}`,
      completed: dbAppointment.completed,
      screeningId: dbAppointment.screening_id,
      result: dbAppointment.result
        ? {
            status: dbAppointment.result.status,
            notes: dbAppointment.result.notes,
            date: dbAppointment.result.date,
          }
        : undefined,
    }));

    return NextResponse.json({ screening, appointments: mappedAppointments });
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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const idParam = params.id;

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

  try {
    // Parse request body
    const requestData = await request.json();

    // Determine which user ID to use (for admin purposes or requested user_id)
    const targetUserId = requestData.user_id || userId;

    // For security, only allow updating other users' screenings if admin
    // For now, only allow users to update their own screenings
    if (targetUserId !== userId) {
      // Here you'd add admin role check before proceeding
      return NextResponse.json(
        { error: "Unauthorized to update other users' screenings" },
        { status: 403 }
      );
    }

    // Set updated_at timestamp
    const updateData = {
      ...requestData,
      updated_at: new Date().toISOString(),
    };

    // Remove user_id from updateData as it's used for lookup, not update
    delete updateData.user_id;

    // First try to find the screening record to determine if we need to update by id or guideline_id
    const { data: existingScreening, error: findError } = await supabase
      .from('user_screenings')
      .select('id, guideline_id')
      .eq('user_id', targetUserId)
      .or(`id.eq.${idParam},guideline_id.eq.${idParam}`)
      .single();

    if (findError) {
      console.error('Error finding screening:', findError);
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!existingScreening) {
      return NextResponse.json({ error: 'Screening not found' }, { status: 404 });
    }

    // Determine which ID to use for the update based on what we found
    const filterField = existingScreening.id === idParam ? 'id' : 'guideline_id';

    // Update the screening record
    const { data: updatedScreening, error } = await supabase
      .from('user_screenings')
      .update(updateData)
      .eq(filterField, idParam)
      .eq('user_id', targetUserId)
      .select()
      .single();

    if (error) {
      console.error('Error updating screening:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      screening: updatedScreening,
      message: 'Screening updated successfully',
    });
  } catch (error) {
    console.error('Error updating screening:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

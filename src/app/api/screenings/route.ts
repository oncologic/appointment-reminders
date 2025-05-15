import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const includeAppointments = searchParams.get('includeAppointments') !== 'false'; // Default to true
  const includeArchived = searchParams.get('includeArchived') === 'true'; // Default to false

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
  let query = supabase
    .from('user_screenings')
    .select('*, guidelines(*)')
    .eq('user_id', userIdToUse);

  // Filter out archived screenings unless includeArchived is true
  if (!includeArchived) {
    query = query.eq('archived', false);
  }

  const { data: screenings, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If appointments should be included, fetch them for each screening
  if (includeAppointments) {
    // Get all appointments for the user
    const { data: allAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userIdToUse);

    if (appointmentsError) {
      return NextResponse.json({ error: appointmentsError.message }, { status: 500 });
    }

    // Map database appointments to Appointment interface
    const mappedAppointments = allAppointments.map((dbAppointment) => ({
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

    // Create a map to quickly look up screenings by both id and guideline_id
    const screeningsById = screenings.reduce(
      (acc, screening) => {
        acc[screening.id] = screening;
        if (screening.guideline_id) {
          acc[screening.guideline_id] = screening;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    // Create a map to quickly look up appointments by screening ID
    const appointmentsByScreeningId = mappedAppointments.reduce(
      (acc, appointment) => {
        if (appointment.screeningId) {
          // Try to match to a screening
          const matchedScreening = screeningsById[appointment.screeningId];
          if (matchedScreening) {
            const screeningKey = matchedScreening.id;
            if (!acc[screeningKey]) {
              acc[screeningKey] = [];
            }
            acc[screeningKey].push(appointment);
          } else {
            // If no direct match, still keep the appointment under its original screening_id
            if (!acc[appointment.screeningId]) {
              acc[appointment.screeningId] = [];
            }
            acc[appointment.screeningId].push(appointment);
          }
        }
        return acc;
      },
      {} as Record<string, any[]>
    );

    // Return screenings with their associated appointments
    const screeningsWithAppointments = screenings.map((screening) => {
      // Check for appointments matched to this screening's ID
      const appointments = appointmentsByScreeningId[screening.id] || [];

      // Also check for appointments matched to this screening's guideline_id
      const guidelineAppointments = appointmentsByScreeningId[screening.guideline_id] || [];

      // Combine both sets of appointments, avoiding duplicates by ID
      const allAppointments = [...appointments];
      for (const appt of guidelineAppointments) {
        if (!allAppointments.some((a) => a.id === appt.id)) {
          allAppointments.push(appt);
        }
      }

      return {
        ...screening,
        appointments: allAppointments,
      };
    });

    return NextResponse.json({ screenings: screeningsWithAppointments });
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

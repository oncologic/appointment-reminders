import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// Transform database row to match our Appointment interface
const mapDbAppointmentToAppointment = (dbAppointment: any) => {
  return {
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
    screeningId: dbAppointment.screening_id || null,
    result: dbAppointment.result
      ? {
          status: dbAppointment.result.status,
          notes: dbAppointment.result.notes,
          date: dbAppointment.result.date,
        }
      : undefined,
  };
};

// GET all appointments for the current user
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const screeningId = url.searchParams.get('screeningId');

    // Create a Supabase client for the current request
    const supabase = createClient();

    // Get session to check authentication and get user ID
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to access appointments' },
        { status: 401 }
      );
    }

    // Get the current user's ID
    const userId = session.user.id;

    // Start building the query
    let query = supabase.from('appointments').select('*').eq('user_id', userId);

    // Add screeningId filter if provided
    if (screeningId) {
      query = query.eq('screening_id', screeningId);
    }

    // Execute the query with ordering
    const { data, error } = await query.order('appointment_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }

    // Map database appointments to our Appointment interface
    const appointments = data.map(mapDbAppointmentToAppointment);

    // Return the appointments as JSON
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Exception fetching appointments:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// POST - Create a new appointment
export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client for the current request
    const supabase = createClient();

    // Get session to check authentication and get user ID
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to create appointments' },
        { status: 401 }
      );
    }

    // Get the current user's ID
    const userId = session.user.id;

    // Parse the request body
    const appointmentData = await request.json();

    // Format date for database
    let appointmentDate;
    if (appointmentData.date) {
      appointmentDate = new Date(appointmentData.date);
    }

    // Prepare data for insertion
    const newAppointment = {
      user_id: userId,
      title: appointmentData.title,
      type: appointmentData.type || 'Consultation',
      provider_name: appointmentData.provider,
      provider_id: appointmentData.providerId,
      location: appointmentData.location,
      appointment_date: appointmentDate?.toISOString(),
      notes: appointmentData.notes,
      completed: appointmentData.completed || false,
      result: appointmentData.result || null,
      screening_id: appointmentData.screeningId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert the new appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert(newAppointment)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
    }

    // Return the created appointment
    return NextResponse.json(mapDbAppointmentToAppointment(data), { status: 201 });
  } catch (error) {
    console.error('Exception creating appointment:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

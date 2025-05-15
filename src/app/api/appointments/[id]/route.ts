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

// GET a specific appointment
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Create a Supabase client for the current request
    const supabase = createClient();

    // Get session to check authentication and get user ID
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to access appointment details' },
        { status: 401 }
      );
    }

    // Get the current user's ID
    const userId = session.user.id;

    // Query the appointment with both id and user_id filters for security
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Appointment not found or you do not have permission to view this appointment' },
        { status: 404 }
      );
    }

    // Map database appointment to our Appointment interface
    const appointment = mapDbAppointmentToAppointment(data);

    // Return the appointment as JSON
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Exception fetching appointment:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// PATCH - Update an existing appointment
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Create a Supabase client for the current request
    const supabase = createClient();

    // Get session to check authentication and get user ID
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to update appointments' },
        { status: 401 }
      );
    }

    // Get the current user's ID
    const userId = session.user.id;

    // Parse the request body
    const updateData = await request.json();

    // Format date for database if it's being updated
    if (updateData.date) {
      updateData.appointment_date = new Date(updateData.date).toISOString();
      delete updateData.date;
    }

    // Map fields from frontend naming to database naming
    if (updateData.provider) {
      updateData.provider_name = updateData.provider;
      delete updateData.provider;
    }

    if (updateData.providerId) {
      updateData.provider_id = updateData.providerId;
      delete updateData.providerId;
    }

    if (updateData.screeningId) {
      updateData.screening_id = updateData.screeningId;
      delete updateData.screeningId;
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Only allow updating specific fields, not id or user_id for security
    const allowedFields = [
      'title',
      'type',
      'provider_name',
      'provider_id',
      'location',
      'appointment_date',
      'notes',
      'completed',
      'result',
      'screening_id',
      'updated_at',
    ];

    const sanitizedUpdate = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce(
        (obj, key) => {
          obj[key] = updateData[key];
          return obj;
        },
        {} as Record<string, any>
      );

    // Verify that the appointment belongs to the user first
    const { data: checkData, error: checkError } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (checkError) {
      return NextResponse.json(
        { error: 'Appointment not found or you do not have permission to update this appointment' },
        { status: 404 }
      );
    }

    // Update the appointment
    const { data, error } = await supabase
      .from('appointments')
      .update(sanitizedUpdate)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
    }

    // Return the updated appointment
    return NextResponse.json(mapDbAppointmentToAppointment(data));
  } catch (error) {
    console.error('Exception updating appointment:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// DELETE - Remove an appointment
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Create a Supabase client for the current request
    const supabase = createClient();

    // Get session to check authentication and get user ID
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to delete appointments' },
        { status: 401 }
      );
    }

    // Get the current user's ID
    const userId = session.user.id;

    // Verify that the appointment belongs to the user first
    const { data: checkData, error: checkError } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (checkError) {
      return NextResponse.json(
        { error: 'Appointment not found or you do not have permission to delete this appointment' },
        { status: 404 }
      );
    }

    // Delete the appointment
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
    }

    // Return success message
    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Exception deleting appointment:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

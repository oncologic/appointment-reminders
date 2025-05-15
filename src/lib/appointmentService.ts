import { Appointment } from './types';

/**
 * Fetches all appointments for the current authenticated user from the API
 */
export async function fetchAppointments(): Promise<Appointment[]> {
  try {
    const response = await fetch('/api/appointments');

    if (!response.ok) {
      // Handle unauthorized or other errors
      if (response.status === 401) {
        throw new Error('You must be logged in to view appointments');
      }
      throw new Error(`Failed to fetch appointments: ${response.status}`);
    }

    const data = await response.json();

    // Ensure all appointments have screeningId set to at least null
    return data.map((appointment: any) => ({
      ...appointment,
      screeningId: appointment.screeningId ?? null,
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

/**
 * Fetches a single appointment by ID from the API
 */
export async function fetchAppointmentById(id: string): Promise<Appointment> {
  try {
    const response = await fetch(`/api/appointments/${id}`);

    if (!response.ok) {
      // Handle unauthorized, not found, or other errors
      if (response.status === 401) {
        throw new Error('You must be logged in to view appointment details');
      }
      if (response.status === 404) {
        throw new Error('Appointment not found or you do not have access to this appointment');
      }
      throw new Error(`Failed to fetch appointment: ${response.status}`);
    }

    const data = await response.json();

    // Ensure screeningId is at least null
    return {
      ...data,
      screeningId: data.screeningId ?? null,
    };
  } catch (error) {
    console.error(`Error fetching appointment with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Fetches appointments associated with a specific screening ID
 */
export async function fetchAppointmentsByScreeningId(screeningId: string): Promise<Appointment[]> {
  try {
    // First try to get appointments directly from the screenings API
    const response = await fetch(`/api/screenings/${screeningId}?includeAppointments=true`);

    if (!response.ok) {
      // Handle unauthorized, not found, or other errors
      if (response.status === 401) {
        throw new Error('You must be logged in to view appointments');
      }
      if (response.status === 404) {
        throw new Error('Screening not found or you do not have access to this screening');
      }
      throw new Error(`Failed to fetch appointments for screening: ${response.status}`);
    }

    const data = await response.json();
    const screeningAppointments = data.appointments || [];

    // If we didn't find any appointments through the screenings API,
    // try to fetch all appointments and filter them
    if (screeningAppointments.length === 0) {
      // Get all appointments and manually filter
      const allAppointmentsResponse = await fetch('/api/appointments');

      if (allAppointmentsResponse.ok) {
        const allAppointments = await allAppointmentsResponse.json();

        // Filter appointments by screeningId
        const matchingAppointments = allAppointments.filter(
          (appointment: Appointment) => appointment.screeningId === screeningId
        );

        if (matchingAppointments.length > 0) {
          return matchingAppointments;
        }
      }
    }

    // Return the appointments array from the screenings API
    return screeningAppointments;
  } catch (error) {
    console.error(`Error fetching appointments for screening ID ${screeningId}:`, error);
    throw error;
  }
}

/**
 * Creates a new appointment
 */
export async function createAppointment(
  appointmentData: Partial<Appointment>
): Promise<Appointment> {
  try {
    // Ensure screeningId is explicitly set to null if not provided
    const appointmentWithScreeningId = {
      ...appointmentData,
      screeningId: appointmentData.screeningId ?? null,
    };

    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentWithScreeningId),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('You must be logged in to create appointments');
      }
      throw new Error(`Failed to create appointment: ${response.status}`);
    }

    const data = await response.json();

    // Ensure returned data always has screeningId
    return {
      ...data,
      screeningId: data.screeningId ?? null,
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

/**
 * Updates an existing appointment
 */
export async function updateAppointment(
  id: string,
  appointmentData: Partial<Appointment>
): Promise<Appointment> {
  try {
    // Ensure screeningId is explicitly included if modifying appointment
    const appointmentWithScreeningId = {
      ...appointmentData,
    };

    // Only explicitly set screeningId to null if it's undefined
    if (appointmentData.screeningId === undefined && 'screeningId' in appointmentData) {
      appointmentWithScreeningId.screeningId = null;
    }

    const response = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentWithScreeningId),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('You must be logged in to update appointments');
      }
      if (response.status === 404) {
        throw new Error('Appointment not found or you do not have access to this appointment');
      }
      throw new Error(`Failed to update appointment: ${response.status}`);
    }

    const data = await response.json();

    // Ensure returned data always has screeningId
    return {
      ...data,
      screeningId: data.screeningId ?? null,
    };
  } catch (error) {
    console.error(`Error updating appointment with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes an appointment
 */
export async function deleteAppointment(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('You must be logged in to delete appointments');
      }
      if (response.status === 404) {
        throw new Error('Appointment not found or you do not have access to this appointment');
      }
      throw new Error(`Failed to delete appointment: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error deleting appointment with ID ${id}:`, error);
    throw error;
  }
}

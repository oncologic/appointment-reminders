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
    return data;
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
    return data;
  } catch (error) {
    console.error(`Error fetching appointment with ID ${id}:`, error);
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
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('You must be logged in to create appointments');
      }
      throw new Error(`Failed to create appointment: ${response.status}`);
    }

    const data = await response.json();
    return data;
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
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
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
    return data;
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

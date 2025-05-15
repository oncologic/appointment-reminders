import React, { createContext, useContext, useEffect, useState } from 'react';

import { fetchAppointments } from '@/lib/appointmentService';
import { Appointment } from '@/lib/types';

// Create a context for appointments data to avoid duplicate fetching
const AppointmentContext = createContext<{
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
}>({
  appointments: [],
  isLoading: true,
  error: null,
});

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointments from the API only once
  useEffect(() => {
    const loadAppointments = async () => {
      // Skip if we already have appointments data
      if (appointments.length > 0) {
        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchAppointments();

        // Convert date strings to Date objects
        const processedAppointments = data.map((appointment) => ({
          ...appointment,
          date: new Date(appointment.date),
          // Ensure each appointment has a detailsPath
          detailsPath: `/appointments/${appointment.id}`,
        }));

        setAppointments(processedAppointments);
        setError(null);
      } catch (err) {
        console.error('Failed to load appointments:', err);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, [appointments.length]); // Only run if appointments array is empty

  // Create context value to provide to children
  const appointmentContextValue = {
    appointments,
    isLoading,
    error,
  };

  return (
    <AppointmentContext.Provider value={appointmentContextValue}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => useContext(AppointmentContext);

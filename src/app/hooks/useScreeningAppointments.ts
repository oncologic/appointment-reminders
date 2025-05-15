import { useEffect, useState } from 'react';

import { useGuidelines } from '@/app/hooks/useGuidelines';
import { useUser } from '@/app/hooks/useUser';
import { fetchAppointments, fetchAppointmentsByScreeningId } from '@/lib/appointmentService';
import { Appointment } from '@/lib/types';

export const useScreeningAppointments = (screeningId: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get user and screenings to check for already attached appointments
  const { user } = useUser();
  const { screenings } = useGuidelines(user);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!screeningId) {
        setAppointments([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Find the screening in the list
        const screening = screenings.find((s) => s.id === screeningId);

        // Check if the screening already has appointments
        if (screening?.appointments && screening.appointments.length > 0) {
          setAppointments(screening.appointments);
          setError(null);
          setIsLoading(false);
          return;
        }

        // As a second check, try to fetch all appointments and filter by screeningId
        const allAppointments = await fetchAppointments();
        const matchingAppointments = allAppointments.filter((a) => a.screeningId === screeningId);

        if (matchingAppointments.length > 0) {
          setAppointments(matchingAppointments);
          setError(null);
          setIsLoading(false);
          return;
        }

        // If no appointments found yet, try direct API fetch
        const data = await fetchAppointmentsByScreeningId(screeningId);
        setAppointments(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load appointments:', err);
        setError('Failed to load appointments for this screening.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, [screeningId, screenings]);

  return { appointments, isLoading, error };
};

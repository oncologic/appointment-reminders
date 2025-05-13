import React, { useEffect, useState } from 'react';

import { useGuidelines } from '@/app/hooks/useGuidelines';
import { useUser } from '@/app/hooks/useUser';
import { fetchAppointments } from '@/lib/appointmentService';
import { Appointment } from '@/lib/types';

import ScreeningList from './ScreeningList';
import { ScreeningRecommendation } from './types';

// Format dates for display (copied from ScreeningItem.tsx)
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Not specified';

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    // Format as "Month Day, Year" (e.g., "May 13, 2026")
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return 'Invalid date format';
  }
};

// Calculate the duration text from now to a future date (copied from ScreeningItem.tsx)
const getDurationText = (dateString?: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const today = new Date();

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    // If the date is in the past
    if (date < today) {
      return '(overdue)';
    }

    // Calculate the difference in years
    const yearDiff = date.getFullYear() - today.getFullYear();
    const monthDiff = date.getMonth() - today.getMonth();

    // Adjust for partial years
    const adjustedYearDiff =
      monthDiff < 0 || (monthDiff === 0 && date.getDate() < today.getDate())
        ? yearDiff - 1
        : yearDiff;

    // Calculate months for less than a year
    const adjustedMonthDiff = monthDiff < 0 ? 12 + monthDiff : monthDiff;

    if (adjustedYearDiff === 0) {
      if (adjustedMonthDiff === 0) {
        return '(this month)';
      } else if (adjustedMonthDiff === 1) {
        return '(next month)';
      } else {
        return `(in ${adjustedMonthDiff} months)`;
      }
    } else if (adjustedYearDiff === 1) {
      return adjustedMonthDiff === 0
        ? '(in 1 year)'
        : `(in 1 year and ${adjustedMonthDiff} months)`;
    } else {
      return `(in ${adjustedYearDiff} years)`;
    }
  } catch (e) {
    return '';
  }
};

// Define a type for the transformed screening data
type TransformedScreening = {
  id: string;
  title: string;
  description: string;
  status: 'due' | 'upcoming' | 'overdue' | 'completed';
  statusText: string;
  dueDate: string;
  dueDateFormatted: string;
  durationText: string;
  schedulePath: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  friendRecommendations: Array<unknown>;
  // Optional fields matching ScreeningRecommendation
  ageRange?: any[];
  ageRangeDetails?: any[];
};

const HealthScreenings: React.FC = () => {
  // Get user profile and screenings from the database
  const { user } = useUser();
  const { screenings } = useGuidelines(user);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch appointments from the API
  useEffect(() => {
    const getAppointments = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAppointments();
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getAppointments();
  }, []);

  // Map screenings to upcoming appointments
  const upcomingScreenings: TransformedScreening[] = screenings
    .filter((screening) => screening.status === 'due' || screening.status === 'overdue')
    .map((screening) => {
      // Find related appointment if it exists
      const relatedAppointment = appointments.find(
        (appt) => appt.title.toLowerCase().includes(screening.name.toLowerCase()) && !appt.completed
      );

      return {
        id: screening.id,
        title: screening.name,
        description: screening.description,
        status: screening.status,
        statusText: `${screening.status === 'overdue' ? 'Overdue' : 'Due soon'}: ${screening.name}`,
        dueDate: relatedAppointment ? relatedAppointment.date.toString() : screening.dueDate || '',
        dueDateFormatted: relatedAppointment
          ? formatDate(relatedAppointment.date.toString())
          : formatDate(screening.dueDate),
        durationText: relatedAppointment
          ? getDurationText(relatedAppointment.date.toString())
          : getDurationText(screening.dueDate),
        schedulePath: relatedAppointment
          ? `/appointments/${relatedAppointment.id}`
          : `/appointments/new?screening=${screening.id}`,
        icon: '',
        iconColor: '',
        bgColor: '',
        friendRecommendations: [],
        ageRange: screening.ageRange,
        ageRangeDetails: screening.ageRangeDetails,
      };
    });

  // Filter completed appointments related to screenings
  const completedScreeningAppointments: TransformedScreening[] = appointments
    .filter(
      (appt) =>
        appt.completed &&
        screenings.some((screening) =>
          appt.title.toLowerCase().includes(screening.name.toLowerCase())
        )
    )
    .map((appt) => {
      // Find related screening
      const relatedScreening = screenings.find((screening) =>
        appt.title.toLowerCase().includes(screening.name.toLowerCase())
      );

      return {
        id: appt.id,
        title: appt.title,
        description: appt.description || relatedScreening?.description || '',
        status: 'completed' as const, // Explicitly type as 'completed'
        statusText: `Completed: ${appt.title}`,
        dueDate: appt.date.toString(),
        dueDateFormatted: formatDate(appt.date.toString()),
        durationText: '',
        schedulePath: `/appointments/${appt.id}`,
        icon: '',
        iconColor: '',
        bgColor: '',
        friendRecommendations: [],
        // Add optional fields if related screening exists
        ...(relatedScreening
          ? {
              ageRange: relatedScreening.ageRange,
              ageRangeDetails: relatedScreening.ageRangeDetails,
            }
          : {}),
      };
    });

  if (isLoading) {
    return <div className="lg:col-span-4 p-4">Loading health screenings...</div>;
  }

  return (
    <div className="lg:col-span-4">
      <ScreeningList
        title="Upcoming health screenings"
        screenings={upcomingScreenings}
        viewAllLink="/guidelines"
      />

      {completedScreeningAppointments.length > 0 && (
        <ScreeningList
          title="Completed screenings"
          screenings={completedScreeningAppointments}
          viewAllLink="/appointments?filter=completed"
        />
      )}
    </div>
  );
};

export default HealthScreenings;

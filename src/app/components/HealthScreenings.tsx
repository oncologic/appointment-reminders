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

interface HealthScreeningsProps {
  appointments?: Appointment[];
  isLoading?: boolean;
}

const HealthScreenings: React.FC<HealthScreeningsProps> = ({
  appointments: propAppointments,
  isLoading: propIsLoading,
}) => {
  // Get user profile and screenings from the database
  const { user } = useUser();
  const { screenings } = useGuidelines(user);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use provided appointments or fetch them if not provided
  useEffect(() => {
    // If appointments are provided via props, use them
    if (propAppointments) {
      setAppointments(propAppointments);
      setIsLoading(propIsLoading || false);
      return;
    }

    // Otherwise fetch appointments from API
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
  }, [propAppointments, propIsLoading]);

  // Map screenings to upcoming appointments
  const upcomingScreenings: TransformedScreening[] = screenings
    .filter((screening) => screening.status === 'due' || screening.status === 'overdue')
    .map((screening) => {
      // Find related appointment if it exists
      const relatedAppointment = appointments.find(
        (appt) => appt.title.toLowerCase().includes(screening.name.toLowerCase()) && !appt.completed
      );

      // Generate an icon name based on screening name if not provided
      const getDefaultIcon = (name: string) => {
        const lowerName = name.toLowerCase();

        if (lowerName.includes('blood') || lowerName.includes('cholesterol')) {
          return 'FaTint';
        } else if (lowerName.includes('mammogram') || lowerName.includes('breast')) {
          return 'FaHeartbeat';
        } else if (lowerName.includes('colon') || lowerName.includes('colonoscopy')) {
          return 'FaStethoscope';
        } else if (lowerName.includes('eye') || lowerName.includes('vision')) {
          return 'FaEye';
        } else if (lowerName.includes('dental') || lowerName.includes('teeth')) {
          return 'FaTooth';
        } else if (lowerName.includes('skin') || lowerName.includes('dermatology')) {
          return 'FaAllergies';
        } else if (lowerName.includes('physical') || lowerName.includes('exam')) {
          return 'FaUserMd';
        } else if (
          lowerName.includes('vaccine') ||
          lowerName.includes('shot') ||
          lowerName.includes('immunization')
        ) {
          return 'FaSyringe';
        } else if (lowerName.includes('heart') || lowerName.includes('cardiac')) {
          return 'FaHeartbeat';
        } else if (lowerName.includes('lung') || lowerName.includes('pulmonary')) {
          return 'FaLungs';
        } else if (lowerName.includes('bone') || lowerName.includes('density')) {
          return 'FaBone';
        } else {
          // Default for any other screening
          return 'FaClipboardCheck';
        }
      };

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
        icon: screening.icon || getDefaultIcon(screening.name),
        iconColor: screening.iconColor || 'text-blue-600',
        bgColor: screening.bgColor || 'bg-blue-100',
        friendRecommendations: screening.friendRecommendations || [],
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

      // Generate default icon based on appointment title
      const getDefaultIcon = (title: string) => {
        const lowerTitle = title.toLowerCase();

        if (lowerTitle.includes('blood') || lowerTitle.includes('cholesterol')) {
          return 'FaTint';
        } else if (lowerTitle.includes('mammogram') || lowerTitle.includes('breast')) {
          return 'FaHeartbeat';
        } else if (lowerTitle.includes('colon') || lowerTitle.includes('colonoscopy')) {
          return 'FaStethoscope';
        } else if (lowerTitle.includes('eye') || lowerTitle.includes('vision')) {
          return 'FaEye';
        } else if (lowerTitle.includes('dental') || lowerTitle.includes('teeth')) {
          return 'FaTooth';
        } else if (lowerTitle.includes('skin') || lowerTitle.includes('dermatology')) {
          return 'FaAllergies';
        } else if (lowerTitle.includes('physical') || lowerTitle.includes('exam')) {
          return 'FaUserMd';
        } else if (
          lowerTitle.includes('vaccine') ||
          lowerTitle.includes('shot') ||
          lowerTitle.includes('immunization')
        ) {
          return 'FaSyringe';
        } else if (lowerTitle.includes('heart') || lowerTitle.includes('cardiac')) {
          return 'FaHeartbeat';
        } else if (lowerTitle.includes('lung') || lowerTitle.includes('pulmonary')) {
          return 'FaLungs';
        } else if (lowerTitle.includes('bone') || lowerTitle.includes('density')) {
          return 'FaBone';
        } else {
          return 'FaClipboardCheck';
        }
      };

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
        icon: relatedScreening?.icon || getDefaultIcon(appt.title),
        iconColor: relatedScreening?.iconColor || 'text-green-600',
        bgColor: relatedScreening?.bgColor || 'bg-green-100',
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

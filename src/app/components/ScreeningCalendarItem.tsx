import Link from 'next/link';
import React, { useState } from 'react';
import { FaCalendarCheck, FaCalendarPlus, FaUserFriends } from 'react-icons/fa';

import { ScreeningRecommendation as DBScreeningRecommendation } from '@/app/components/types';
import { useAppointments } from '@/app/hooks/useAppointments';
import { Appointment } from '@/lib/types';

// Import the shared interface or redefine it to match exactly
interface CalendarScreeningRecommendation extends DBScreeningRecommendation {
  title: string;
  statusText: string;
  schedulePath: string;
  icon?: string;
  iconColor?: string;
  bgColor?: string;
  friendRecommendations: any[];
}

interface ScreeningCalendarItemProps {
  screening: CalendarScreeningRecommendation;
  handleMouseEnter: (
    e: React.MouseEvent<HTMLDivElement>,
    screening: CalendarScreeningRecommendation
  ) => void;
  handleMouseLeave: () => void;
  year: number;
}

const ScreeningCalendarItem: React.FC<ScreeningCalendarItemProps> = ({
  screening,
  handleMouseEnter,
  handleMouseLeave,
  year,
}) => {
  const { appointments } = useAppointments();
  const [showAppointmentsList, setShowAppointmentsList] = useState(false);

  // Only show in the relevant year
  const shouldShowInYear = () => {
    if (screening.status === 'completed') return false;

    // Extract year from statusText if it has one
    const yearMatch = screening.statusText.match(/\(\s*age\s+(\d+)\s*\)/i);
    const ageYear = yearMatch ? parseInt(yearMatch[1]) : null;

    if (ageYear) {
      // Show in the year when the age would be reached
      const currentYear = new Date().getFullYear();
      const userAge = 38; // From the user data in page.tsx
      const yearWhenDue = currentYear + (ageYear - userAge);
      return year === yearWhenDue;
    }

    // If due soon or overdue, always show in current year
    if (screening.status === 'overdue' || screening.status === 'due') {
      return year === new Date().getFullYear() || year === new Date().getFullYear() + 1;
    }

    return true; // Default case
  };

  if (!shouldShowInYear()) return null;

  // Check if the screening already has an appointment scheduled this year
  const hasAppointmentScheduled = () => {
    const screeningAppointments = appointments.filter(
      (appt) => appt.screeningId === screening.id && appt.date.getFullYear() === year
    );
    return screeningAppointments.length > 0;
  };

  // Get all appointments for this screening in the current year
  const getScreeningAppointments = (): Appointment[] => {
    return appointments.filter(
      (appt) => appt.screeningId === screening.id && appt.date.getFullYear() === year
    );
  };

  // Determine color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'due':
        return 'bg-orange-400';
      case 'overdue':
        return 'bg-red-500';
      case 'upcoming':
        return 'bg-blue-400';
      default:
        return 'bg-gray-400';
    }
  };

  const isScheduled = hasAppointmentScheduled();
  const appointmentsForScreening = getScreeningAppointments();

  // Handle click on a screening that has appointments
  const handleScreeningClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isScheduled && appointmentsForScreening.length > 1) {
      setShowAppointmentsList(!showAppointmentsList);
    } else if (isScheduled && appointmentsForScreening.length === 1) {
      // If there's only one appointment, navigate directly to it
      window.location.href = appointmentsForScreening[0].detailsPath;
    }
  };

  return (
    <div className="flex flex-col gap-0.5 mt-1 relative">
      <div
        className={`hover:brightness-110 transition-all cursor-pointer ${isScheduled ? 'opacity-70' : ''}`}
        onMouseEnter={(e) => handleMouseEnter(e, screening)}
        onMouseLeave={handleMouseLeave}
        onClick={isScheduled ? handleScreeningClick : undefined}
      >
        {isScheduled ? (
          <Link
            href={
              appointmentsForScreening.length === 1 ? appointmentsForScreening[0].detailsPath : '#'
            }
          >
            <div
              className={`flex items-center text-xs text-white px-1.5 py-0.5 rounded-sm ${getStatusColor(
                screening.status
              )} border-l-4 border-green-600 opacity-70`}
            >
              <FaCalendarCheck className="mr-1 flex-shrink-0 text-[10px]" />
              <span className="truncate text-[11px] font-medium">{screening.title}</span>
            </div>
          </Link>
        ) : (
          <Link href={screening.schedulePath}>
            <div
              className={`flex items-center text-xs text-white px-1.5 py-0.5 rounded-sm ${getStatusColor(
                screening.status
              )} border-l-4 border-blue-600 opacity-80`}
            >
              <FaCalendarPlus className="mr-1 flex-shrink-0 text-[10px]" />
              <span className="truncate text-[11px] font-medium">{screening.title}</span>
            </div>
          </Link>
        )}
      </div>

      {/* Show appointments list if clicked and there are multiple appointments */}
      {showAppointmentsList && appointmentsForScreening.length > 1 && (
        <div className="absolute top-full left-0 z-30 bg-white shadow-md rounded-md p-2 mt-1 w-64">
          <div className="text-xs font-medium text-gray-700 mb-2">Available appointments:</div>
          <div className="max-h-48 overflow-y-auto">
            {appointmentsForScreening.map((appt) => (
              <Link key={appt.id} href={appt.detailsPath}>
                <div className="text-xs p-2 hover:bg-blue-50 rounded-md cursor-pointer">
                  <div className="font-medium">{appt.title}</div>
                  <div className="text-gray-600 mt-1">
                    {appt.date.toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    {appt.date.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-gray-600">{appt.provider}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Add a request recommendations link if there are no friend recommendations and no appointment scheduled */}
      {!isScheduled && screening.friendRecommendations?.length === 0 && (
        <Link href={`/recommendations?screening=${screening.id}`} className="block">
          <div className="flex items-center text-xs text-blue-600 px-1.5 py-0.5 rounded-sm bg-blue-50 hover:bg-blue-100 transition-all text-[10px]">
            <FaUserFriends className="mr-1 flex-shrink-0 text-[10px]" />
            <span className="truncate text-[10px]">Request recommendations</span>
          </div>
        </Link>
      )}
    </div>
  );
};

export default ScreeningCalendarItem;

'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import { ScreeningRecommendation as DBScreeningRecommendation } from '@/app/components/types';
import { useGuidelines } from '@/app/hooks/useGuidelines';
import { useUser } from '@/app/hooks/useUser';
import { Appointment } from '@/lib/types';

import AppointmentTooltip from './AppointmentTooltip';
import ScreeningCalendarItem from './ScreeningCalendarItem';
import ScreeningTooltip from './ScreeningTooltip';

// Combined interface that includes properties needed for calendar display
interface CalendarScreeningRecommendation extends DBScreeningRecommendation {
  title: string;
  statusText: string;
  schedulePath: string;
  icon?: string;
  iconColor?: string;
  bgColor?: string;
  friendRecommendations: any[];
}

interface MonthCalendarProps {
  month: number;
  year: number;
  appointments: Appointment[];
}

// Helper function to map screenings to suggested months
const getSuggestedMonth = (screening: CalendarScreeningRecommendation): number => {
  // Simple mapping based on status and title
  if (screening.status === 'overdue') {
    return new Date().getMonth(); // Current month for overdue
  } else if (screening.status === 'due') {
    return (new Date().getMonth() + 1) % 12; // Next month for due
  } else if (screening.name?.includes('Physical')) {
    return 0; // January
  } else if (screening.name?.includes('Mammogram')) {
    return 9; // October (breast cancer awareness month)
  } else if (screening.name?.includes('Colonoscopy')) {
    return 2; // March (colorectal cancer awareness month)
  } else if (screening.name?.includes('Cholesterol')) {
    return 8; // September
  } else if (screening.name?.includes('Cervical')) {
    return 0; // January (cervical health awareness month)
  } else if (screening.name?.includes('Skin')) {
    return 4; // May (skin cancer awareness month)
  } else if (screening.name?.includes('Breast')) {
    return 9; // October
  }

  // Default: distribute evenly throughout the year
  return Math.floor(Math.random() * 12);
};

const MonthCalendar: React.FC<MonthCalendarProps> = ({ month, year, appointments }) => {
  const [hoveredAppointment, setHoveredAppointment] = useState<Appointment | null>(null);
  const [hoveredScreening, setHoveredScreening] = useState<CalendarScreeningRecommendation | null>(
    null
  );
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(
    null
  );

  // Get user profile and screenings from the database
  const { user } = useUser();
  const { screenings } = useGuidelines(user);

  // Get the first day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayWeekday = firstDayOfMonth.getDay();

  // Get the number of days in the month
  const daysInMonth = lastDayOfMonth.getDate();

  // Format month name
  const monthName = firstDayOfMonth.toLocaleString('default', { month: 'long' });

  // Create array of week day names
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Filter appointments for this month
  const monthAppointments = appointments.filter(
    (appt) => appt.date.getMonth() === month && appt.date.getFullYear() === year
  );

  // Filter screenings for this month and adapt to calendar format
  const monthScreenings: CalendarScreeningRecommendation[] = screenings
    .filter(
      (screening) =>
        screening.status !== 'completed' &&
        getSuggestedMonth(screening as unknown as CalendarScreeningRecommendation) === month
    )
    .map((screening) => ({
      ...screening,
      title: screening.name,
      statusText: `${screening.status === 'overdue' ? 'Overdue' : screening.status === 'due' ? 'Due' : 'Upcoming'}: ${screening.name}`,
      schedulePath: `/appointments/new?screening=${screening.id}`,
      icon: '',
      iconColor: screening.status === 'overdue' ? 'text-red-500' : 'text-orange-400',
      bgColor: screening.status === 'overdue' ? 'bg-red-100' : 'bg-orange-100',
      friendRecommendations: [], // Initialize as empty array since we don't have this data yet
    }));

  // Helper function to check if a screening should be shown in this year
  const shouldShowScreeningInYear = (screening: CalendarScreeningRecommendation): boolean => {
    if (screening.status === 'completed') return false;

    // If due soon or overdue, always show in current year and next year
    if (screening.status === 'overdue' || screening.status === 'due') {
      return year === new Date().getFullYear() || year === new Date().getFullYear() + 1;
    }

    // For upcoming with no specific age, show in the next few years
    const currentYear = new Date().getFullYear();
    return year >= currentYear && year <= currentYear + 3;
  };

  // Group appointments by day
  const appointmentsByDay: Record<number, Appointment[]> = {};
  monthAppointments.forEach((appt) => {
    const day = appt.date.getDate();
    if (!appointmentsByDay[day]) {
      appointmentsByDay[day] = [];
    }
    appointmentsByDay[day].push(appt);
  });

  // Group screenings by day (distribute evenly through the month)
  const screeningsByDay: Record<number, CalendarScreeningRecommendation[]> = {};
  monthScreenings
    .filter((screening) => shouldShowScreeningInYear(screening))
    .forEach((screening, index) => {
      // Distribute screenings evenly through the month, avoiding weekends
      // and starting from day 5 to avoid cluttering the beginning of the month
      const day = 5 + ((index * 4) % (daysInMonth - 10)); // Increased spacing between screenings
      const dayOfWeek = new Date(year, month, day).getDay();

      // Skip weekends and avoid days with existing appointments if possible
      let adjustedDay = day;
      if (dayOfWeek === 0) adjustedDay = day + 1; // Sunday -> Monday
      if (dayOfWeek === 6) adjustedDay = day + 2; // Saturday -> Monday

      // Try to avoid putting screenings on days that already have 2 or more appointments
      if (appointmentsByDay[adjustedDay] && appointmentsByDay[adjustedDay].length >= 2) {
        if (adjustedDay < daysInMonth - 1) {
          adjustedDay += 1;
        } else if (adjustedDay > 1) {
          adjustedDay -= 1;
        }
      }

      if (!screeningsByDay[adjustedDay]) {
        screeningsByDay[adjustedDay] = [];
      }

      // Limit to max 2 screenings per day to prevent overflow
      if (screeningsByDay[adjustedDay].length < 2) {
        screeningsByDay[adjustedDay].push(screening);
      }
    });

  // Helper function to get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Examination':
        return 'bg-blue-500';
      case 'Treatment':
        return 'bg-green-500';
      case 'Consultation':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Handle appointment hover
  const handleAppointmentMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    appointment: Appointment
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredAppointment(appointment);
    setHoveredScreening(null);
    setTooltipPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX,
    });
  };

  // Handle screening hover
  const handleScreeningMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    screening: CalendarScreeningRecommendation
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredScreening(screening);
    setHoveredAppointment(null);
    setTooltipPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX,
    });
  };

  const handleMouseLeave = () => {
    // We'll only clear tooltips if we're not hovering on the tooltip
    // The actual clearing now happens in a timeout to check if tooltip is being hovered
    setTimeout(() => {
      const tooltipElement = document.querySelector('.tooltip-container:hover');
      if (!tooltipElement) {
        setHoveredAppointment(null);
        setHoveredScreening(null);
      }
    }, 100);
  };

  // Generate calendar grid
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="bg-gray-50 border border-gray-100 h-24"></div>
    );
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayAppointments = appointmentsByDay[day] || [];
    const dayScreenings = screeningsByDay[day] || [];
    const isToday =
      new Date().getDate() === day &&
      new Date().getMonth() === month &&
      new Date().getFullYear() === year;

    calendarDays.push(
      <div
        key={`day-${day}`}
        className={`bg-white border border-gray-100 p-1 h-24 overflow-hidden relative ${
          isToday ? 'ring-2 ring-blue-500 ring-inset' : ''
        }`}
      >
        <div className="text-right mb-1">
          <span
            className={`inline-block rounded-full w-6 h-6 text-center ${
              isToday ? 'bg-blue-500 text-white' : 'text-gray-700'
            }`}
          >
            {day}
          </span>
        </div>

        <div className="space-y-1 overflow-y-auto max-h-[calc(100%-20px)]">
          {/* Appointments first */}
          {dayAppointments.map((appt) => (
            <Link href={appt.detailsPath} key={appt.id} className="block">
              <div
                className={`text-xs text-white px-1 py-1 rounded truncate ${getTypeColor(appt.type)} ${
                  appt.completed ? 'opacity-70' : ''
                }`}
                onMouseEnter={(e) => handleAppointmentMouseEnter(e, appt)}
                onMouseLeave={handleMouseLeave}
              >
                {appt.title}
              </div>
            </Link>
          ))}

          {/* Render suggested screenings with a small divider if both exist */}
          {dayAppointments.length > 0 && dayScreenings.length > 0 && (
            <div className="border-t border-dashed border-gray-200 my-1 mx-1"></div>
          )}

          {/* Render suggested screenings */}
          {dayScreenings.length > 0 && (
            <div className="screenings-container">
              {dayScreenings.map((screening) => (
                <ScreeningCalendarItem
                  key={screening.id}
                  screening={screening}
                  handleMouseEnter={handleScreeningMouseEnter}
                  handleMouseLeave={handleMouseLeave}
                  year={year}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Add empty cells for days after the last day of the month
  const totalCells = calendarDays.length;
  const remainingCells = 7 - (totalCells % 7);
  if (remainingCells < 7) {
    for (let i = 0; i < remainingCells; i++) {
      calendarDays.push(
        <div key={`empty-end-${i}`} className="bg-gray-50 border border-gray-100 h-24"></div>
      );
    }
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        {monthName} {year}
      </h3>

      <div className="grid grid-cols-7 gap-0 overflow-hidden rounded-lg shadow-sm">
        {/* Weekday headers */}
        {weekdays.map((day) => (
          <div
            key={day}
            className="bg-blue-50 text-blue-700 text-center py-1 border-b border-gray-100 font-medium text-xs"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays}
      </div>

      {/* Appointment Tooltip */}
      {hoveredAppointment && tooltipPosition && (
        <AppointmentTooltip appointment={hoveredAppointment} position={tooltipPosition} />
      )}

      {/* Screening Tooltip */}
      {hoveredScreening && tooltipPosition && (
        <ScreeningTooltip screening={hoveredScreening} position={tooltipPosition} />
      )}
    </div>
  );
};

export default MonthCalendar;

'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import { Appointment } from '@/lib/mockData';

import AppointmentTooltip from './AppointmentTooltip';

interface MonthCalendarProps {
  month: number;
  year: number;
  appointments: Appointment[];
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({ month, year, appointments }) => {
  const [hoveredAppointment, setHoveredAppointment] = useState<Appointment | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(
    null
  );

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

  // Group appointments by day
  const appointmentsByDay: Record<number, Appointment[]> = {};
  monthAppointments.forEach((appt) => {
    const day = appt.date.getDate();
    if (!appointmentsByDay[day]) {
      appointmentsByDay[day] = [];
    }
    appointmentsByDay[day].push(appt);
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
    setTooltipPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX,
    });
  };

  const handleAppointmentMouseLeave = () => {
    setHoveredAppointment(null);
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

        <div className="space-y-1 overflow-y-auto max-h-16">
          {dayAppointments.map((appt) => (
            <Link href={appt.detailsPath} key={appt.id} className="block">
              <div
                className={`text-xs text-white px-1 py-1 rounded truncate ${getTypeColor(appt.type)} ${
                  appt.completed ? 'opacity-70' : ''
                }`}
                onMouseEnter={(e) => handleAppointmentMouseEnter(e, appt)}
                onMouseLeave={handleAppointmentMouseLeave}
              >
                {appt.title}
              </div>
            </Link>
          ))}
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

      {/* Tooltip */}
      {hoveredAppointment && tooltipPosition && (
        <AppointmentTooltip appointment={hoveredAppointment} position={tooltipPosition} />
      )}
    </div>
  );
};

export default MonthCalendar;

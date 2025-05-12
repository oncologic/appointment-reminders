'use client';

import React from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaNotesMedical, FaUserMd } from 'react-icons/fa';

import { Appointment } from '@/lib/mockData';

interface AppointmentTooltipProps {
  appointment: Appointment;
  position: {
    top: number;
    left: number;
  };
}

const AppointmentTooltip: React.FC<AppointmentTooltipProps> = ({ appointment, position }) => {
  // Adjust position to ensure tooltip is visible within viewport
  const adjustedPosition = {
    top: position.top,
    left: Math.min(position.left, window.innerWidth - 320), // Prevent overflow from right edge
  };

  // Format date
  const formattedDate = appointment.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Format time
  const formattedTime = appointment.date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      className="absolute z-20 bg-white shadow-lg rounded-md p-4 border border-blue-100 w-72 animate-fadeIn tooltip-container"
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
        maxWidth: '320px',
        transform: 'translateY(5px)',
      }}
      // Allow tooltip to be hovered over to maintain visibility
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-medium text-gray-900">{appointment.title}</h3>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            appointment.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {appointment.completed ? 'Completed' : 'Scheduled'}
        </span>
      </div>

      {appointment.notes && <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>}

      <div className="mt-3 space-y-2">
        <div className="flex items-center text-xs text-gray-600">
          <FaCalendarAlt className="mr-2 text-blue-600" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <FaClock className="mr-2 text-blue-600" />
          <span>{formattedTime}</span>
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <FaUserMd className="mr-2 text-blue-600" />
          <span>{appointment.provider}</span>
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <FaMapMarkerAlt className="mr-2 text-blue-600" />
          <span>{appointment.location}</span>
        </div>
      </div>

      {!appointment.completed && (
        <div className="mt-4 flex flex-col space-y-2">
          <a
            href={appointment.detailsPath}
            className="text-xs border border-blue-200 rounded-md px-3 py-1.5 bg-blue-50 flex items-center text-blue-600 font-medium hover:bg-blue-100 transition-colors"
          >
            <FaCalendarAlt className="mr-1.5" />
            View appointment details
          </a>

          <a
            href={`/appointments/reschedule/${appointment.id}`}
            className="text-xs border border-gray-200 rounded-md px-3 py-1.5 bg-gray-50 flex items-center text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FaNotesMedical className="mr-1.5" />
            Reschedule appointment
          </a>
        </div>
      )}

      {appointment.completed && (
        <div className="mt-4">
          <a
            href={appointment.detailsPath}
            className="text-xs border border-green-200 rounded-md px-3 py-1.5 bg-green-50 flex items-center text-green-600 font-medium hover:bg-green-100 transition-colors w-full"
          >
            <FaNotesMedical className="mr-1.5" />
            View results
          </a>
        </div>
      )}
    </div>
  );
};

export default AppointmentTooltip;

'use client';

import React from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserMd } from 'react-icons/fa';

import { Appointment } from '@/lib/mockData';

interface AppointmentTooltipProps {
  appointment: Appointment;
  position?: { top: number; left: number };
}

const AppointmentTooltip: React.FC<AppointmentTooltipProps> = ({ appointment, position }) => {
  const formattedTime = appointment.date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedDate = appointment.date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Examination':
        return 'bg-blue-100 text-blue-800';
      case 'Treatment':
        return 'bg-green-100 text-green-800';
      case 'Consultation':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="absolute bg-white shadow-lg rounded-lg p-4 w-72 z-50"
      style={{
        top: position?.top || 0,
        left: position?.left || 0,
      }}
    >
      <div className="mb-2">
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(appointment.type)}`}
        >
          {appointment.type}
        </span>
        {appointment.completed && (
          <span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
            Completed
          </span>
        )}
      </div>
      <h4 className="font-semibold text-gray-800 text-lg mb-2">{appointment.title}</h4>

      <div className="flex items-start mb-2">
        <FaCalendarAlt className="text-gray-500 mt-1 mr-2" />
        <div>
          <p className="text-gray-700">{formattedDate}</p>
          <div className="flex items-center text-gray-600">
            <FaClock className="mr-1" size={12} />
            <span className="text-sm">{formattedTime}</span>
          </div>
        </div>
      </div>

      <div className="flex items-start mb-2">
        <FaUserMd className="text-gray-500 mt-1 mr-2" />
        <p className="text-gray-700">{appointment.provider}</p>
      </div>

      <div className="flex items-start mb-2">
        <FaMapMarkerAlt className="text-gray-500 mt-1 mr-2" />
        <p className="text-gray-700">{appointment.location}</p>
      </div>

      {appointment.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Notes</p>
          <p className="text-gray-700 text-sm">{appointment.notes}</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentTooltip;

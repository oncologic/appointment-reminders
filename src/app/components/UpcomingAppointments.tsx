import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import {
  FaChevronRight,
  FaEye,
  FaHeartbeat,
  FaSpinner,
  FaStethoscope,
  FaTooth,
} from 'react-icons/fa';

import { fetchAppointments } from '@/lib/appointmentService';
import { Appointment } from '@/lib/types';

// Helper function to format date
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// Helper function to format time
const formatTime = (date: Date, endTime?: string): string => {
  const startTime = new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  if (endTime) {
    return `${startTime} - ${endTime}`;
  }

  return startTime;
};

// Helper to get an icon based on appointment type
const getAppointmentIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('dental') || lowerTitle.includes('tooth')) {
    return <FaTooth className="text-green-600 text-xl" />;
  } else if (lowerTitle.includes('cardio') || lowerTitle.includes('heart')) {
    return <FaHeartbeat className="text-red-600 text-xl" />;
  } else if (lowerTitle.includes('eye') || lowerTitle.includes('vision')) {
    return <FaEye className="text-blue-600 text-xl" />;
  }

  // Default icon
  return <FaStethoscope className="text-blue-600 text-xl" />;
};

// Helper to get the last name initial from provider name
const getProviderLastNameInitial = (providerName: string = ''): string => {
  if (!providerName) return '?';
  const nameParts = providerName.split(' ');
  // If there are multiple parts, get the initial of the last part (assumed to be last name)
  if (nameParts.length > 1) {
    return nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  }
  // If just one name, use that
  return providerName.charAt(0).toUpperCase();
};

interface UpcomingAppointmentsProps {
  limit?: number;
  appointments?: Appointment[];
  isLoading?: boolean;
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  limit = 3,
  appointments: propAppointments,
  isLoading: propIsLoading,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalAppointments, setTotalAppointments] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If appointments are provided via props, use them
    if (propAppointments) {
      // Filter to only get upcoming appointments (not completed)
      // And sort by date (closest first)
      const allUpcomingAppointments = propAppointments
        .filter((appt) => !appt.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setTotalAppointments(allUpcomingAppointments.length);
      setAppointments(allUpcomingAppointments.slice(0, limit));
      setIsLoading(propIsLoading || false);
      return;
    }

    // Otherwise fetch appointments from API
    const getAppointments = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAppointments();

        // Filter to only get upcoming appointments (not completed)
        // And sort by date (closest first)
        const allUpcomingAppointments = data
          .filter((appt) => !appt.completed)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setTotalAppointments(allUpcomingAppointments.length);
        setAppointments(allUpcomingAppointments.slice(0, limit));
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    getAppointments();
  }, [limit, propAppointments, propIsLoading]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
          <Link
            href="/appointments"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View all
            <FaChevronRight className="text-sm" />
          </Link>
        </div>
        <div className="p-5 flex justify-center">
          <FaSpinner className="animate-spin text-blue-600 text-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
          <Link
            href="/appointments"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View all
            <FaChevronRight className="text-sm" />
          </Link>
        </div>
        <div className="p-5">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <div className="flex justify-between items-center p-5 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
        <Link
          href="/appointments"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          View all
          <FaChevronRight className="text-sm" />
        </Link>
      </div>
      <div className="p-5">
        {appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No upcoming appointments.
            <Link href="/appointments/new" className="text-blue-600 hover:text-blue-800 ml-2">
              Schedule one now
            </Link>
          </p>
        ) : (
          <>
            {appointments.map((appointment, index) => (
              <div
                key={appointment.id}
                className={`border border-gray-100 rounded-lg p-4 hover:bg-blue-50 transition ${
                  index < appointments.length - 1 ? 'mb-4' : ''
                }`}
              >
                <Link href={`/appointments/${appointment.id}`} className="flex items-center">
                  {appointment.doctor ? (
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-lg mr-4">
                      {getProviderLastNameInitial(appointment.doctor)}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      {getAppointmentIcon(appointment.title)}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{appointment.title}</p>
                    <p className="text-gray-500 text-sm">{appointment.provider}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-blue-100 text-blue-800 text-xs rounded px-2 py-1">
                        {formatDate(appointment.date)}
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs rounded px-2 py-1">
                        {formatTime(appointment.date, appointment.endTime)}
                      </span>
                    </div>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </Link>
              </div>
            ))}

            {totalAppointments > appointments.length && (
              <div className="text-center mt-4 text-gray-500 text-sm">
                <Link href="/appointments" className="hover:text-blue-600 transition-colors">
                  ...and {totalAppointments - appointments.length} more
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UpcomingAppointments;

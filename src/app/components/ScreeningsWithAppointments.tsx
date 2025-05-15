'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaAngleDown, FaAngleUp, FaCalendarPlus } from 'react-icons/fa';

import { useGuidelines } from '@/app/hooks/useGuidelines';
import { useUser } from '@/app/hooks/useUser';
import { fetchAppointments } from '@/lib/appointmentService';
import { Appointment } from '@/lib/types';

import ScreeningAppointments from './ScreeningAppointments';

const ScreeningsWithAppointments = () => {
  const { user } = useUser();
  const { screenings, isLoading } = useGuidelines(user);
  const [expandedScreenings, setExpandedScreenings] = useState<Record<string, boolean>>({});
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Fetch all appointments once to ensure we have complete data
  useEffect(() => {
    const loadAllAppointments = async () => {
      try {
        setLoadingAppointments(true);
        const appointmentsData = await fetchAppointments();
        setAllAppointments(appointmentsData);
      } catch (error) {
        console.error('Failed to load all appointments:', error);
      } finally {
        setLoadingAppointments(false);
      }
    };

    loadAllAppointments();
  }, []);

  const toggleScreening = (screeningId: string) => {
    setExpandedScreenings((prev) => ({
      ...prev,
      [screeningId]: !prev[screeningId],
    }));
  };

  if (isLoading || loadingAppointments) {
    return (
      <div className="animate-pulse rounded-lg bg-white p-4 shadow mb-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (screenings.length === 0) {
    return (
      <div className="rounded-lg bg-white p-4 shadow mb-6">
        <p className="text-gray-500 text-center py-4">No screenings available for your profile.</p>
      </div>
    );
  }

  // Helper function to get appointments for a screening
  const getAppointmentsForScreening = (screening: any): Appointment[] => {
    // First check if appointments are already attached to the screening
    if (screening.appointments && screening.appointments.length > 0) {
      return screening.appointments;
    }

    // As a fallback, manually check all appointments for a matching screeningId
    return allAppointments.filter((a) => a.screeningId === screening.id);
  };

  // Helper function to render appointments for a screening
  const renderAppointments = (screening: any) => {
    if (!expandedScreenings[screening.id]) {
      return null;
    }

    const appointmentsForScreening = getAppointmentsForScreening(screening);

    if (appointmentsForScreening.length > 0) {
      return (
        <div className="mt-4 divide-y">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Appointments</h4>
          {appointmentsForScreening.map((appointment: Appointment) => (
            <Link key={appointment.id} href={appointment.detailsPath}>
              <div className="py-4 flex items-start hover:bg-gray-50 transition px-2 rounded">
                <div
                  className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                    appointment.completed ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                ></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">{appointment.title}</h4>
                    <span
                      className={`text-sm ${
                        appointment.completed ? 'text-gray-500' : 'text-blue-600 font-medium'
                      }`}
                    >
                      {appointment.completed ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{appointment.provider}</p>
                  <div className="text-gray-500 text-sm mt-1">
                    {appointment.date.toLocaleDateString([], {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    at{' '}
                    {appointment.date.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {appointment.result && (
                    <div className="mt-1 text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded inline-block">
                      Result: {appointment.result.status}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
          <div className="pt-3">
            <Link
              href={`/appointments/new?screening=${screening.id}`}
              className="text-blue-600 text-sm flex items-center hover:text-blue-800"
            >
              <FaCalendarPlus className="mr-1" size={14} />
              Schedule Another Appointment
            </Link>
          </div>
        </div>
      );
    }

    // Fall back to the ScreeningAppointments component for dynamic fetching
    return (
      <div className="mt-4">
        <ScreeningAppointments screeningId={screening.id} screeningName={screening.name} />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Your Screenings and Appointments</h2>
        <p className="text-sm text-gray-500">
          View all appointments associated with each screening
        </p>
      </div>

      <div className="divide-y">
        {screenings.map((screening) => (
          <div key={screening.id} className="px-6 py-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleScreening(screening.id)}
            >
              <div>
                <h3 className="font-medium text-gray-800">{screening.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{screening.description}</p>
                <div
                  className={`text-xs inline-block px-2 py-1 rounded mt-2 ${
                    screening.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : screening.status === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : screening.status === 'due'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {screening.status.charAt(0).toUpperCase() + screening.status.slice(1)}
                </div>

                {/* Show badge if there are appointments */}
                {getAppointmentsForScreening(screening).length > 0 && (
                  <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {getAppointmentsForScreening(screening).length} appointment(s)
                  </span>
                )}
              </div>
              <div>
                {expandedScreenings[screening.id] ? (
                  <FaAngleUp className="text-gray-600" />
                ) : (
                  <FaAngleDown className="text-gray-600" />
                )}
              </div>
            </div>

            {renderAppointments(screening)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScreeningsWithAppointments;

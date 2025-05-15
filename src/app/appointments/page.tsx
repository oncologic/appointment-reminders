'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import {
  FaCalendarAlt,
  FaCalendarPlus,
  FaChevronLeft,
  FaList,
  FaPlus,
  FaUserMd,
} from 'react-icons/fa';

import { useGuidelines } from '@/app/hooks/useGuidelines';
import { useUser } from '@/app/hooks/useUser';
import { fetchAppointments } from '@/lib/appointmentService';
import { Appointment } from '@/lib/types';

import YearCalendar from '../components/YearCalendar';

// Create a context for appointments data to avoid duplicate fetching
const AppointmentContext = React.createContext<{
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
}>({
  appointments: [],
  isLoading: true,
  error: null,
});

export const useAppointments = () => React.useContext(AppointmentContext);

type ViewMode = 'calendar' | 'list';

const AppointmentsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get user profile and screenings from the database
  const { user } = useUser();
  const { screenings } = useGuidelines(user);

  // Fetch appointments from the API only once
  useEffect(() => {
    const loadAppointments = async () => {
      // Skip if we already have appointments data
      if (appointments.length > 0) {
        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchAppointments();

        // Convert date strings to Date objects
        const processedAppointments = data.map((appointment) => ({
          ...appointment,
          date: new Date(appointment.date),
          // Ensure each appointment has a detailsPath
          detailsPath: `/appointments/${appointment.id}`,
        }));

        setAppointments(processedAppointments);
        setError(null);
      } catch (err) {
        console.error('Failed to load appointments:', err);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, [appointments.length]); // Only run if appointments array is empty

  // Filter overdue and due screenings for list view
  const dueScreenings = screenings.filter(
    (screening) => screening.status === 'overdue' || screening.status === 'due'
  );

  // Create context value to provide to children
  const appointmentContextValue = {
    appointments,
    isLoading,
    error,
  };

  return (
    <AppointmentContext.Provider value={appointmentContextValue}>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center mr-4">
              <FaChevronLeft className="mr-1" size={14} />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto">
              <div className="inline-flex items-center border rounded-lg overflow-hidden">
                <button
                  className={`px-4 py-2 flex items-center ${
                    viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white'
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  <FaList className="mr-2" />
                  <span>List</span>
                </button>
                <button
                  className={`px-4 py-2 flex items-center ${
                    viewMode === 'calendar' ? 'bg-blue-50 text-blue-600' : 'bg-white'
                  }`}
                  onClick={() => setViewMode('calendar')}
                >
                  <FaCalendarAlt className="mr-2" />
                  <span>Calendar</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Link
                href="/providers"
                className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start hover:bg-gray-50"
              >
                <FaUserMd className="mr-2" />
                Providers
              </Link>
              <Link
                href="/appointments/new"
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start"
              >
                <FaPlus className="mr-2" />
                New appointment
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center py-12">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <p className="text-gray-500 mt-4">Loading appointments...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-blue-600 hover:text-blue-800 underline"
              >
                Try Again
              </button>
            </div>
          ) : viewMode === 'calendar' ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <YearCalendar />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Appointments</h2>
              {appointments.length === 0 && dueScreenings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You don&apos;t have any appointments yet.</p>
                  <Link
                    href="/appointments/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FaPlus className="mr-2" />
                    Schedule Your First Appointment
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {/* Booked Appointments */}
                  {appointments
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((appointment) => (
                      <Link key={appointment.id} href={appointment.detailsPath}>
                        <div className="py-4 flex items-start hover:bg-gray-50 transition px-2 rounded">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                              appointment.type === 'Examination'
                                ? 'bg-blue-500'
                                : appointment.type === 'Treatment'
                                  ? 'bg-green-500'
                                  : 'bg-purple-500'
                            }`}
                          ></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <h3 className="font-semibold text-gray-800">{appointment.title}</h3>
                                {appointment.screeningId && (
                                  <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    Screening
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-sm ${appointment.completed ? 'text-gray-500' : 'text-blue-600 font-medium'}`}
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
                            {appointment.screeningId && (
                              <div className="mt-1 text-xs text-blue-600">
                                {screenings.find((s) => s.id === appointment.screeningId)?.name ||
                                  'Health Screening'}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}

                  {/* Due and Overdue Screenings */}
                  {dueScreenings.length > 0 && (
                    <>
                      {appointments.length > 0 && (
                        <div className="py-4">
                          <h3 className="font-semibold text-gray-800 mb-2">
                            Recommended Screenings
                          </h3>
                          <p className="text-sm text-gray-500">
                            These screenings need to be scheduled
                          </p>
                        </div>
                      )}

                      {dueScreenings.map((screening) => (
                        <Link
                          key={screening.id}
                          href={`/appointments/new?screening=${screening.id}`}
                        >
                          <div className="py-4 flex items-start hover:bg-gray-50 transition px-2 rounded">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                                screening.status === 'overdue' ? 'bg-red-500' : 'bg-orange-400'
                              }`}
                            ></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">{screening.name}</h3>
                                <span
                                  className={`text-sm ${
                                    screening.status === 'overdue'
                                      ? 'text-red-600 font-medium'
                                      : 'text-orange-500 font-medium'
                                  }`}
                                >
                                  {screening.status === 'overdue' ? 'Overdue' : 'Due Soon'}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mt-1">{screening.description}</p>
                              <div className="mt-2">
                                <button className="text-xs text-blue-600 flex items-center">
                                  <FaCalendarPlus className="mr-1" />
                                  Schedule Now
                                </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppointmentContext.Provider>
  );
};

export default AppointmentsPage;

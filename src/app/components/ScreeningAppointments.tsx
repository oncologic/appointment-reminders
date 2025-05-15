'use client';

import Link from 'next/link';
import { FaCalendarPlus } from 'react-icons/fa';

import { useScreeningAppointments } from '@/app/hooks/useScreeningAppointments';

interface ScreeningAppointmentsProps {
  screeningId: string;
  screeningName: string;
}

const ScreeningAppointments = ({ screeningId, screeningName }: ScreeningAppointmentsProps) => {
  const { appointments, isLoading, error } = useScreeningAppointments(screeningId);

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg bg-white p-4 shadow">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white p-4 shadow border-l-4 border-red-500">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow mb-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Appointments for {screeningName}</h3>

      {appointments.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500 mb-4">No appointments found for this screening.</p>
          <Link
            href={`/appointments/new?screening=${screeningId}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaCalendarPlus className="mr-2" />
            Schedule Now
          </Link>
        </div>
      ) : (
        <div className="divide-y">
          {appointments.map((appointment) => (
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
        </div>
      )}
    </div>
  );
};

export default ScreeningAppointments;

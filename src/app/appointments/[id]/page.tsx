import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaClock,
  FaEdit,
  FaMapMarkerAlt,
  FaNotesMedical,
  FaPhoneAlt,
  FaTrashAlt,
  FaUserMd,
} from 'react-icons/fa';

import { Appointment, appointments } from '@/lib/mockData';

interface AppointmentDetailsPageProps {
  params: {
    id: string;
  };
}

const AppointmentDetailsPage: React.FC<AppointmentDetailsPageProps> = ({ params }) => {
  // Find the appointment in our data
  const appointment = appointments.find((a) => a.id === params.id);

  // If appointment not found, return 404
  if (!appointment) {
    notFound();
  }

  const formattedDate = appointment.date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = appointment.date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
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
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/appointments"
        className="text-blue-600 hover:text-blue-800 flex items-center mb-6"
      >
        <FaChevronLeft className="mr-2" />
        Back to appointments
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center mb-2">
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
            <h1 className="text-2xl font-bold text-gray-800">{appointment.title}</h1>
          </div>

          {!appointment.completed && (
            <div className="flex space-x-2">
              <button className="p-2 rounded text-blue-600 hover:bg-blue-50">
                <FaEdit />
              </button>
              <button className="p-2 rounded text-red-600 hover:bg-red-50">
                <FaTrashAlt />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <FaCalendarAlt className="text-blue-600 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaClock className="text-blue-600 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-800">{formattedTime}</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaUserMd className="text-blue-600 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Provider</p>
                  <p className="font-medium text-gray-800">{appointment.provider}</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaMapMarkerAlt className="text-blue-600 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-800">{appointment.location}</p>
                </div>
              </div>

              {appointment.notes && (
                <div className="flex items-start">
                  <FaNotesMedical className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-gray-800">{appointment.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Need to change this appointment?
            </h2>

            {appointment.completed ? (
              <div>
                <p className="text-gray-600 mb-4">
                  This appointment has been completed. If you need a follow-up appointment, you can
                  schedule a new one.
                </p>
                <Link
                  href="/appointments/new"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg"
                >
                  Schedule New Appointment
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <button className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg flex items-center justify-center">
                  <FaEdit className="mr-2" /> Reschedule Appointment
                </button>
                <button className="block w-full bg-white hover:bg-gray-100 text-gray-800 text-center py-2 rounded-lg border border-gray-300 flex items-center justify-center">
                  <FaPhoneAlt className="mr-2" /> Contact Provider
                </button>
                <button className="block w-full text-red-600 hover:text-red-700 text-center py-2 rounded-lg hover:bg-red-50 flex items-center justify-center">
                  <FaTrashAlt className="mr-2" /> Cancel Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsPage;

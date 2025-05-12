'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaList, FaPlus } from 'react-icons/fa';

import { appointments } from '@/lib/mockData';

import YearCalendar from '../components/YearCalendar';

type ViewMode = 'calendar' | 'list';

const AppointmentsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center mr-4">
            <FaChevronLeft className="mr-1" size={14} />
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
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

          <Link
            href="/appointments/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" />
            New appointment
          </Link>
        </div>

        {viewMode === 'calendar' ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <YearCalendar appointments={appointments} />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Appointments</h2>
            <div className="divide-y">
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
                          <h3 className="font-semibold text-gray-800">{appointment.title}</h3>
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
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;

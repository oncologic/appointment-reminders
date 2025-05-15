'use client';

import React, { useState } from 'react';
import {
  FaCalendarAlt,
  FaCalendarPlus,
  FaChevronLeft,
  FaChevronRight,
  FaClipboardCheck,
  FaCog,
  FaExclamationCircle,
  FaStethoscope,
  FaTimes,
  FaUserFriends,
  FaUserMd,
} from 'react-icons/fa';

import { useGuidelines } from '@/app/hooks/useGuidelines';
import { useUser } from '@/app/hooks/useUser';
import { Appointment } from '@/lib/types';

import { useAppointments } from '../appointments/page';
import MonthCalendar from './MonthCalendar';

interface YearCalendarProps {
  initialYear?: number;
}

const YearCalendar: React.FC<YearCalendarProps> = ({ initialYear = 2025 }) => {
  // Get appointments from context instead of props
  const { appointments, isLoading, error } = useAppointments();

  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Get user profile and screenings from the database
  const { user } = useUser();
  const { screenings } = useGuidelines(user);

  // Count appointments by type for the legend
  const appointmentsInYear = appointments.filter((appt) => appt.date.getFullYear() === currentYear);

  const examinationCount = appointmentsInYear.filter((appt) => appt.type === 'Examination').length;
  const treatmentCount = appointmentsInYear.filter((appt) => appt.type === 'Treatment').length;
  const consultationCount = appointmentsInYear.filter(
    (appt) => appt.type === 'Consultation'
  ).length;

  // Get overdue screenings from the database
  const overdueScreenings = screenings
    .filter((screening) => screening.status === 'overdue' || screening.status === 'due')
    .map((screening) => ({
      id: screening.id,
      title: screening.name,
      status: screening.status,
      statusText: `${screening.status === 'overdue' ? 'Overdue' : 'Due'}: ${screening.name}`,
      schedulePath: `/appointments/new?screening=${screening.id}`,
      friendRecommendations: [], // Initialize as empty array since we don't have this data yet
    }));

  const hasNotifications = overdueScreenings.length > 0;

  // Navigate to previous or next year
  const handlePreviousYear = () => {
    setCurrentYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setCurrentYear((prev) => prev + 1);
  };

  const toggleLegend = () => {
    setShowLegend((prev) => !prev);
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  // If still loading appointments, show a loading state
  if (isLoading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // If there was an error loading appointments, show an error state
  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-600 hover:text-blue-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3 md:space-x-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-600" />
            {currentYear} Appointments
          </h2>

          <div className="flex space-x-4">
            <button
              onClick={handlePreviousYear}
              className="p-2 rounded-full hover:bg-blue-50 transition"
              aria-label="Previous Year"
            >
              <FaChevronLeft className="text-gray-700" />
            </button>
            <button
              onClick={handleNextYear}
              className="p-2 rounded-full hover:bg-blue-50 transition"
              aria-label="Next Year"
            >
              <FaChevronRight className="text-gray-700" />
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <div className="text-sm bg-gray-100 rounded-full px-3 py-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
              <span className="text-gray-700">{examinationCount}</span>
            </div>
            <div className="text-sm bg-gray-100 rounded-full px-3 py-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
              <span className="text-gray-700">{treatmentCount}</span>
            </div>
            <div className="text-sm bg-gray-100 rounded-full px-3 py-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span>
              <span className="text-gray-700">{consultationCount}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Notifications Button */}
          {hasNotifications && (
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="p-2 rounded-full hover:bg-blue-50 transition relative"
                aria-label="Notifications"
              >
                <FaExclamationCircle
                  className={`${showNotifications ? 'text-blue-600' : 'text-red-500'} text-xl`}
                />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {overdueScreenings.length}
                </span>
              </button>

              {/* Notifications Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-30 border border-gray-200 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-700">Overdue Screenings</h3>
                    <button
                      onClick={toggleNotifications}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {overdueScreenings.map((screening) => (
                      <div
                        key={screening.id}
                        className="p-2 hover:bg-blue-50 rounded-md mb-2 border border-gray-100"
                      >
                        <div className="flex items-start">
                          <div
                            className={`mt-0.5 w-2 h-2 rounded-full ${screening.status === 'overdue' ? 'bg-red-500' : 'bg-orange-400'} mr-2 flex-shrink-0`}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{screening.title}</p>
                            <p className="text-xs text-gray-500">{screening.statusText}</p>
                            <div className="mt-1.5 flex flex-col space-y-2">
                              <a
                                href={screening.schedulePath}
                                className="text-xs bg-blue-600 text-white hover:bg-blue-700 transition-colors px-3 py-1.5 rounded flex items-center w-full"
                              >
                                <FaCalendarPlus className="mr-1.5 text-[10px]" />
                                Schedule Now
                              </a>

                              {screening.friendRecommendations?.length === 0 && (
                                <a
                                  href={`/recommendations?screening=${screening.id}`}
                                  className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors px-3 py-1.5 rounded flex items-center w-full"
                                >
                                  <FaUserFriends className="mr-1.5 text-[10px]" />
                                  Get Recommendations
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <a
                      href="/recommendations"
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      View all recommendations
                      <FaChevronRight className="ml-1 text-[10px]" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings/Legend Button */}
          <div className="relative">
            <button
              onClick={toggleLegend}
              className="p-2 rounded-full hover:bg-blue-50 transition"
              aria-label="Settings"
            >
              <FaCog className={`${showLegend ? 'text-blue-600' : 'text-gray-600'} text-xl`} />
            </button>

            {/* Legend Panel */}
            {showLegend && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-30 border border-gray-200 p-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-700">Calendar Legend</h3>
                  <button onClick={toggleLegend} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Appointments</p>
                    <div className="grid grid-cols-1 gap-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-xs text-gray-700">
                          Examination ({examinationCount})
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-xs text-gray-700">Treatment ({treatmentCount})</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                        <span className="text-xs text-gray-700">
                          Consultation ({consultationCount})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Screenings</p>
                    <div className="grid grid-cols-1 gap-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-xs text-gray-700">Overdue</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-orange-400 mr-2"></div>
                        <span className="text-xs text-gray-700">Due Soon</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                        <span className="text-xs text-gray-700">Recommended</span>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center border-l-4 border-blue-600 bg-gray-200 opacity-80 w-6 h-3 mr-2"></div>
                        <span className="text-xs text-gray-700">Needs Booking</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Actions</p>
                    <div className="grid grid-cols-1 gap-1">
                      <div className="flex items-center">
                        <div className="w-auto h-5 bg-blue-50 text-blue-600 text-[10px] px-1 rounded-sm flex items-center mr-2">
                          <FaUserFriends className="mr-1 text-[8px]" />
                          Request recommendations
                        </div>
                        <span className="text-xs text-gray-700">Ask friends</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-auto h-5 bg-gray-50 text-gray-600 text-[10px] px-1 rounded-sm flex items-center mr-2">
                          <FaClipboardCheck className="mr-1 text-[8px]" />
                          View guidelines
                        </div>
                        <span className="text-xs text-gray-700">See protocols</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <MonthCalendar month={0} year={currentYear} appointments={appointments} />
          </div>
          <div>
            <MonthCalendar month={1} year={currentYear} appointments={appointments} />
          </div>
          <div>
            <MonthCalendar month={2} year={currentYear} appointments={appointments} />
          </div>
          <div>
            <MonthCalendar month={3} year={currentYear} appointments={appointments} />
          </div>
          <div>
            <MonthCalendar month={4} year={currentYear} appointments={appointments} />
          </div>
          <div>
            <MonthCalendar month={5} year={currentYear} appointments={appointments} />
          </div>
          <div>
            <MonthCalendar month={6} year={currentYear} appointments={appointments} />
          </div>
          <div>
            <MonthCalendar month={7} year={currentYear} appointments={appointments} />
          </div>
          <div>
            <MonthCalendar month={8} year={currentYear} appointments={appointments} />
          </div>
          <div>
            <MonthCalendar month={9} year={currentYear} appointments={appointments} />
          </div>
          <div>
            <MonthCalendar month={10} year={currentYear} appointments={appointments} />
          </div>
          <div>
            <MonthCalendar month={11} year={currentYear} appointments={appointments} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearCalendar;

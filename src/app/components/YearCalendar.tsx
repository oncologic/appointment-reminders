'use client';

import React, { useState } from 'react';
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaClipboardCheck,
  FaStethoscope,
  FaUserMd,
} from 'react-icons/fa';

import { Appointment } from '@/lib/mockData';

import MonthCalendar from './MonthCalendar';

interface YearCalendarProps {
  appointments: Appointment[];
  initialYear?: number;
}

const YearCalendar: React.FC<YearCalendarProps> = ({ appointments, initialYear = 2025 }) => {
  const [currentYear, setCurrentYear] = useState<number>(initialYear);

  // Count appointments by type for the legend
  const appointmentsInYear = appointments.filter((appt) => appt.date.getFullYear() === currentYear);

  const examinationCount = appointmentsInYear.filter((appt) => appt.type === 'Examination').length;
  const treatmentCount = appointmentsInYear.filter((appt) => appt.type === 'Treatment').length;
  const consultationCount = appointmentsInYear.filter(
    (appt) => appt.type === 'Consultation'
  ).length;

  // Navigate to previous or next year
  const handlePreviousYear = () => {
    setCurrentYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setCurrentYear((prev) => prev + 1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
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
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span className="text-gray-700">Examination ({examinationCount})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span className="text-gray-700">Treatment ({treatmentCount})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
            <span className="text-gray-700">Consultation ({consultationCount})</span>
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

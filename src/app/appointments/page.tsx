import Link from 'next/link';
import React from 'react';
import { FaArrowLeft, FaCalendarAlt, FaList, FaPlus } from 'react-icons/fa';

interface Appointment {
  id: string;
  title: string;
  doctorName: string;
  type: 'Examination' | 'Treatment' | 'Consultation';
  time: string;
  date: string;
}

const AppointmentsPage = () => {
  // Mock data for the calendar view
  const currentMonth = 'January 2021';
  const days = [
    { name: 'Monday', number: '04.01' },
    { name: 'Tuesday', number: '05.01' },
    { name: 'Wednesday', number: '06.01' },
    { name: 'Thursday', number: '07.01' },
    { name: 'Friday', number: '08.01' },
    { name: 'Saturday', number: '09.01' },
    { name: 'Sunday', number: '10.01' },
  ];

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'];

  const appointments: Record<string, Appointment[]> = {
    'Monday-08:00': [
      {
        id: '1',
        title: 'Examination',
        doctorName: 'Jørn Simensen',
        type: 'Examination',
        time: '08:00 - 08:30',
        date: 'Monday, 04.01',
      },
    ],
    'Monday-09:00': [
      {
        id: '2',
        title: 'Treatment',
        doctorName: 'Markus Jonsson',
        type: 'Treatment',
        time: '09:00 - 09:30',
        date: 'Monday, 04.01',
      },
    ],
    'Monday-11:00': [
      {
        id: '3',
        title: 'Treatment',
        doctorName: 'Anna Olsen',
        type: 'Treatment',
        time: '11:00 - 11:30',
        date: 'Monday, 04.01',
      },
      {
        id: '4',
        title: 'Examination',
        doctorName: 'Markus Schulz',
        type: 'Examination',
        time: '11:30 - 12:00',
        date: 'Monday, 04.01',
      },
    ],
    'Tuesday-10:00': [
      {
        id: '5',
        title: 'Consultation',
        doctorName: 'Jørn Simensen',
        type: 'Consultation',
        time: '10:00 - 10:30',
        date: 'Tuesday, 05.01',
      },
    ],
    'Thursday-08:00': [
      {
        id: '6',
        title: 'Examination',
        doctorName: 'Anna Olsen',
        type: 'Examination',
        time: '08:00 - 08:30',
        date: 'Thursday, 07.01',
      },
    ],
    'Friday-10:00': [
      {
        id: '7',
        title: 'Examination',
        doctorName: 'John Bo',
        type: 'Examination',
        time: '10:00 - 10:30',
        date: 'Friday, 08.01',
      },
    ],
    'Friday-11:00': [
      {
        id: '8',
        title: 'Consultation',
        doctorName: 'Jørn Simensen',
        type: 'Consultation',
        time: '11:00 - 11:30',
        date: 'Friday, 08.01',
      },
    ],
    'Friday-12:00': [
      {
        id: '9',
        title: 'Consultation',
        doctorName: 'Markus Jonsson',
        type: 'Consultation',
        time: '12:00 - 12:30',
        date: 'Friday, 08.01',
      },
    ],
    'Friday-10:30': [
      {
        id: '10',
        title: 'Examination',
        doctorName: 'Markus Jonsson',
        type: 'Examination',
        time: '10:30 - 11:00',
        date: 'Friday, 08.01',
      },
    ],
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    // Determine the background color based on the appointment type
    const getBgColor = (type: string) => {
      switch (type) {
        case 'Examination':
          return 'border-l-4 border-blue-500 bg-blue-50';
        case 'Treatment':
          return 'border-l-4 border-green-500 bg-green-50';
        case 'Consultation':
          return 'border-l-4 border-purple-500 bg-purple-50';
        default:
          return 'border-l-4 border-gray-500 bg-gray-50';
      }
    };

    return (
      <div className={`p-2 rounded shadow-sm mb-1 ${getBgColor(appointment.type)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">{appointment.doctorName}</p>
            <p className="text-xs text-gray-600">{appointment.type}</p>
          </div>
          <button className="text-gray-400 hover:text-blue-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const getAppointmentsForSlot = (day: string, time: string) => {
    const key = `${day}-${time}`;
    return appointments[key] || [];
  };

  const AppointmentDetail = ({ appointment }: { appointment: Appointment }) => (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Examination</h3>
          <button className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-blue-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">4th Jan 2021</p>
            </div>
          </div>
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-blue-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">08:00 - 08:30</p>
            </div>
          </div>
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-blue-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-500">Service</p>
              <p className="font-medium">Physiotherapy</p>
            </div>
          </div>
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-blue-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">30 min</p>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <button className="w-full py-2 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200">
            Reschedule
          </button>
          <button className="w-full py-2 text-red-600 rounded-lg font-medium hover:bg-red-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-blue-700 mr-4">
                <FaArrowLeft className="mr-2" /> Dashboard
              </Link>
              <h1 className="text-2xl font-bold">Appointments</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center text-gray-700">
                <FaList className="mr-2" /> List
              </button>
              <button className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg flex items-center">
                <FaCalendarAlt className="mr-2" /> Calendar
              </button>
              <Link
                href="/appointments/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700"
              >
                <FaPlus className="mr-2" /> New appointment
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Calendar header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">{currentMonth}</h2>
              <div className="flex ml-4">
                <button className="p-1 rounded-l border border-gray-300 text-gray-600 hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button className="p-1 rounded-r border-t border-r border-b border-gray-300 text-gray-600 hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
              <button className="ml-4 px-3 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100 text-sm">
                Today
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Examination</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Treatment</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-600">Consultation</span>
              </div>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Days header */}
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 text-center border-r bg-gray-50"></div>
                {days.map((day, index) => (
                  <div key={index} className="p-3 text-center border-r bg-gray-50">
                    <p className="font-medium">{day.name}</p>
                    <p className="text-sm text-gray-500">{day.number}</p>
                  </div>
                ))}
              </div>

              {/* Time slots */}
              {timeSlots.map((time, timeIndex) => (
                <div key={timeIndex} className="grid grid-cols-8 border-b">
                  <div className="p-3 text-center border-r bg-gray-50 flex items-center justify-center">
                    <span className="text-sm text-gray-600">{time}</span>
                  </div>
                  {days.map((day, dayIndex) => (
                    <div key={dayIndex} className="p-2 border-r min-h-[100px] relative">
                      {getAppointmentsForSlot(day.name, time).map((appointment) => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppointmentsPage;

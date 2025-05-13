'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import {
  FaCalendarAlt,
  FaChevronRight,
  FaClipboardCheck,
  FaComments,
  FaHeartbeat,
  FaHome,
  FaNotesMedical,
  FaPhoneAlt,
  FaPlus,
  FaShareAlt,
  FaSpinner,
  FaStar,
  FaTooth,
  FaUserMd,
  FaUsers,
} from 'react-icons/fa';

import { fetchAppointments } from '@/lib/appointmentService';
import { UserProfile } from '@/lib/types';

import HealthScreenings from './components/HealthScreenings';
import UpcomingAppointments from './components/UpcomingAppointments';
import useUser from './hooks/useUser';

// Placeholder user for when data is not yet loaded
const defaultUser = {
  name: 'Guest User',
  age: 0,
  gender: 'other',
  id: 'guest',
};

const quickActions = [
  {
    label: 'Book new appointment',
    icon: <FaCalendarAlt className="text-blue-600" />,
    href: '/appointments/new',
  },
  { label: 'Call ambulance', icon: <FaPhoneAlt className="text-red-600" />, href: '#' },
];

const navItems = [
  { label: 'Home', icon: <FaHome />, href: '/' },
  { label: 'Appointments', icon: <FaCalendarAlt />, href: '/appointments' },
  { label: 'Guidelines', icon: <FaClipboardCheck />, href: '/guidelines' },
  { label: 'Friend Recommendations', icon: <FaUsers />, href: '/friend-recommendations' },
];

const appointmentsGoal = 10;

// Helper function to get first name from full name
const getFirstName = (name?: string): string => {
  if (!name) return '';
  return name.split(' ')[0] || name;
};

// Helper function to get last name from full name
const getLastName = (name?: string): string => {
  if (!name) return '';
  const nameParts = name.split(' ');
  return nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
};

const Home: React.FC = () => {
  const { user, isLoading, error, isAuthenticated } = useUser();
  const [appointmentsBooked, setAppointmentsBooked] = useState<number>(0);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState<boolean>(true);

  // Use the API user data or fall back to the default user
  const userData = user || defaultUser;

  // Fetch appointments count
  useEffect(() => {
    const getAppointmentsCount = async () => {
      try {
        setIsAppointmentsLoading(true);
        const appointments = await fetchAppointments();

        // Count both completed and upcoming appointments
        setAppointmentsBooked(appointments.length);
      } catch (error) {
        console.error('Error fetching appointments count:', error);
      } finally {
        setIsAppointmentsLoading(false);
      }
    };

    if (isAuthenticated) {
      getAppointmentsCount();
    }
  }, [isAuthenticated]);

  // Show loader while fetching user data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl mb-4">Please sign in to access your health dashboard</p>
        <Link
          href="/login"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-800">HealthTracker</h1>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {navItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <img src="/avatar.png" alt="avatar" className="w-8 h-8 rounded-full object-cover" />
              <div className="hidden sm:block">
                <p className="font-semibold text-gray-800">{userData?.name || 'User'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="/avatar.png"
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs text-gray-500">Welcome back,</p>
                  <p className="font-semibold text-gray-800">
                    {getFirstName(userData?.name) || 'User'}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                {navItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-6">
            {/* Dashboard Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <FaCalendarAlt className="text-2xl text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-600 font-medium mb-1">Appointments this year</h3>
                  <div className="flex items-center">
                    {isAppointmentsLoading ? (
                      <FaSpinner className="animate-spin text-blue-600 mr-2" />
                    ) : (
                      <span className="text-3xl font-bold text-blue-700">{appointmentsBooked}</span>
                    )}
                    <span className="text-lg text-gray-400 ml-2">/ {appointmentsGoal}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(appointmentsBooked / appointmentsGoal) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments */}
            <UpcomingAppointments limit={2} />
          </div>

          {/* Right column - Health Screenings */}
          <HealthScreenings />
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-lg border-t border-gray-200">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 4).map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="flex flex-col items-center py-1 px-3 text-gray-600"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Home;

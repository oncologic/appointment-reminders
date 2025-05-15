'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import {
  FaBell,
  FaCalendarAlt,
  FaCalendarPlus,
  FaCheck,
  FaChevronDown,
  FaChevronRight,
  FaClipboardCheck,
  FaComments,
  FaHeartbeat,
  FaHome,
  FaNotesMedical,
  FaPhoneAlt,
  FaPlus,
  FaShareAlt,
  FaShieldAlt,
  FaSignOutAlt,
  FaSpinner,
  FaStar,
  FaTooth,
  FaTrophy,
  FaUserMd,
  FaUsers,
} from 'react-icons/fa';

import { fetchAppointments } from '@/lib/appointmentService';
import { createClient } from '@/lib/supabase/client';
import { Appointment, UserProfile } from '@/lib/types';

import HealthScreenings from './components/HealthScreenings';
import UpcomingAppointments from './components/UpcomingAppointments';
import useGuidelines from './hooks/useGuidelines';
import useUser from './hooks/useUser';

// Placeholder user for when data is not yet loaded
const defaultUser = {
  firstName: 'User',
  lastName: 'User',
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

// Helper function to get initial from name
const getInitial = (name?: string): string => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

// Function to generate celebration message based on completion percentage
const getCelebrationMessage = (completed: number, total: number): string => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  if (percentage === 100) return "Amazing! You've completed all your health screenings! 🎉";
  if (percentage >= 75) return "Great progress! You're taking excellent care of your health! 🌟";
  if (percentage >= 50) return 'Halfway there! Keep up the good work with your health journey! 💪';
  if (percentage >= 25) return "Good start! You're on your way to better health! 👍";
  if (percentage > 0) return "You've begun your health journey! Schedule your next screening! 🚀";
  return 'Your health matters! Schedule your first screening today! ❤️';
};

const Home: React.FC = () => {
  const { user, isLoading, error, isAuthenticated } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to handle sign out
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { screenings } = useGuidelines(user);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [completedScreeningsCount, setCompletedScreeningsCount] = useState<number>(0);
  const [scheduledScreeningsCount, setScheduledScreeningsCount] = useState<number>(0);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState<boolean>(true);

  // Use the API user data or fall back to the default user
  const userData = user || defaultUser;

  // Calculate total screenings as the goal
  const totalScreenings = screenings.length;

  // Fetch appointments once at the parent level
  useEffect(() => {
    const getAppointmentsData = async () => {
      try {
        setIsAppointmentsLoading(true);
        const appointmentsData = await fetchAppointments();
        setAppointments(appointmentsData);

        // Get current year
        const currentYear = new Date().getFullYear();

        // Count completed screenings (completed appointments that match screening IDs)
        // Count only screenings completed this year
        const completedCount = appointmentsData.filter((appt) => {
          // Check if appointment is completed
          if (!appt.completed) return false;

          // Check if appointment has a date and it's in the current year
          const appointmentDate = new Date(appt.date);
          const isCurrentYear = appointmentDate.getFullYear() === currentYear;
          if (!isCurrentYear) return false;

          // First check for direct screeningId match
          if (
            appt.screeningId &&
            screenings.some((screening) => screening.id === appt.screeningId)
          ) {
            return true;
          }

          // Fallback to title matching if no screeningId is available
          return screenings.some((screening) =>
            appt.title.toLowerCase().includes(screening.name.toLowerCase())
          );
        }).length;

        // Count scheduled screenings (future appointments that match screening IDs in the current year)
        const scheduledCount = appointmentsData.filter((appt) => {
          // Skip completed appointments (already counted above)
          if (appt.completed) return false;

          // Check if appointment has a date and it's in the current year
          const appointmentDate = new Date(appt.date);
          const isCurrentYear = appointmentDate.getFullYear() === currentYear;
          if (!isCurrentYear) return false;

          // Check if the appointment is in the future
          const isInFuture = appointmentDate > new Date();
          if (!isInFuture) return false;

          // First check for direct screeningId match
          if (
            appt.screeningId &&
            screenings.some((screening) => screening.id === appt.screeningId)
          ) {
            return true;
          }

          // Fallback to title matching if no screeningId is available
          return screenings.some((screening) =>
            appt.title.toLowerCase().includes(screening.name.toLowerCase())
          );
        }).length;

        setCompletedScreeningsCount(completedCount);
        setScheduledScreeningsCount(scheduledCount);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setIsAppointmentsLoading(false);
      }
    };

    if (isAuthenticated && screenings.length > 0) {
      getAppointmentsData();
    }
  }, [isAuthenticated, screenings]);

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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <FaUserMd className="text-2xl text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to Appointment Reminders
          </h2>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard</p>
          <Link
            href="/login"
            className="w-full block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Calculate percentage for screenings completed
  const completionPercentage =
    totalScreenings > 0
      ? Math.min(100, Math.round((completedScreeningsCount / totalScreenings) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-800">ScreeningTracker</h1>
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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 cursor-pointer focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
                    {getInitial(userData?.firstName)}
                  </div>
                  <div className="hidden sm:flex items-center gap-1">
                    <p className="font-semibold text-gray-800">{userData.firstName}</p>
                    <FaChevronDown
                      className={`text-gray-500 text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md py-2 z-10">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <FaSignOutAlt className="text-gray-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
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
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
                  {getInitial(userData?.firstName)}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Welcome back,</p>
                  <p className="font-semibold text-gray-800">
                    {getFirstName(userData?.firstName) || 'User'}
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
            {/* Dashboard Stats - Upgraded premium version */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg mb-6 overflow-hidden">
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-white font-medium text-lg mb-1">Screenings Progress</h3>
                  <p className="text-blue-100 text-sm">Keeping track of your health journey</p>
                </div>

                <div className="flex items-center mb-5">
                  <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-5 relative">
                    {completionPercentage >= 100 ? (
                      <FaTrophy className="text-3xl text-yellow-300" />
                    ) : completionPercentage >= 50 ? (
                      <FaShieldAlt className="text-3xl text-white" />
                    ) : (
                      <FaHeartbeat className="text-3xl text-white" />
                    )}

                    {/* Circle progress indicator */}
                    <svg className="absolute inset-0" width="80" height="80" viewBox="0 0 80 80">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="white"
                        strokeWidth="8"
                        strokeDasharray={`${36 * 2 * Math.PI}`}
                        strokeDashoffset={`${36 * 2 * Math.PI * (1 - completionPercentage / 100)}`}
                        strokeLinecap="round"
                        transform="rotate(-90 40 40)"
                      />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-4xl font-bold text-white">
                        {completedScreeningsCount}
                      </span>
                      <span className="text-xl text-blue-100">/ {totalScreenings}</span>
                    </div>
                    <p className="text-blue-100 mb-2">Screenings completed</p>
                    <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-3">
                      <div
                        className="bg-white h-2 rounded-full"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>

                    {/* Add the scheduled screenings section */}
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xl font-bold text-white">
                            {scheduledScreeningsCount}
                          </span>
                          <span className="text-sm text-blue-100">/ {totalScreenings}</span>
                        </div>
                        <p className="text-blue-100 text-sm mb-2">Screenings scheduled this year</p>
                        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                          <div
                            className="bg-white bg-opacity-50 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.round((scheduledScreeningsCount / totalScreenings) * 100))}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-2 p-1.5 bg-white bg-opacity-20 rounded-full">
                        <FaCalendarAlt className="text-white text-lg" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Celebration message */}
                <div className="bg-white bg-opacity-10 rounded-lg p-4 flex items-start">
                  <FaBell className="text-yellow-300 text-xl mr-3 mt-1 flex-shrink-0" />
                  <p className="text-white">
                    {getCelebrationMessage(scheduledScreeningsCount, totalScreenings)}
                  </p>
                </div>
              </div>

              {/* Bottom action buttons */}
              <div className="bg-indigo-700 px-6 py-3 flex justify-between">
                <Link
                  href="/guidelines"
                  className="text-blue-100 hover:text-white flex items-center text-sm font-medium"
                >
                  <FaCalendarPlus className="mr-2" /> Schedule screening
                </Link>
                <Link
                  href="/appointments"
                  className="text-blue-100 hover:text-white flex items-center text-sm font-medium"
                >
                  <FaChevronRight className="text-sm" /> View all
                </Link>
              </div>
            </div>

            {/* Appointments - Pass down the fetched appointments */}
            <UpcomingAppointments
              limit={2}
              appointments={appointments}
              isLoading={isAppointmentsLoading}
            />
          </div>

          {/* Right column - Health Screenings - Pass down the fetched appointments */}
          <HealthScreenings appointments={appointments} isLoading={isAppointmentsLoading} />
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

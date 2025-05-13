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

import HealthScreenings from './components/HealthScreenings';
import useUser from './hooks/useUser';

// Placeholder user for when data is not yet loaded
const defaultUser = {
  firstName: 'Guest',
  lastName: 'User',
  age: 0,
  gender: 'other',
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

const appointmentsBooked = 7;
const appointmentsGoal = 10;

const Home: React.FC = () => {
  const { user, isLoading, error, isAuthenticated } = useUser();

  // Use the API user data or fall back to the default user
  const userData = user || defaultUser;

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
                <p className="font-semibold text-gray-800">
                  {userData.firstName} {userData.lastName}
                </p>
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
                    {userData.firstName} {userData.lastName}
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
                    <span className="text-3xl font-bold text-blue-700">{appointmentsBooked}</span>
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
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex justify-between items-center p-5 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
                <Link
                  href="/appointments"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View all
                  <FaChevronRight className="text-sm" />
                </Link>
              </div>
              <div className="p-5">
                <div className="border border-gray-100 rounded-lg p-4 mb-4 hover:bg-blue-50 transition">
                  <div className="flex items-center">
                    <img
                      src="/doctor-avatar.png"
                      alt="doctor"
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Aaron David Supratman, MD</p>
                      <p className="text-gray-500 text-sm">Gastroenterology</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-blue-100 text-blue-800 text-xs rounded px-2 py-1">
                          Monday, May 9, 2022
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-xs rounded px-2 py-1">
                          8:00 - 8:45 am
                        </span>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </div>
                </div>
                <div className="border border-gray-100 rounded-lg p-4 hover:bg-blue-50 transition">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <FaTooth className="text-green-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Dental Cleaning</p>
                      <p className="text-gray-500 text-sm">Dr. Sarah Johnson</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-blue-100 text-blue-800 text-xs rounded px-2 py-1">
                          Wednesday, May 18, 2022
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-xs rounded px-2 py-1">
                          10:30 - 11:30 am
                        </span>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
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

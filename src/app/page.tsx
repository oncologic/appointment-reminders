import Link from 'next/link';
import React from 'react';
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
  FaSearch,
  FaShareAlt,
  FaStar,
  FaTooth,
  FaUserMd,
  FaUsers,
} from 'react-icons/fa';

const user = {
  name: 'Ashley Octavia',
  avatar: '/avatar.png', // Placeholder, add your own image in public/
  age: 38,
  gender: 'female',
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
  { label: 'Search', icon: <FaSearch />, href: '#' },
  { label: 'Appointments', icon: <FaCalendarAlt />, href: '/appointments' },
  { label: 'Recommendations', icon: <FaClipboardCheck />, href: '/recommendations' },
];

const appointmentsBooked = 7;
const appointmentsGoal = 10;

// Define social recommendation data
const friendRecommendations = {
  'Annual Physical': [
    {
      friendName: 'Jessica Miller',
      providerName: 'Dr. Michael Chen',
      rating: 5,
      comment: 'Great doctor, very thorough and takes time to explain everything.',
    },
  ],
  'Cervical Cancer (Pap)': [
    {
      friendName: 'Lisa Thompson',
      providerName: 'Dr. Sarah Williams',
      rating: 4,
      comment: 'Very professional and gentle. The office staff is also wonderful.',
    },
  ],
  Mammogram: [], // No recommendations yet
  Colonoscopy: [
    {
      friendName: 'Tom Johnson',
      providerName: 'Dr. Robert Garcia',
      rating: 5,
      comment:
        'The prep is the worst part, but Dr. Garcia made the procedure as comfortable as possible.',
    },
  ],
  'Cholesterol Screening': [
    {
      friendName: 'Emma Davis',
      providerName: 'Dr. James Wilson',
      rating: 5,
      comment: 'The lab is very efficient and Dr. Wilson explained all the results thoroughly.',
    },
    {
      friendName: 'Kevin Brown',
      providerName: 'HealthFirst Labs',
      rating: 4,
      comment: 'Quick service and they have multiple locations around the city.',
    },
  ],
};

const Home: React.FC = () => {
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
              <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
              <div className="hidden sm:block">
                <p className="font-semibold text-gray-800">{user.name}</p>
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
                  src={user.avatar}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs text-gray-500">Welcome back,</p>
                  <p className="font-semibold text-gray-800">{user.name}</p>
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
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex justify-between items-center p-5 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Upcoming health screenings</h2>
                <Link
                  href="/recommendations"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View all
                  <FaChevronRight className="text-sm" />
                </Link>
              </div>
              <div className="py-2">
                <div className="px-5 py-3 hover:bg-gray-50 transition">
                  <Link
                    href="/appointments/new?screening=annual-physical"
                    className="flex items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                      <FaUserMd className="text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">
                            Annual Physical
                            {friendRecommendations['Annual Physical']?.length > 0 && (
                              <span className="ml-2 bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5 inline-flex items-center">
                                <FaUsers className="mr-1" size={10} />
                                {friendRecommendations['Annual Physical'].length}
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 text-xs">Comprehensive examination</p>
                        </div>
                        <div className="text-orange-600 font-medium text-sm">Due in 2 months</div>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400 ml-3" />
                  </Link>
                  <div className="mt-2 pl-14 flex space-x-4">
                    <Link
                      href="/recommendations/providers?screening=annual-physical"
                      className="text-xs text-blue-600 flex items-center"
                    >
                      <FaUsers className="mr-1" /> Get recommendations
                    </Link>
                  </div>
                </div>
                <div className="px-5 py-3 hover:bg-gray-50 transition">
                  <Link
                    href="/appointments/new?screening=cervical-cancer"
                    className="flex items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                      <FaClipboardCheck className="text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">
                            Cervical Cancer (Pap)
                            {friendRecommendations['Cervical Cancer (Pap)']?.length > 0 && (
                              <span className="ml-2 bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5 inline-flex items-center">
                                <FaUsers className="mr-1" size={10} />
                                {friendRecommendations['Cervical Cancer (Pap)'].length}
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 text-xs">Screening test</p>
                        </div>
                        <div className="text-red-600 font-medium text-sm">Overdue</div>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400 ml-3" />
                  </Link>
                  <div className="mt-2 pl-14 flex space-x-4">
                    <Link
                      href="/recommendations/providers?screening=cervical-cancer"
                      className="text-xs text-blue-600 flex items-center"
                    >
                      <FaUsers className="mr-1" /> Get recommendations
                    </Link>
                  </div>
                </div>
                <div className="px-5 py-3 hover:bg-gray-50 transition">
                  <Link
                    href="/appointments/new?screening=skin-cancer"
                    className="flex items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <FaSearch className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">Skin Cancer Check</p>
                          <p className="text-gray-500 text-xs">Full-body examination</p>
                        </div>
                        <div className="text-blue-600 font-medium text-sm">Due in 8 months</div>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400 ml-3" />
                  </Link>
                </div>
                <div className="px-5 py-3 hover:bg-gray-50 transition">
                  <Link
                    href="/appointments/new?screening=breast-exam"
                    className="flex items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <FaHeartbeat className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">Breast Exam (Clinical)</p>
                          <p className="text-gray-500 text-xs">Physical examination</p>
                        </div>
                        <div className="text-green-600 font-medium text-sm">Completed</div>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400 ml-3" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex justify-between items-center p-5 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Future recommended screenings
                </h2>
                <Link
                  href="/recommendations"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View all
                  <FaChevronRight className="text-sm" />
                </Link>
              </div>
              <div className="py-2">
                <div className="px-5 py-3 hover:bg-gray-50 transition">
                  <Link href="/appointments/new?screening=mammogram" className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-4">
                      <FaHeartbeat className="text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">
                            Mammogram
                            {friendRecommendations['Mammogram']?.length > 0 && (
                              <span className="ml-2 bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5 inline-flex items-center">
                                <FaUsers className="mr-1" size={10} />
                                {friendRecommendations['Mammogram'].length}
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 text-xs">Breast cancer screening</p>
                        </div>
                        <div className="text-gray-600 font-medium text-sm">
                          Due in 2 years (age 40)
                        </div>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400 ml-3" />
                  </Link>
                  <div className="mt-2 pl-14 flex space-x-4">
                    <Link
                      href="/recommendations/providers?screening=mammogram"
                      className="text-xs text-blue-600 flex items-center"
                    >
                      <FaUsers className="mr-1" /> Get recommendations
                    </Link>
                  </div>
                </div>
                <div className="px-5 py-3 hover:bg-gray-50 transition">
                  <Link
                    href="/appointments/new?screening=colonoscopy"
                    className="flex items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <FaUserMd className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">
                            Colonoscopy
                            {friendRecommendations['Colonoscopy']?.length > 0 && (
                              <span className="ml-2 bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5 inline-flex items-center">
                                <FaUsers className="mr-1" size={10} />
                                {friendRecommendations['Colonoscopy'].length}
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 text-xs">Colon cancer screening</p>
                        </div>
                        <div className="text-gray-600 font-medium text-sm">
                          Due in 7 years (age 45)
                        </div>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400 ml-3" />
                  </Link>
                  <div className="mt-2 pl-14 flex space-x-4">
                    <Link
                      href="/recommendations/providers?screening=colonoscopy"
                      className="text-xs text-blue-600 flex items-center"
                    >
                      <FaUsers className="mr-1" /> Get recommendations
                    </Link>
                  </div>
                </div>
                <div className="px-5 py-3 hover:bg-gray-50 transition">
                  <Link
                    href="/appointments/new?screening=cholesterol"
                    className="flex items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <FaClipboardCheck className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">
                            Cholesterol Screening
                            {friendRecommendations['Cholesterol Screening']?.length > 0 && (
                              <span className="ml-2 bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5 inline-flex items-center">
                                <FaUsers className="mr-1" size={10} />
                                {friendRecommendations['Cholesterol Screening'].length}
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 text-xs">Lipid profile test</p>
                        </div>
                        <div className="text-gray-600 font-medium text-sm">Due in 3 years</div>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400 ml-3" />
                  </Link>
                  <div className="mt-2 pl-14 flex space-x-4">
                    <Link
                      href="/recommendations/providers?screening=cholesterol"
                      className="text-xs text-blue-600 flex items-center"
                    >
                      <FaUsers className="mr-1" /> Get recommendations
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-lg border-t border-gray-200">
        <div className="flex justify-around py-2">
          {navItems.map((item, idx) => (
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

import Link from 'next/link';
import React from 'react';
import {
  FaArrowLeft,
  FaCalendarPlus,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from 'react-icons/fa';

interface ScreeningRecommendation {
  id: string;
  name: string;
  description: string;
  frequency: string;
  ageRange: string;
  lastCompleted?: string;
  dueDate: string;
  status: 'completed' | 'due' | 'overdue' | 'upcoming';
  notes?: string;
}

// User profile data to tailor recommendations
const user = {
  name: 'Ashley Octavia',
  age: 38,
  gender: 'female',
  riskFactors: {
    familyHistoryBreastCancer: false,
    familyHistoryColonCancer: false,
    smoking: false,
    sunExposure: 'moderate',
  },
};

const GuidelinesPage = () => {
  // Screenings tailored for a 38-year-old female
  const screenings: ScreeningRecommendation[] = [
    {
      id: '1',
      name: 'Annual Physical Exam',
      description:
        'Comprehensive health check including blood pressure, cholesterol and glucose screening',
      frequency: 'Annual',
      ageRange: 'All adults',
      lastCompleted: 'March 15, 2023',
      dueDate: 'March 15, 2024',
      status: 'upcoming',
    },
    {
      id: '2',
      name: 'Cervical Cancer Screening (Pap test)',
      description: 'Screening test for cervical cancer and HPV',
      frequency: 'Every 3 years (age 21-29), every 5 years with HPV co-testing (age 30-65)',
      ageRange: '21-65 years (female)',
      lastCompleted: 'January 10, 2020',
      dueDate: 'January 10, 2023',
      status: 'overdue',
    },
    {
      id: '3',
      name: 'Skin Cancer Screening',
      description: 'Full body examination for suspicious moles or lesions',
      frequency: 'Annual, more frequent with risk factors',
      ageRange: 'Adults with risk factors',
      lastCompleted: 'September 5, 2023',
      dueDate: 'September 5, 2024',
      status: 'upcoming',
    },
    {
      id: '4',
      name: 'Clinical Breast Exam',
      description: 'Physical examination of the breast by a healthcare provider',
      frequency: 'Every 1-3 years',
      ageRange: '25-39 years (female)',
      lastCompleted: 'March 15, 2023',
      dueDate: 'March 15, 2024',
      status: 'completed',
    },
    {
      id: '5',
      name: 'Mammogram',
      description: 'X-ray screening for breast cancer',
      frequency: 'Every 1-2 years starting at age 40',
      ageRange: '40-74 years (female)',
      lastCompleted: undefined,
      dueDate: 'July 15, 2025',
      status: 'upcoming',
      notes: 'Will become relevant in 2 years',
    },
    {
      id: '6',
      name: 'Colonoscopy',
      description: 'Examination of the large intestine for precancerous polyps and cancer',
      frequency: 'Every 10 years starting at age 45',
      ageRange: '45-75 years',
      lastCompleted: undefined,
      dueDate: 'June 10, 2028',
      status: 'upcoming',
      notes: 'Will become relevant in 7 years',
    },
    {
      id: '7',
      name: 'Dental Examination and Cleaning',
      description: 'Professional cleaning and dental examination',
      frequency: 'Every 6 months',
      ageRange: 'All ages',
      lastCompleted: 'October 12, 2023',
      dueDate: 'April 12, 2024',
      status: 'upcoming',
    },
    {
      id: '8',
      name: 'Eye Examination',
      description: 'Comprehensive eye health and vision test',
      frequency: 'Every 2 years',
      ageRange: 'Adults 18-60 years',
      lastCompleted: 'February 8, 2022',
      dueDate: 'February 8, 2024',
      status: 'due',
    },
    {
      id: '9',
      name: 'Blood Pressure Screening',
      description: 'Monitoring of blood pressure levels',
      frequency: 'Annual',
      ageRange: '18+ years',
      lastCompleted: 'March 15, 2023',
      dueDate: 'March 15, 2024',
      status: 'upcoming',
    },
    {
      id: '10',
      name: 'Cholesterol Test',
      description: 'Lipid profile to check cholesterol levels',
      frequency: 'Every 4-6 years for average risk',
      ageRange: '20+ years',
      lastCompleted: 'March 15, 2021',
      dueDate: 'March 15, 2025',
      status: 'upcoming',
    },
    {
      id: '11',
      name: 'Mental Health Screening',
      description: 'Assessment for depression, anxiety and other mental health conditions',
      frequency: 'As recommended by healthcare provider',
      ageRange: 'All adults',
      lastCompleted: undefined,
      dueDate: 'March 15, 2024',
      status: 'due',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm">
            <FaCheckCircle /> Completed
          </span>
        );
      case 'due':
        return (
          <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-sm">
            <FaClock /> Due Soon
          </span>
        );
      case 'overdue':
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-sm">
            <FaExclamationTriangle /> Overdue
          </span>
        );
      case 'upcoming':
        return (
          <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-sm">
            <FaClock /> Upcoming
          </span>
        );
      default:
        return null;
    }
  };

  const getAgeBasedRecommendations = () => {
    return (
      <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Age & Gender-Based Recommendations
        </h2>
        <div className="mb-4">
          <p className="text-gray-600">
            Personalized for:{' '}
            <span className="font-medium">
              {user.age} year old, {user.gender}
            </span>
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              Current Recommendations (Ages 35-39)
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1"></div>
                <span>Annual physical exam</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1"></div>
                <span>Blood pressure screening (annual)</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1"></div>
                <span>Cervical cancer screening (every 3-5 years)</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1"></div>
                <span>Clinical breast exam (every 1-3 years)</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1"></div>
                <span>Skin cancer screening (annual if risk factors)</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1"></div>
                <span>Cholesterol test (every 4-6 years)</span>
              </li>
            </ul>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-800 mb-2">Coming Soon (Ages 40-44)</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 rounded-full bg-green-600 mt-1"></div>
                <span>All previous screenings</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 rounded-full bg-green-600 mt-1"></div>
                <span>Mammogram (starting at 40, every 1-2 years)</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 rounded-full bg-green-600 mt-1"></div>
                <span>Diabetes screening (every 3 years)</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 rounded-full bg-green-600 mt-1"></div>
                <span>Thyroid function test (if symptomatic)</span>
              </li>
            </ul>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-purple-800 mb-2">Future Planning (Ages 45+)</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600 mt-1"></div>
                <span>All previous screenings</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600 mt-1"></div>
                <span>Colonoscopy (starting at 45, every 10 years)</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600 mt-1"></div>
                <span>Lung cancer screening (if history of smoking)</span>
              </li>
              <li className="flex items-baseline gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600 mt-1"></div>
                <span>Comprehensive eye exam (more frequent)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Filter age-relevant screenings
  const relevantScreenings = screenings.filter((screening) => {
    // Parse the age range to check if this screening is currently relevant
    const ageRange = screening.ageRange;

    // For screenings that are for all adults or specific to user's gender
    if (ageRange.includes('All') || ageRange.toLowerCase().includes(user.gender)) {
      return true;
    }

    // Extract age numbers from ranges like "21-65 years"
    const matches = ageRange.match(/(\d+)[-–](\d+)/);
    if (matches) {
      const minAge = parseInt(matches[1]);
      const maxAge = parseInt(matches[2]);
      return user.age >= minAge && user.age <= maxAge;
    }

    // Check for screenings that start at a certain age
    const startingMatch = ageRange.match(/(\d+)\+/);
    if (startingMatch) {
      const startAge = parseInt(startingMatch[1]);
      return user.age >= startAge;
    }

    return false;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mb-4"
        >
          <FaArrowLeft className="text-sm" /> Back to home
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Health Screening Guidelines</h1>
        <p className="text-gray-600 mb-8">
          Recommended health screenings based on your age, gender, and risk factors
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Filter Screenings</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Status</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Due Soon</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Overdue</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Upcoming</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Completed</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Category</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Cancer Screening</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">General Health</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Preventive Care</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Time Frame</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Currently Relevant</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Future Recommendations</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {getAgeBasedRecommendations()}

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Your Recommended Screenings</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {screenings.map((screening) => (
                  <div
                    key={screening.id}
                    className={`p-6 hover:bg-gray-50 ${
                      screening.notes?.includes('relevant in') ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{screening.name}</h3>
                          <div className="ml-3">{getStatusBadge(screening.status)}</div>
                        </div>
                        <p className="text-gray-600 mb-2">{screening.description}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Recommended: {screening.frequency}</p>
                          <p>Age Range: {screening.ageRange}</p>
                          {screening.lastCompleted && (
                            <p>Last completed: {screening.lastCompleted}</p>
                          )}
                          <p>Next due: {screening.dueDate}</p>
                          {screening.notes && (
                            <p className="text-blue-600 italic">{screening.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Link
                          href={`/appointments/new?screening=${encodeURIComponent(screening.name)}`}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm 
                          ${
                            screening.notes?.includes('relevant in')
                              ? 'text-gray-500 bg-gray-200 hover:bg-gray-300 cursor-not-allowed'
                              : 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          }`}
                        >
                          <FaCalendarPlus className="mr-2" />{' '}
                          {screening.notes?.includes('relevant in')
                            ? 'Not Available Yet'
                            : 'Schedule'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesPage;

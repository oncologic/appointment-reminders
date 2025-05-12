'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaRegClock, FaRegComment, FaUserMd } from 'react-icons/fa';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  image?: string;
}

interface ServiceType {
  id: string;
  name: string;
  description: string;
  duration: string;
  relevantForAge?: [number, number]; // [minAge, maxAge]
}

// Create a wrapper component for the page that uses useSearchParams
const NewAppointmentPageWrapper = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
      }
    >
      <NewAppointmentPage />
    </Suspense>
  );
};

const NewAppointmentPage = () => {
  const searchParams = useSearchParams();
  const screeningParam = searchParams.get('screening');

  // State for selected service
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  // Mock data - tailored for a 38-year-old female
  const serviceTypes: ServiceType[] = [
    {
      id: '1',
      name: 'Annual Physical Exam',
      description: 'Comprehensive health assessment, blood pressure screening, and preventive care',
      duration: '45 minutes',
      relevantForAge: [18, 120], // All adults
    },
    {
      id: '2',
      name: 'Clinical Breast Exam',
      description: 'Physical examination of the breast by a healthcare provider',
      duration: '30 minutes',
      relevantForAge: [25, 39], // Women 25-39
    },
    {
      id: '3',
      name: 'Cervical Cancer Screening (Pap test)',
      description: 'Screening test for cervical cancer and HPV',
      duration: '30 minutes',
      relevantForAge: [21, 65], // Women 21-65
    },
    {
      id: '4',
      name: 'Skin Cancer Screening',
      description: 'Full-body skin examination',
      duration: '30 minutes',
      relevantForAge: [18, 120], // Adults with risk factors
    },
    {
      id: '5',
      name: 'Mammogram',
      description: 'X-ray screening for breast cancer',
      duration: '30 minutes',
      relevantForAge: [40, 74], // Women 40-74
    },
    {
      id: '6',
      name: 'Colonoscopy',
      description: 'Examination of the colon for cancer screening',
      duration: '90 minutes',
      relevantForAge: [45, 75], // Adults 45-75
    },
    {
      id: '7',
      name: 'Dental Examination',
      description: 'Comprehensive dental check-up and cleaning',
      duration: '60 minutes',
      relevantForAge: [18, 120], // All adults
    },
    {
      id: '8',
      name: 'Eye Examination',
      description: 'Comprehensive vision and eye health test',
      duration: '45 minutes',
      relevantForAge: [18, 60], // Adults 18-60
    },
    {
      id: '9',
      name: 'Cholesterol Test',
      description: 'Blood test to check cholesterol and lipid levels',
      duration: '15 minutes',
      relevantForAge: [20, 120], // Adults 20+
    },
    {
      id: '10',
      name: 'Mental Health Screening',
      description: 'Assessment for depression, anxiety and other mental health conditions',
      duration: '60 minutes',
      relevantForAge: [18, 120], // All adults
    },
  ];

  // Define user age for relevance filtering
  const userAge = 38;
  const userGender = 'female';

  // Filter service types by age relevance
  const relevantServiceTypes = serviceTypes.filter((service) => {
    if (!service.relevantForAge) return true;
    const [minAge, maxAge] = service.relevantForAge;
    return userAge >= minAge && userAge <= maxAge;
  });

  // Find service matching screening parameter
  useEffect(() => {
    if (screeningParam) {
      const matchingService = serviceTypes.find((service) =>
        service.name.toLowerCase().includes(screeningParam.toLowerCase())
      );
      if (matchingService) {
        setSelectedService(matchingService.id);
      }
    }
  }, [screeningParam]);

  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialization: 'Family Medicine',
      image: '/doctor-avatar.png',
    },
    {
      id: '2',
      name: 'Dr. James Wilson',
      specialization: 'Internal Medicine',
      image: '/doctor-avatar.png',
    },
    {
      id: '3',
      name: 'Dr. Maria Rodriguez',
      specialization: 'Dermatology',
      image: '/doctor-avatar.png',
    },
    {
      id: '4',
      name: 'Dr. David Kim',
      specialization: 'Gastroenterology',
      image: '/doctor-avatar.png',
    },
    {
      id: '5',
      name: 'Dr. Emily Chen',
      specialization: 'Oncology',
      image: '/doctor-avatar.png',
    },
    {
      id: '6',
      name: 'Dr. Lisa Williams',
      specialization: 'Gynecology',
      image: '/doctor-avatar.png',
    },
    {
      id: '7',
      name: 'Dr. Robert Smith',
      specialization: 'Dentistry',
      image: '/doctor-avatar.png',
    },
    {
      id: '8',
      name: 'Dr. Michael Brown',
      specialization: 'Ophthalmology',
      image: '/doctor-avatar.png',
    },
    {
      id: '9',
      name: 'Dr. Jennifer Parker',
      specialization: 'Psychiatry',
      image: '/doctor-avatar.png',
    },
  ];

  // Filter doctors based on selected service
  const getRelevantDoctors = () => {
    if (!selectedService) return doctors;

    const service = serviceTypes.find((s) => s.id === selectedService);
    if (!service) return doctors;

    // Filter doctors based on service type
    switch (service.name) {
      case 'Clinical Breast Exam':
      case 'Cervical Cancer Screening (Pap test)':
        return doctors.filter(
          (d) => d.specialization === 'Gynecology' || d.specialization === 'Family Medicine'
        );
      case 'Skin Cancer Screening':
        return doctors.filter((d) => d.specialization === 'Dermatology');
      case 'Mammogram':
        return doctors.filter(
          (d) =>
            d.specialization === 'Oncology' ||
            d.specialization === 'Radiology' ||
            d.specialization === 'Gynecology'
        );
      case 'Colonoscopy':
        return doctors.filter((d) => d.specialization === 'Gastroenterology');
      case 'Dental Examination':
        return doctors.filter((d) => d.specialization === 'Dentistry');
      case 'Eye Examination':
        return doctors.filter((d) => d.specialization === 'Ophthalmology');
      case 'Mental Health Screening':
        return doctors.filter((d) => d.specialization === 'Psychiatry');
      default:
        return doctors.filter(
          (d) => d.specialization === 'Family Medicine' || d.specialization === 'Internal Medicine'
        );
    }
  };

  const relevantDoctors = getRelevantDoctors();

  const DateSelector = () => {
    const [selectedDay, setSelectedDay] = useState<number>(18);
    const today = 15; // Assuming day 15 is today for the demo

    return (
      <div>
        <div className="grid grid-cols-7 gap-4 text-center mb-4">
          <div className="text-sm font-medium text-gray-600">Sun</div>
          <div className="text-sm font-medium text-gray-600">Mon</div>
          <div className="text-sm font-medium text-gray-600">Tue</div>
          <div className="text-sm font-medium text-gray-600">Wed</div>
          <div className="text-sm font-medium text-gray-600">Thu</div>
          <div className="text-sm font-medium text-gray-600">Fri</div>
          <div className="text-sm font-medium text-gray-600">Sat</div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(31)].map((_, i) => {
            const day = i + 1;
            const isToday = day === today;
            const isSelected = day === selectedDay;
            const isAvailable = day >= today && day < 30;
            const isPast = day < today;

            return (
              <button
                key={i}
                onClick={() => isAvailable && setSelectedDay(day)}
                disabled={!isAvailable}
                className={`h-10 w-full flex items-center justify-center rounded-md text-sm font-medium transition-colors
                  ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : isToday
                        ? 'bg-blue-100 text-blue-800'
                        : isAvailable
                          ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          : isPast
                            ? 'text-gray-300 bg-white'
                            : 'text-gray-300 bg-gray-50 cursor-not-allowed'
                  }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const TimeSelector = () => {
    const timeSlots = [
      '9:00 AM',
      '9:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '1:00 PM',
      '1:30 PM',
      '2:00 PM',
      '2:30 PM',
      '3:00 PM',
      '3:30 PM',
      '4:00 PM',
      '4:30 PM',
    ];

    const [selectedTime, setSelectedTime] = useState<string>('10:30 AM');

    return (
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {timeSlots.map((time, index) => (
          <button
            key={index}
            onClick={() => setSelectedTime(time)}
            className={`h-12 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
              time === selectedTime
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {time}
          </button>
        ))}
      </div>
    );
  };

  // Get default notes based on selected service
  const getDefaultNotes = () => {
    if (!selectedService) return '';

    const service = serviceTypes.find((s) => s.id === selectedService);
    if (!service) return '';

    return `Scheduling ${service.name} as recommended for ${userAge}-year-old ${userGender}.`;
  };

  // Determine if a service is age-appropriate
  const isServiceAgeAppropriate = (service: ServiceType) => {
    if (!service.relevantForAge) return true;
    const [minAge, maxAge] = service.relevantForAge;
    return userAge >= minAge && userAge <= maxAge;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/appointments" className="flex items-center text-blue-700 mr-4">
                <FaArrowLeft className="mr-2" /> Back to Appointments
              </Link>
              <h1 className="text-2xl font-bold">Book New Appointment</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full">
                  1
                </div>
                <div className="ml-2 font-medium text-blue-600">Service</div>
              </div>
              <div className="flex-1 h-1 mx-4 bg-blue-200">
                <div className="w-1/3 h-1 bg-blue-600"></div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-700 rounded-full">
                  2
                </div>
                <div className="ml-2 font-medium text-gray-500">Date & Time</div>
              </div>
              <div className="flex-1 h-1 mx-4 bg-gray-200"></div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-700 rounded-full">
                  3
                </div>
                <div className="ml-2 font-medium text-gray-500">Confirm</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Select Service Type */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-600" /> Select Service Type
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Based on recommendations for a {userAge}-year-old {userGender})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceTypes.map((service) => {
                  const isRelevant = isServiceAgeAppropriate(service);
                  const isSelected = selectedService === service.id;

                  return (
                    <div
                      key={service.id}
                      onClick={() => isRelevant && setSelectedService(service.id)}
                      className={`border rounded-lg p-4 ${isRelevant ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} 
                        ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : isRelevant
                              ? 'border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                              : 'border-gray-200'
                        }`}
                    >
                      <h3 className="font-medium text-gray-800">{service.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">Duration: {service.duration}</p>
                        {!isRelevant && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Not recommended at age {userAge}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Select Doctor */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <FaUserMd className="mr-2 text-blue-600" /> Select Healthcare Provider
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relevantDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor.id)}
                    className={`border rounded-lg p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-200 ${
                      selectedDoctor === doctor.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-800">{doctor.name}</h3>
                        <p className="text-sm text-gray-500">{doctor.specialization}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Select Date and Time */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <FaRegClock className="mr-2 text-blue-600" /> Select Date and Time
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Select Date</h3>
                  <DateSelector />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Select Time</h3>
                  <TimeSelector />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <FaRegComment className="mr-2 text-blue-600" /> Additional Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Please provide any additional information that might be relevant for your appointment..."
                  defaultValue={getDefaultNotes()}
                ></textarea>
              </div>
            </div>

            {/* Action buttons */}
            <div className="bg-gray-50 p-6 flex justify-between">
              <Link
                href="/appointments"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Link>
              <div className="space-x-3">
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">
                  Save as Draft
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewAppointmentPageWrapper;

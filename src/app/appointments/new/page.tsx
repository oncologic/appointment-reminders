'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaPlus,
  FaRegClock,
  FaRegComment,
  FaUserMd,
} from 'react-icons/fa';
import { IoLogoMicrosoft } from 'react-icons/io5';

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
  const [customService, setCustomService] = useState<string>('');
  const [showCustomService, setShowCustomService] = useState<boolean>(false);
  const [customDoctor, setCustomDoctor] = useState<{ name: string; specialization: string }>({
    name: '',
    specialization: '',
  });
  const [showCustomDoctor, setShowCustomDoctor] = useState<boolean>(false);
  const [isPastAppointment, setIsPastAppointment] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [appointmentResult, setAppointmentResult] = useState<string>('');

  // State to track current step and notes
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  // State for my screenings
  const [myScreenings, setMyScreenings] = useState<ServiceType[]>([]);

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

  // Try to load user's selected screenings from local storage
  useEffect(() => {
    try {
      const userPreferences = localStorage.getItem('user_preferences');
      if (userPreferences) {
        const { selectedGuidelineIds } = JSON.parse(userPreferences);
        if (selectedGuidelineIds && selectedGuidelineIds.length > 0) {
          // In a real app, you would fetch these from an API using the IDs
          // For now, we'll just assume these are the user's selected screenings
          const userScreenings = [
            {
              id: '100',
              name: 'Breast Cancer Screening',
              description: 'Mammogram screening for early breast cancer detection',
              duration: '30 minutes',
              relevantForAge: [40, 74] as [number, number],
            },
            {
              id: '101',
              name: 'Cervical Cancer Screening',
              description: 'Pap test for cervical cancer detection',
              duration: '30 minutes',
              relevantForAge: [21, 65] as [number, number],
            },
            {
              id: '102',
              name: 'Cholesterol Screening',
              description: 'Blood test to check cholesterol levels',
              duration: '15 minutes',
              relevantForAge: [20, 120] as [number, number],
            },
          ];
          setMyScreenings(userScreenings);
        }
      }
    } catch (error) {
      console.error('Error loading user screenings:', error);
    }
  }, []);

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
      // First check in my screenings
      const matchingScreening = myScreenings.find((service) =>
        service.name.toLowerCase().includes(screeningParam.toLowerCase())
      );

      if (matchingScreening) {
        setSelectedService(matchingScreening.id);
        return;
      }

      // Then check in service types
      const matchingService = serviceTypes.find((service) =>
        service.name.toLowerCase().includes(screeningParam.toLowerCase())
      );
      if (matchingService) {
        setSelectedService(matchingService.id);
      }
    }
  }, [screeningParam, myScreenings]);

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

    // Check if it's a custom service
    if (showCustomService) return doctors;

    // Check if it's from my screenings
    const screeningService = myScreenings.find((s) => s.id === selectedService);
    if (screeningService) {
      // Filter based on screening name
      if (screeningService.name.includes('Breast Cancer')) {
        return doctors.filter(
          (d) =>
            d.specialization === 'Oncology' ||
            d.specialization === 'Gynecology' ||
            d.specialization === 'Family Medicine'
        );
      }
      if (screeningService.name.includes('Cervical Cancer')) {
        return doctors.filter(
          (d) => d.specialization === 'Gynecology' || d.specialization === 'Family Medicine'
        );
      }
      if (screeningService.name.includes('Cholesterol')) {
        return doctors.filter(
          (d) => d.specialization === 'Internal Medicine' || d.specialization === 'Family Medicine'
        );
      }
      return doctors;
    }

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
    const [displayMonth, setDisplayMonth] = useState<number>(new Date().getMonth());
    const [displayYear, setDisplayYear] = useState<number>(new Date().getFullYear());

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Generate calendar days for displayed month
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => null);
    const calendarDays = [...emptyCells, ...days];

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Navigate to previous month
    const goToPreviousMonth = () => {
      if (displayMonth === 0) {
        setDisplayMonth(11);
        setDisplayYear(displayYear - 1);
      } else {
        setDisplayMonth(displayMonth - 1);
      }
    };

    // Navigate to next month
    const goToNextMonth = () => {
      if (displayMonth === 11) {
        setDisplayMonth(0);
        setDisplayYear(displayYear + 1);
      } else {
        setDisplayMonth(displayMonth + 1);
      }
    };

    // Format month and year for display
    const getFormattedMonthYear = () => {
      return new Date(displayYear, displayMonth, 1).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
    };

    // Check if a given day is in the past
    const isInPast = (day: number) => {
      const dateToCheck = new Date(displayYear, displayMonth, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to beginning of day for comparison
      return dateToCheck < today;
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="Previous month"
          >
            &larr;
          </button>
          <div className="text-md font-medium">{getFormattedMonthYear()}</div>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="Next month"
          >
            &rarr;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-4 text-center mb-2">
          {weekdays.map((day, index) => (
            <div key={index} className="text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="h-10"></div>;

            const dayIsPast = isInPast(day);
            const isToday =
              day === currentDay && displayMonth === currentMonth && displayYear === currentYear;
            const isSelected =
              day === selectedDay && displayMonth === displayMonth && displayYear === displayYear;
            const isAvailable = isPastAppointment || !dayIsPast;

            return (
              <button
                key={i}
                onClick={() => isAvailable && setSelectedDay(day)}
                disabled={!isAvailable && !isPastAppointment}
                className={`h-10 w-full flex items-center justify-center rounded-md text-sm font-medium transition-colors
                  ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : isToday
                        ? 'bg-blue-100 text-blue-800'
                        : isAvailable
                          ? dayIsPast
                            ? 'bg-white border border-orange-200 text-orange-700 hover:bg-orange-50'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          : 'text-gray-300 bg-gray-50 cursor-not-allowed'
                  }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPastAppointment}
              onChange={() => {
                setIsPastAppointment(!isPastAppointment);
                // Reset completed status when toggling past appointment mode
                if (!isPastAppointment) {
                  setIsCompleted(false);
                  setAppointmentResult('');
                }
              }}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">I want to record a past appointment</span>
          </label>
          {isPastAppointment && (
            <p className="mt-1 text-xs text-orange-600">
              Select a past date to record a previous appointment in your health records
            </p>
          )}
        </div>
      </div>
    );
  };

  const TimeSelector = () => {
    // Create times from 5:00 AM to 12:00 AM (midnight)
    const generateTimeSlots = () => {
      const slots = [];
      for (let hour = 5; hour <= 23; hour++) {
        const hourFormatted = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        slots.push(`${hourFormatted}:00 ${period}`);
        slots.push(`${hourFormatted}:30 ${period}`);
      }
      // Add 12:00 AM (midnight)
      slots.push('12:00 AM');
      return slots;
    };

    const timeSlots = generateTimeSlots();
    const [selectedTime, setSelectedTime] = useState<string>('10:30 AM');

    return (
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-[280px] overflow-y-auto p-1">
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
    if (!selectedService && !showCustomService) return '';

    const actionVerb = isPastAppointment ? 'Recording' : 'Scheduling';

    if (showCustomService) {
      return `${actionVerb} for ${customService}`;
    }

    // Check if it's from my screenings
    const screeningService = myScreenings.find((s) => s.id === selectedService);
    if (screeningService) {
      return `${actionVerb} ${screeningService.name} as recommended for ${userAge}-year-old ${userGender}.`;
    }

    const service = serviceTypes.find((s) => s.id === selectedService);
    if (!service) return '';

    return `${actionVerb} ${service.name} as recommended for ${userAge}-year-old ${userGender}.`;
  };

  // Determine if a service is age-appropriate
  const isServiceAgeAppropriate = (service: ServiceType) => {
    if (!service.relevantForAge) return true;
    const [minAge, maxAge] = service.relevantForAge;
    return userAge >= minAge && userAge <= maxAge;
  };

  // Check if form can proceed to confirm
  const canProceedToConfirm = () => {
    // Must have either selected a service or entered a custom service
    const hasService =
      selectedService !== null || (showCustomService && customService.trim() !== '');

    // Must have either selected a doctor or entered a custom doctor
    const hasDoctor =
      selectedDoctor !== null || (showCustomDoctor && customDoctor.name.trim() !== '');

    return hasService && hasDoctor;
  };

  // Get the selected service name
  const getSelectedServiceName = () => {
    if (showCustomService) {
      return customService;
    }

    if (selectedService) {
      // Check if it's from my screenings
      const screeningService = myScreenings.find((s) => s.id === selectedService);
      if (screeningService) {
        return screeningService.name;
      }

      // Check if it's from service types
      const service = serviceTypes.find((s) => s.id === selectedService);
      if (service) {
        return service.name;
      }
    }

    return 'Unknown Service';
  };

  // Get the selected doctor name
  const getSelectedDoctorName = () => {
    if (showCustomDoctor) {
      return `${customDoctor.name} (${customDoctor.specialization})`;
    }

    if (selectedDoctor) {
      const doctor = doctors.find((d) => d.id === selectedDoctor);
      if (doctor) {
        return `${doctor.name} (${doctor.specialization})`;
      }
    }

    return 'Unknown Provider';
  };

  // Generate calendar links
  const getCalendarLinks = () => {
    const now = new Date();
    // Set appointment time to 1 week from now by default, or use the past date for recorded appointments
    const appointmentDate = isPastAppointment
      ? new Date() // For past appointments, we'll use today's date as we don't have the actual date field extracted
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const appointmentEndDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000); // +1 hour

    const serviceName = getSelectedServiceName();
    const doctorName = getSelectedDoctorName();

    // Use different title format for past appointments
    const appointmentTitle = isPastAppointment
      ? `Recorded: ${serviceName} with ${doctorName}`
      : `${serviceName} with ${doctorName}`;

    // Include different details for past appointments
    const appointmentDetails =
      isPastAppointment && isCompleted
        ? `${notes || getDefaultNotes()}\n\nResults: ${appointmentResult || 'No results recorded'}`
        : notes || getDefaultNotes();

    // Format dates for calendar links
    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const formatDateForOutlook = (date: Date) => {
      return date
        .toISOString()
        .slice(0, 19)
        .replace(/-|:|\.\d\d\d/g, '');
    };

    // Google Calendar link
    const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(appointmentTitle)}&details=${encodeURIComponent(appointmentDetails)}&dates=${formatDateForGoogle(appointmentDate)}/${formatDateForGoogle(appointmentEndDate)}`;

    // Outlook Web link
    const outlookWebLink = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(appointmentTitle)}&body=${encodeURIComponent(appointmentDetails)}&startdt=${appointmentDate.toISOString()}&enddt=${appointmentEndDate.toISOString()}`;

    // Apple Calendar link (iCal format)
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatDateForOutlook(appointmentDate)}Z`,
      `DTEND:${formatDateForOutlook(appointmentEndDate)}Z`,
      `SUMMARY:${appointmentTitle}`,
      `DESCRIPTION:${appointmentDetails}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const icsBlob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const icsUrl = URL.createObjectURL(icsBlob);

    return {
      google: googleCalendarLink,
      outlook: outlookWebLink,
      ics: icsUrl,
    };
  };

  // Handler for custom service toggling
  const handleCustomServiceToggle = () => {
    if (showCustomService) {
      setShowCustomService(false);
      setCustomService('');
    } else {
      setShowCustomService(true);
      setSelectedService(null);
    }
  };

  // Handler for custom doctor toggling
  const handleCustomDoctorToggle = () => {
    if (showCustomDoctor) {
      setShowCustomDoctor(false);
      setCustomDoctor({ name: '', specialization: '' });
    } else {
      setShowCustomDoctor(true);
      setSelectedDoctor(null);
    }
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
              <h1 className="text-2xl font-bold">
                {isPastAppointment ? 'Record Past Appointment' : 'Book New Appointment'}
              </h1>
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
                <div
                  className={`flex items-center justify-center w-8 h-8 ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'} rounded-full`}
                >
                  {currentStep > 1 ? '✓' : '1'}
                </div>
                <div
                  className={`ml-2 font-medium ${currentStep === 1 ? 'text-blue-600' : 'text-green-500'}`}
                >
                  Service
                </div>
              </div>
              <div className="flex-1 h-1 mx-4 bg-gray-200">
                <div
                  className={`h-1 ${currentStep > 1 ? 'bg-green-500' : 'bg-blue-200'} ${currentStep === 1 ? 'w-0' : 'w-full'}`}
                ></div>
              </div>
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 ${currentStep === 2 ? 'bg-blue-600 text-white' : currentStep < 2 ? 'bg-gray-200 text-gray-700' : 'bg-green-500 text-white'} rounded-full`}
                >
                  {currentStep > 2 ? '✓' : '2'}
                </div>
                <div
                  className={`ml-2 font-medium ${currentStep === 2 ? 'text-blue-600' : currentStep < 2 ? 'text-gray-500' : 'text-green-500'}`}
                >
                  Date & Time
                </div>
              </div>
              <div className="flex-1 h-1 mx-4 bg-gray-200">
                <div
                  className={`h-1 ${currentStep > 2 ? 'bg-green-500' : 'bg-blue-200'} ${currentStep < 2 ? 'w-0' : currentStep === 2 ? 'w-1/2' : 'w-full'}`}
                ></div>
              </div>
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 ${currentStep === 3 ? 'bg-blue-600 text-white' : currentStep < 3 ? 'bg-gray-200 text-gray-700' : 'bg-green-500 text-white'} rounded-full`}
                >
                  {currentStep > 3 ? '✓' : '3'}
                </div>
                <div
                  className={`ml-2 font-medium ${currentStep === 3 ? 'text-blue-600' : currentStep < 3 ? 'text-gray-500' : 'text-green-500'}`}
                >
                  Confirm
                </div>
              </div>
            </div>
          </div>

          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Select Service Type */}
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-600" /> Select Service Type
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (Based on recommendations for a {userAge}-year-old {userGender})
                  </span>
                </h2>

                {/* My Selected Screenings */}
                {myScreenings.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">
                      My Selected Screenings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myScreenings.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => {
                            setSelectedService(service.id);
                            setShowCustomService(false);
                          }}
                          className={`border rounded-lg p-4 cursor-pointer
                            ${
                              selectedService === service.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                            }`}
                        >
                          <h3 className="font-medium text-gray-800">{service.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Service Types */}
                <h3 className="text-lg font-medium text-gray-800 mb-3">Other Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceTypes.map((service) => {
                    const isRelevant = isServiceAgeAppropriate(service);
                    const isSelected = selectedService === service.id;

                    return (
                      <div
                        key={service.id}
                        onClick={() => {
                          if (isRelevant) {
                            setSelectedService(service.id);
                            setShowCustomService(false);
                          }
                        }}
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
                          {!isRelevant && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              Not in guideline range at age {userAge}, add personalized guideline to
                              schedule.
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Custom Service Option */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer
                      ${
                        showCustomService
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                      }`}
                    onClick={handleCustomServiceToggle}
                  >
                    <div className="flex items-center">
                      <FaPlus className="text-blue-600 mr-2" />
                      <h3 className="font-medium text-gray-800">Other Appointment Type</h3>
                    </div>
                    {!showCustomService && (
                      <p className="text-sm text-gray-500 mt-1">
                        Schedule a different type of appointment not listed above
                      </p>
                    )}

                    {showCustomService && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Appointment Type
                        </label>
                        <input
                          type="text"
                          value={customService}
                          onChange={(e) => setCustomService(e.target.value)}
                          placeholder="Enter appointment type"
                          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
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
                      onClick={() => {
                        setSelectedDoctor(doctor.id);
                        setShowCustomDoctor(false);
                      }}
                      className={`border rounded-lg p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-200 ${
                        selectedDoctor === doctor.id && !showCustomDoctor
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={doctor.image || '/doctor-avatar.png'}
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

                  {/* Add Custom Provider Option */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer
                      ${
                        showCustomDoctor
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                      }`}
                    onClick={handleCustomDoctorToggle}
                  >
                    <div className="flex items-center">
                      <FaPlus className="text-blue-600 mr-2" />
                      <h3 className="font-medium text-gray-800">Other Provider</h3>
                    </div>
                    {!showCustomDoctor && (
                      <p className="text-sm text-gray-500 mt-1">Add a provider not listed above</p>
                    )}

                    {showCustomDoctor && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Provider Name
                          </label>
                          <input
                            type="text"
                            value={customDoctor.name}
                            onChange={(e) =>
                              setCustomDoctor({ ...customDoctor, name: e.target.value })
                            }
                            placeholder="Dr. John Smith"
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Specialization
                          </label>
                          <input
                            type="text"
                            value={customDoctor.specialization}
                            onChange={(e) =>
                              setCustomDoctor({ ...customDoctor, specialization: e.target.value })
                            }
                            placeholder="Cardiology"
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
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
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={!canProceedToConfirm()}
                  onClick={() => setCurrentStep(2)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Visit
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Please provide any additional information that might be relevant for your appointment..."
                      defaultValue={getDefaultNotes()}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>

                  {isPastAppointment && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-md font-medium text-gray-800 mb-3">
                        Past Appointment Details
                      </h3>

                      <div className="mb-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => setIsCompleted(!isCompleted)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Appointment was completed
                          </span>
                        </label>
                      </div>

                      {isCompleted && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Appointment Results/Notes
                          </label>
                          <textarea
                            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Enter any results or notes from the completed appointment..."
                            value={appointmentResult}
                            onChange={(e) => setAppointmentResult(e.target.value)}
                          ></textarea>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="bg-gray-50 p-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Back
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => setCurrentStep(3)}
                >
                  {isPastAppointment ? 'Record Appointment' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Confirmation Page */}
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Appointment Confirmation
                </h2>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full text-blue-600 mb-3">
                      <FaCalendarAlt className="text-xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {isPastAppointment
                        ? 'Your appointment has been recorded'
                        : 'Your appointment has been recorded'}
                    </h3>
                  </div>

                  <div className="bg-white rounded-md p-4 shadow-sm">
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Service</p>
                      <p className="font-medium text-gray-800">{getSelectedServiceName()}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Provider</p>
                      <p className="font-medium text-gray-800">{getSelectedDoctorName()}</p>
                    </div>

                    {notes && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                        <p className="text-gray-800">{notes}</p>
                      </div>
                    )}

                    {isPastAppointment && isCompleted && appointmentResult && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Results</p>
                        <p className="text-gray-800">{appointmentResult}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Add to Calendar</h3>
                  <p className="text-gray-600 mb-4">
                    {isPastAppointment
                      ? 'Add this recorded appointment to your calendar for your records'
                      : 'Add this appointment to your calendar'}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={getCalendarLinks().google}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <img
                        src="https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_10_2x.png"
                        alt="Google Calendar"
                        className="w-5 h-5 mr-2"
                      />
                      Google Calendar
                    </a>

                    <a
                      href={getCalendarLinks().outlook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <IoLogoMicrosoft className="w-5 h-5 mr-2" />
                      Outlook
                    </a>

                    <a
                      href={getCalendarLinks().ics}
                      download="appointment.ics"
                      className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 19H5V8H19V19ZM16 1V3H8V1H6V3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3H18V1H16ZM17 12H12V17H17V12Z"
                          fill="currentColor"
                        />
                      </svg>
                      Apple Calendar
                    </a>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="bg-gray-50 p-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Back
                </button>
                <button
                  onClick={() => (window.location.href = '/appointments')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isPastAppointment ? 'Save Record' : 'Complete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NewAppointmentPageWrapper;

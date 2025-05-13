'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaPhone,
  FaPlus,
  FaRegClock,
  FaRegComment,
  FaSearch,
  FaUserMd,
} from 'react-icons/fa';
import { IoLogoMicrosoft } from 'react-icons/io5';

import ScreeningsServicesList from '@/app/components/ScreeningsServicesList';
import { ScreeningRecommendation } from '@/app/components/types';
import { useGuidelines } from '@/app/hooks/useGuidelines';
import { createAppointment } from '@/lib/appointmentService';
import { fetchProviders } from '@/lib/providerService';
import GuidelineService from '@/lib/services/guidelineService';
import { UserProfile } from '@/lib/types';

import { BookProviderModal } from '../../components/BookProviderModal';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  image?: string;
  clinic?: string;
  phone?: string;
  location?: string;
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

  // New state variables for provider search and modal
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<Doctor | null>(null);
  const [showProviderModal, setShowProviderModal] = useState<boolean>(false);

  // State for search filters
  const [searchFilter, setSearchFilter] = useState<'all' | 'providers' | 'screenings'>('all');

  // State variables
  const [step, setStep] = useState<'service' | 'provider' | 'datetime' | 'notes' | 'confirm'>(
    'service'
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showCustomServiceInput, setShowCustomServiceInput] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // State for other services from guidelines
  const [otherServices, setOtherServices] = useState<ServiceType[]>([]);

  // State for doctors
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState<boolean>(true);

  // Load user profile and providers
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const profileData = await GuidelineService.getUserProfile();
        if (profileData) {
          setUser(profileData);
        }

        // Fetch providers from API
        const providers = await fetchProviders();

        // Map API providers to Doctor interface format
        const mappedDoctors = providers.map((provider) => ({
          id: provider.id,
          name: provider.name,
          specialization: provider.specialty,
          clinic: provider.clinic,
          phone: provider.phone,
          location: provider.address,
          image: provider.profileImage,
        }));

        setDoctors(mappedDoctors);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoadingProviders(false);
      }
    };

    fetchData();
  }, []);

  // Use the custom hook to manage guidelines and related logic
  const { guidelines, screenings, isLoading: isGuidelinesLoading } = useGuidelines(user);

  // Set myScreenings from the userScreenings (from hook) and other services from guidelines
  useEffect(() => {
    if (screenings.length > 0) {
      // Convert screenings to ServiceType format for display
      const myScreeningServices = screenings.map((screening: ScreeningRecommendation) => ({
        id: screening.id,
        name: screening.name,
        description: screening.description,
        duration: '30 minutes', // Default duration
        relevantForAge:
          screening.ageRange && screening.ageRange.length > 0
            ? ([screening.ageRange[0].min, screening.ageRange[0].max || 120] as [number, number])
            : undefined,
      }));

      // Convert non-selected guidelines to other services
      if (guidelines.length > 0) {
        const guidelineServices = guidelines
          .filter((guideline) => !screenings.some((screening) => screening.id === guideline.id))
          .map((guideline) => ({
            id: guideline.id,
            name: guideline.name,
            description: guideline.description,
            duration: '30 minutes', // Default duration
            relevantForAge:
              guideline.ageRanges && guideline.ageRanges.length > 0
                ? ([guideline.ageRanges[0].min, guideline.ageRanges[0].max || 120] as [
                    number,
                    number,
                  ])
                : undefined,
          }));

        setOtherServices(guidelineServices);
      }
    }
  }, [screenings, guidelines]);

  // Define user age for relevance filtering
  const userAge = user?.age || 35;
  const userGender = user?.gender || 'female';

  // Find service matching screening parameter
  useEffect(() => {
    if (screeningParam && screenings.length > 0) {
      // First check in user screenings
      const matchingScreening = screenings.find((screening) =>
        screening.name.toLowerCase().includes(screeningParam.toLowerCase())
      );

      if (matchingScreening) {
        setSelectedService(matchingScreening.id);
        return;
      }

      // Then check in other services
      const matchingOtherService = otherServices.find((service) =>
        service.name.toLowerCase().includes(screeningParam.toLowerCase())
      );
      if (matchingOtherService) {
        setSelectedService(matchingOtherService.id);
      }
    }
  }, [screeningParam, screenings, otherServices]);

  // Transform a ServiceType to a ScreeningRecommendation format for UI components
  const transformToScreeningRecommendation = (service: ServiceType): ScreeningRecommendation => {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      frequency: 'As needed',
      status: 'due',
      ageRange: service.relevantForAge
        ? [
            {
              min: service.relevantForAge[0],
              max: service.relevantForAge[1],
              label: `${service.relevantForAge[0]}-${service.relevantForAge[1]} years`,
            },
          ]
        : [],
      ageRangeDetails: service.relevantForAge
        ? [
            {
              min: service.relevantForAge[0],
              max: service.relevantForAge[1],
              label: `${service.relevantForAge[0]}-${service.relevantForAge[1]} years`,
            },
          ]
        : [],
      dueDate: new Date().toISOString(),
    };
  };

  // Get relevant doctors based on selected service - now returning all doctors without filtering
  const getRelevantDoctors = () => {
    // Return all doctors without filtering by service
    return doctors;
  };

  const relevantDoctors = getRelevantDoctors();

  // Helper function for date management
  const DateSelector = () => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();

    // Go to previous month
    const goToPreviousMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    // Go to next month
    const goToNextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    // Format month and year
    const getFormattedMonthYear = () => {
      return currentMonth.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
    };

    // Check if a day is in the past
    const isInPast = (day: number) => {
      const today = new Date();
      const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      return checkDate < new Date(today.setHours(0, 0, 0, 0));
    };

    // Create day elements for calendar
    const dayElements = [];
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayElements.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear();

      const isPast = isInPast(day);

      dayElements.push(
        <div
          key={`day-${day}`}
          className={`h-10 flex items-center justify-center cursor-pointer rounded-full
            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50'}
            ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
          `}
          onClick={() => {
            if (!isPast) {
              setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
            }
          }}
        >
          {day}
        </div>
      );
    }

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={goToPreviousMonth} className="p-2 text-gray-600 hover:text-gray-900">
            &lt; Prev
          </button>
          <h3 className="text-lg font-medium">{getFormattedMonthYear()}</h3>
          <button onClick={goToNextMonth} className="p-2 text-gray-600 hover:text-gray-900">
            Next &gt;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-1">{dayElements}</div>
      </div>
    );
  };

  // Component for time selection
  const TimeSelector = () => {
    // Generate time slots from 8 AM to 5 PM
    const generateTimeSlots = () => {
      const slots = [];
      const startHour = 8; // 8 AM
      const endHour = 17; // 5 PM

      for (let hour = startHour; hour <= endHour; hour++) {
        const hourFormatted = hour > 12 ? hour - 12 : hour;
        const amPm = hour >= 12 ? 'PM' : 'AM';

        // Add :00 slot
        slots.push(`${hourFormatted}:00 ${amPm}`);

        // Add :30 slot except for the last hour
        if (hour < endHour) {
          slots.push(`${hourFormatted}:30 ${amPm}`);
        }
      }

      return slots;
    };

    const timeSlots = generateTimeSlots();

    return (
      <div className="mt-4 grid grid-cols-3 gap-2">
        {timeSlots.map((time) => (
          <div
            key={time}
            className={`p-2 border rounded-md text-center cursor-pointer
              ${selectedTime === time ? 'bg-blue-500 text-white' : 'hover:bg-blue-50'}
            `}
            onClick={() => setSelectedTime(time)}
          >
            {time}
          </div>
        ))}
      </div>
    );
  };

  // Get default notes based on the selected service
  const getDefaultNotes = () => {
    if (!selectedService) return '';

    // Find the matching service
    const selectedScreening = screenings.find((s) => s.id === selectedService);
    const selectedOtherService = otherServices.find((s) => s.id === selectedService);

    const service = selectedScreening || selectedOtherService;

    if (!service) return '';

    if (showCustomService) {
      return `Appointment for: ${customService}`;
    }

    return `Appointment for: ${service.name}`;
  };

  // Check if a service is age appropriate
  const isServiceAgeAppropriate = (service: ServiceType) => {
    if (!service.relevantForAge) return true;

    const [minAge, maxAge] = service.relevantForAge;
    return userAge >= minAge && userAge <= maxAge;
  };

  // Check if we can proceed to confirm
  const canProceedToConfirm = () => {
    // Need service, provider, date and time
    if (showCustomService) {
      return (
        customService.trim() !== '' &&
        (selectedDoctor || (showCustomDoctor && customDoctor.name.trim() !== '')) &&
        selectedDate &&
        selectedTime
      );
    }

    return (
      selectedService &&
      (selectedDoctor || (showCustomDoctor && customDoctor.name.trim() !== '')) &&
      selectedDate &&
      selectedTime
    );
  };

  // Get the name of the selected service
  const getSelectedServiceName = () => {
    if (showCustomService) {
      return customService;
    }

    if (!selectedService) return 'No service selected';

    // Check in screenings
    const selectedScreening = screenings.find((s) => s.id === selectedService);
    if (selectedScreening) {
      return selectedScreening.name;
    }

    // Check in other services
    const selectedOtherService = otherServices.find((s) => s.id === selectedService);
    if (selectedOtherService) {
      return selectedOtherService.name;
    }

    return 'Unknown service';
  };

  // Get the name of the selected doctor
  const getSelectedDoctorName = () => {
    if (showCustomDoctor) {
      return customDoctor.name;
    }

    if (!selectedDoctor) return 'No provider selected';

    const doctor = doctors.find((d) => d.id === selectedDoctor);
    return doctor ? doctor.name : 'Unknown provider';
  };

  // Generate calendar links
  const getCalendarLinks = () => {
    if (!selectedDate || !selectedTime) return { google: '#', outlook: '#' };

    const serviceName = getSelectedServiceName();
    const doctorName = getSelectedDoctorName();

    // Parse time
    const [time, amPm] = selectedTime.split(' ');
    const [hour, minute] = time.split(':');
    let hourNum = parseInt(hour);

    // Convert to 24hr format
    if (amPm === 'PM' && hourNum < 12) {
      hourNum += 12;
    } else if (amPm === 'AM' && hourNum === 12) {
      hourNum = 0;
    }

    // Create date objects for start and end (1 hour later)
    const startDate = new Date(selectedDate);
    startDate.setHours(hourNum, parseInt(minute), 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    // Format dates for Google Calendar
    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    // Format dates for Outlook
    const formatDateForOutlook = (date: Date) => {
      return date.toISOString();
    };

    const googleLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${serviceName} Appointment`)}&details=${encodeURIComponent(`Appointment with ${doctorName}`)}&dates=${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`;

    const outlookLink = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(`${serviceName} Appointment`)}&body=${encodeURIComponent(`Appointment with ${doctorName}`)}&startdt=${formatDateForOutlook(startDate)}&enddt=${formatDateForOutlook(endDate)}`;

    return {
      google: googleLink,
      outlook: outlookLink,
    };
  };

  // Toggle custom service input
  const handleCustomServiceToggle = () => {
    setShowCustomService((prev) => !prev);
    if (!showCustomService) {
      setSelectedService(null);
    } else {
      setCustomService('');
    }
  };

  // Toggle custom doctor input
  const handleCustomDoctorToggle = () => {
    setShowCustomDoctor((prev) => !prev);
    if (!showCustomDoctor) {
      setSelectedDoctor(null);
    } else {
      setCustomDoctor({ name: '', specialization: '' });
    }
  };

  // Open provider modal
  const openProviderModal = (doctor: Doctor) => {
    setSelectedProvider(doctor);
    setShowProviderModal(true);
  };

  // Close provider modal
  const closeProviderModal = () => {
    setShowProviderModal(false);
    setSelectedProvider(null);
  };

  // Record appointment
  const recordAppointment = async () => {
    try {
      // Format appointment data
      const appointmentTime = selectedTime ? selectedTime.split(' ')[0] : '';
      const [hours, minutes] = appointmentTime.split(':');
      const appointmentDate = new Date(selectedDate!);

      // Set time if available
      if (hours && minutes) {
        // Parse time (convert from 12hr to 24hr if needed)
        const isPM = selectedTime?.includes('PM') && hours !== '12';
        const isAM = selectedTime?.includes('AM') && hours === '12';
        const hour = isPM ? parseInt(hours) + 12 : isAM ? 0 : parseInt(hours);
        appointmentDate.setHours(hour, parseInt(minutes), 0, 0);
      }

      // Get provider details
      const provider = selectedDoctor ? doctors.find((doc) => doc.id === selectedDoctor) : null;

      // Check if the selected service is a screening from user's screenings list
      const isScreening =
        !showCustomService &&
        selectedService &&
        screenings.some((screening) => screening.id === selectedService);

      // Create appointment data
      const appointmentData = {
        title: showCustomService ? customService : getSelectedServiceName(),
        type: 'Consultation' as const, // Default to consultation, can be inferred from service if needed
        provider: showCustomDoctor ? customDoctor.name : getSelectedDoctorName(),
        providerId: selectedDoctor || undefined,
        location: provider?.location || 'Not specified',
        date: appointmentDate,
        notes: notes,
        completed: isPastAppointment && isCompleted,
        // Include screeningId if the service is a screening
        screeningId: isScreening ? selectedService : undefined,
        result:
          isPastAppointment && isCompleted && appointmentResult
            ? {
                status: appointmentResult,
                notes: notes || 'No result notes provided',
                date: appointmentDate.toISOString().split('T')[0],
              }
            : undefined,
      };

      // Save to API
      await createAppointment(appointmentData);
      console.log('Appointment recorded successfully');

      // If this was a completed appointment for a screening, also update the screening's last_completed_date
      if (isPastAppointment && isCompleted && isScreening && selectedService) {
        try {
          // Update the screening's completion date using the new method
          await GuidelineService.updateScreeningCompletionDate(
            selectedService,
            appointmentDate.toISOString(),
            user?.id
          );
          console.log('Screening completion date updated successfully');
        } catch (error) {
          console.error('Error updating screening completion date:', error);
          // Continue anyway since the appointment was created
        }
      }

      // Redirect to appointments page
      window.location.href = '/appointments';
    } catch (error) {
      console.error('Error recording appointment:', error);
      alert('Failed to record appointment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">Schedule an Appointment</h1>
          </div>

          {/* Step indicators - updated for mobile responsiveness */}
          <div className="flex border-b border-gray-200">
            <div
              className={`flex-1 text-center py-3 ${
                step === 'service' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : ''
              }`}
            >
              <span className="hidden sm:inline">1. Select Service</span>
              <span className="sm:hidden flex justify-center items-center">
                <FaPlus className="mr-1" size={14} /> 1
              </span>
            </div>
            <div
              className={`flex-1 text-center py-3 ${
                step === 'provider' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : ''
              }`}
            >
              <span className="hidden sm:inline">2. Select Provider</span>
              <span className="sm:hidden flex justify-center items-center">
                <FaUserMd className="mr-1" size={14} /> 2
              </span>
            </div>
            <div
              className={`flex-1 text-center py-3 ${
                step === 'datetime' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : ''
              }`}
            >
              <span className="hidden sm:inline">3. Date & Time</span>
              <span className="sm:hidden flex justify-center items-center">
                <FaCalendarAlt className="mr-1" size={14} /> 3
              </span>
            </div>
            <div
              className={`flex-1 text-center py-3 ${
                step === 'notes' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : ''
              }`}
            >
              <span className="hidden sm:inline">4. Notes</span>
              <span className="sm:hidden flex justify-center items-center">
                <FaRegComment className="mr-1" size={14} /> 4
              </span>
            </div>
            <div
              className={`flex-1 text-center py-3 ${
                step === 'confirm' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : ''
              }`}
            >
              <span className="hidden sm:inline">5. Confirm</span>
              <span className="sm:hidden flex justify-center items-center">
                <FaRegClock className="mr-1" size={14} /> 5
              </span>
            </div>
          </div>

          {/* Step content */}
          <div className="p-6">
            {/* Step 1: Select Service */}
            {step === 'service' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select a Service</h2>

                {/* Search input */}
                <div className="mb-6 relative">
                  <input
                    type="text"
                    placeholder="Search for a service..."
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                </div>

                {/* Past appointment toggle */}
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id="past-appointment"
                    checked={isPastAppointment}
                    onChange={() => setIsPastAppointment(!isPastAppointment)}
                    className="mr-2"
                  />
                  <label htmlFor="past-appointment">
                    This is a past appointment I want to record
                  </label>
                </div>

                {/* My Selected Screenings */}
                {screenings.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">
                      My Selected Screenings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {screenings
                        .filter(
                          (screening) =>
                            searchTerm === '' ||
                            screening.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            screening.description.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((screening) => {
                          // Convert to ServiceType format for display
                          const service = {
                            id: screening.id,
                            name: screening.name,
                            description: screening.description,
                          };

                          return (
                            <div
                              key={screening.id}
                              onClick={() => {
                                setSelectedService(screening.id);
                                setShowCustomService(false);
                              }}
                              className={`border rounded-lg p-4 cursor-pointer
                                ${
                                  selectedService === screening.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                                }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-gray-800">{screening.name}</h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {screening.description}
                                  </p>
                                </div>
                                <div className="ml-2">
                                  {screening.status === 'completed' ? (
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                      Completed
                                    </span>
                                  ) : screening.status === 'due' ? (
                                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                      Due
                                    </span>
                                  ) : (
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                      Recommended
                                    </span>
                                  )}
                                </div>
                              </div>
                              {screening.status === 'completed' && (
                                <p className="text-xs text-green-600 mt-2">
                                  Last completed:{' '}
                                  {screening.dueDate
                                    ? new Date(screening.dueDate).toLocaleDateString()
                                    : 'N/A'}
                                </p>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Other Services from Guidelines */}
                {otherServices.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Other Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {otherServices
                        .filter(
                          (service) =>
                            isServiceAgeAppropriate(service) &&
                            (searchTerm === '' ||
                              service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              service.description.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        .map((service) => (
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
                            {service.relevantForAge && (
                              <p className="text-xs text-blue-600 mt-1">
                                Recommended for ages {service.relevantForAge[0]}-
                                {service.relevantForAge[1]}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Custom Service Option */}
                <div className="mt-6 border rounded-lg p-4 hover:bg-blue-50 hover:border-blue-200 cursor-pointer">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="custom-service"
                      checked={showCustomService}
                      onChange={handleCustomServiceToggle}
                      className="mr-3"
                    />
                    <label
                      htmlFor="custom-service"
                      className="text-lg font-medium text-gray-800 cursor-pointer"
                    >
                      Schedule a different appointment
                    </label>
                  </div>

                  <p className="text-sm text-gray-500 mb-3 ml-6">
                    Enter a custom service not listed above, such as dental checkup, eye exam,
                    mental health session, etc.
                  </p>

                  {showCustomService && (
                    <div className="mt-3 ml-6">
                      <input
                        type="text"
                        placeholder="Enter service name..."
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        value={customService}
                        onChange={(e) => setCustomService(e.target.value)}
                      />
                      {customService.trim() === '' && (
                        <p className="text-sm text-blue-600 mt-1">
                          Please enter a name for your appointment
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation buttons */}
                <div className="mt-8 flex justify-end">
                  <button
                    className={`px-6 py-2 rounded-md font-medium ${
                      selectedService || (showCustomService && customService.trim() !== '')
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={
                      !selectedService && !(showCustomService && customService.trim() !== '')
                    }
                    onClick={() => setStep('provider')}
                  >
                    Next: Select Provider
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Select Provider */}
            {step === 'provider' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select a Provider</h2>

                {/* Service selected info */}
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
                    <span className="font-medium">Selected Service:</span>{' '}
                    {getSelectedServiceName()}
                  </p>
                </div>

                {/* Provider search */}
                <div className="mb-6 relative">
                  <input
                    type="text"
                    placeholder="Search for a provider by name or specialty..."
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                </div>

                {/* Providers list */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Providers</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Select a provider and use their contact information to schedule your appointment
                    directly. This app will help you record and track your appointments.
                  </p>
                  {isLoadingProviders ? (
                    <div className="text-center py-4">Loading providers...</div>
                  ) : doctors.length > 0 ? (
                    <div className="space-y-3">
                      {doctors
                        .filter(
                          (doctor) =>
                            searchTerm === '' ||
                            doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doctor.specialization
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (doctor.clinic &&
                              doctor.clinic.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        .map((doctor) => (
                          <div
                            key={doctor.id}
                            className={`border p-4 rounded-lg cursor-pointer hover:bg-blue-50 ${
                              selectedDoctor === doctor.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200'
                            }`}
                            onClick={() => setSelectedDoctor(doctor.id)}
                          >
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{doctor.name}</h4>
                                <p className="text-gray-600 text-sm">{doctor.specialization}</p>
                                {doctor.clinic && (
                                  <p className="text-gray-500 text-xs mt-1">{doctor.clinic}</p>
                                )}
                                {doctor.phone && (
                                  <p className="text-blue-600 text-sm mt-1 flex items-center">
                                    <FaPhone className="mr-1" size={12} /> {doctor.phone}
                                  </p>
                                )}
                              </div>
                              <button
                                className="text-blue-600 hover:text-blue-800 text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openProviderModal(doctor);
                                }}
                              >
                                Contact Info
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-gray-200 rounded-lg text-center">
                      <p className="text-gray-500">No providers found.</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Try using a custom provider instead.
                      </p>
                    </div>
                  )}
                </div>

                {/* Custom Provider Option */}
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="custom-provider"
                      checked={showCustomDoctor}
                      onChange={handleCustomDoctorToggle}
                      className="mr-2"
                    />
                    <label htmlFor="custom-provider">Enter a custom provider</label>
                  </div>

                  {showCustomDoctor && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Enter provider name..."
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        value={customDoctor.name}
                        onChange={(e) => setCustomDoctor({ ...customDoctor, name: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Enter specialization (optional)..."
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        value={customDoctor.specialization}
                        onChange={(e) =>
                          setCustomDoctor({ ...customDoctor, specialization: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Navigation buttons */}
                <div className="mt-8 flex justify-between">
                  <button
                    className="px-6 py-2 rounded-md font-medium border border-gray-300 hover:bg-gray-50"
                    onClick={() => setStep('service')}
                  >
                    Back
                  </button>
                  <button
                    className={`px-6 py-2 rounded-md font-medium ${
                      selectedDoctor || (showCustomDoctor && customDoctor.name.trim() !== '')
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={
                      !selectedDoctor && !(showCustomDoctor && customDoctor.name.trim() !== '')
                    }
                    onClick={() => setStep('datetime')}
                  >
                    Next: Select Date & Time
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Date & Time */}
            {step === 'datetime' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>

                {/* Service and provider info */}
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
                    <span className="font-medium">Selected Service:</span>{' '}
                    {getSelectedServiceName()}
                  </p>
                  <p className="text-blue-800 mt-1">
                    <span className="font-medium">Selected Provider:</span>{' '}
                    {getSelectedDoctorName()}
                  </p>
                </div>

                {/* Past appointment date selector */}
                {isPastAppointment && (
                  <div className="mb-4">
                    <p className="mb-2 font-medium">Select the date of your past appointment:</p>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedDate(new Date(e.target.value));
                        } else {
                          setSelectedDate(null);
                        }
                      }}
                    />
                  </div>
                )}

                {/* Date selector */}
                {!isPastAppointment && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Select a Date</h3>
                    <DateSelector />
                  </div>
                )}

                {/* Time selector */}
                {selectedDate && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Select a Time</h3>
                    <TimeSelector />
                  </div>
                )}

                {/* Completed appointment toggle (only for past appointments) */}
                {isPastAppointment && (
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="completed-appointment"
                        checked={isCompleted}
                        onChange={() => setIsCompleted(!isCompleted)}
                        className="mr-2"
                      />
                      <label htmlFor="completed-appointment">This appointment was completed</label>
                    </div>

                    {isCompleted && (
                      <div className="mt-2">
                        <p className="mb-1 font-medium">Result:</p>
                        <select
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          value={appointmentResult}
                          onChange={(e) => setAppointmentResult(e.target.value)}
                        >
                          <option value="">-- Select result --</option>
                          <option value="clear">Clear / Normal</option>
                          <option value="abnormal">Abnormal</option>
                          <option value="pending">Results Pending</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="mt-8 flex justify-between">
                  <button
                    className="px-6 py-2 rounded-md font-medium border border-gray-300 hover:bg-gray-50"
                    onClick={() => setStep('provider')}
                  >
                    Back
                  </button>
                  <button
                    className={`px-6 py-2 rounded-md font-medium ${
                      selectedDate && selectedTime
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep('notes')}
                  >
                    Next: Add Notes
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Notes */}
            {step === 'notes' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Add Notes (Optional)</h2>

                {/* Service, provider, and date/time info */}
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
                    <span className="font-medium">Selected Service:</span>{' '}
                    {getSelectedServiceName()}
                  </p>
                  <p className="text-blue-800 mt-1">
                    <span className="font-medium">Selected Provider:</span>{' '}
                    {getSelectedDoctorName()}
                  </p>
                  <p className="text-blue-800 mt-1">
                    <span className="font-medium">Date & Time:</span>{' '}
                    {selectedDate?.toLocaleDateString()} at {selectedTime}
                  </p>
                </div>

                {/* Notes textarea */}
                <div className="mb-6">
                  <label htmlFor="notes" className="block mb-2 font-medium">
                    Notes for your appointment:
                  </label>
                  <textarea
                    id="notes"
                    rows={5}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Add any notes or questions for your provider..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>

                {/* Navigation buttons */}
                <div className="mt-8 flex justify-between">
                  <button
                    className="px-6 py-2 rounded-md font-medium border border-gray-300 hover:bg-gray-50"
                    onClick={() => setStep('datetime')}
                  >
                    Back
                  </button>
                  <button
                    className="px-6 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setStep('confirm')}
                  >
                    Next: Confirm Appointment
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Confirm */}
            {step === 'confirm' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Confirm Appointment</h2>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Appointment Summary</h3>

                  <div className="space-y-2">
                    <p>
                      <span className="font-medium text-gray-700">Service:</span>{' '}
                      {getSelectedServiceName()}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Provider:</span>{' '}
                      {getSelectedDoctorName()}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Date:</span>{' '}
                      {selectedDate?.toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Time:</span> {selectedTime}
                    </p>

                    {notes && (
                      <div>
                        <p className="font-medium text-gray-700">Notes:</p>
                        <p className="bg-white p-2 rounded mt-1">{notes}</p>
                      </div>
                    )}

                    {isPastAppointment && isCompleted && (
                      <p>
                        <span className="font-medium text-gray-700">Result:</span>{' '}
                        {appointmentResult === 'clear' && 'Clear / Normal'}
                        {appointmentResult === 'abnormal' && 'Abnormal'}
                        {appointmentResult === 'pending' && 'Results Pending'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Add to calendar links */}
                {!isPastAppointment && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Add to Calendar:</h3>
                    <div className="flex space-x-3">
                      <a
                        href={getCalendarLinks().google}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      >
                        <FaCalendarAlt className="mr-2" /> Google Calendar
                      </a>
                      <a
                        href={getCalendarLinks().outlook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      >
                        <IoLogoMicrosoft className="mr-2" /> Outlook Calendar
                      </a>
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="mt-8 flex justify-between">
                  <button
                    className="px-6 py-2 rounded-md font-medium border border-gray-300 hover:bg-gray-50"
                    onClick={() => setStep('notes')}
                  >
                    Back
                  </button>
                  <button
                    className="px-6 py-2 rounded-md font-medium bg-green-600 text-white hover:bg-green-700"
                    onClick={recordAppointment}
                  >
                    {isPastAppointment ? 'Record Appointment' : 'Confirm Appointment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Provider detail modal */}
      {showProviderModal && selectedProvider && (
        <BookProviderModal
          provider={selectedProvider.name}
          specialty={selectedProvider.specialization}
          clinic={selectedProvider.clinic || ''}
          phone={selectedProvider.phone || ''}
          location={selectedProvider.location || ''}
          onClose={closeProviderModal}
          onRecordAppointment={() => {
            closeProviderModal();
            setSelectedDoctor(selectedProvider.id);
            setStep('datetime');
          }}
        />
      )}
    </div>
  );
};

export default NewAppointmentPageWrapper;

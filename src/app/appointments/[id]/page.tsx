'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaThumbsUp,
  FaTimes,
  FaTrash,
  FaUserMd,
} from 'react-icons/fa';

import AppointmentResult from '@/app/components/AppointmentResult';
import { ScreeningRecommendation } from '@/app/components/types';
import { useGuidelines } from '@/app/hooks/useGuidelines';
import { useUser } from '@/app/hooks/useUser';
import {
  deleteAppointment,
  fetchAppointmentById,
  updateAppointment,
} from '@/lib/appointmentService';
import { Appointment } from '@/lib/types';

// Confirmation Modal Component
const DeleteConfirmationModal: React.FC<{
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}> = ({ onClose, onConfirm, title }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Appointment</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the appointment &quot;{title}&quot;? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Book Provider Modal Component
const BookProviderModal: React.FC<{
  provider: string;
  location: string;
  onClose: () => void;
  onRecordAppointment: () => void;
}> = ({ provider, location, onClose, onRecordAppointment }) => {
  // Mocked phone number - in a real app this would come from the provider data
  const providerPhone = '(555) 123-4567';
  // Mocked additional provider details - in a real app these would come from the provider data
  const clinic = 'Primary Care Associates';
  const address = '123 Medical Plaza, Suite 300, San Francisco, CA 94107';

  // Get specialty based on provider name
  const getSpecialty = (name: string) => {
    if (name === 'Dr. Michael Chen') return 'Internal Medicine, Primary Care Physician';
    if (name.includes('Lisa Johnson')) return 'Dentist, DDS';
    if (name.includes('Sarah Williams')) return 'OB/GYN';
    if (name.includes('Robert Lee')) return 'Dermatology';
    if (name.includes('Emily Watson')) return 'Psychologist, PhD';
    if (name.includes('Alan Park')) return 'Allergist & Immunologist';
    if (name.includes('James Wilson')) return 'Cardiologist';
    if (name.includes('Markus Jonsson')) return 'Physical Therapist, PT';
    if (name.includes('Maria Rodriguez')) return 'Radiologist';
    if (name.includes('John Bo')) return 'Optometrist, OD';
    return 'Specialist';
  };

  const specialty = getSpecialty(provider);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaUserMd className="mr-2 text-blue-600" />
            Provider Details
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-lg text-gray-800 mb-1">{provider}</h4>
          <p className="text-gray-600">{specialty}</p>
          <p className="text-gray-600 mt-2">{clinic}</p>
          <p className="text-gray-600 text-sm">{address}</p>

          <div className="mt-4 mb-2">
            <h4 className="font-semibold text-gray-800 mb-2">Contact Information</h4>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Phone:</span> {providerPhone}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Location:</span> {location}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-md mt-4 border border-blue-100">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Important</h4>
            <p className="text-blue-700 text-sm mb-3">
              Please call the provider&apos;s office before booking to verify availability and
              insurance coverage.
            </p>
            <div className="flex items-center text-blue-700 font-medium">
              <FaPhone className="mr-2" />
              <span>{providerPhone}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onRecordAppointment}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Record Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

// Recommendation Modal Component
const RecommendProviderModal: React.FC<{
  provider: string;
  onClose: () => void;
  onSubmit: (comment: string) => void;
}> = ({ provider, onClose, onSubmit }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(comment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommend {provider}</h3>
        <p className="text-gray-600 mb-4">
          Share your experience with {provider} to help others in your network.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Your experience
            </label>
            <textarea
              id="comment"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What was your experience like with this provider?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={!comment.trim()}
            >
              Share Recommendation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AppointmentDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [recommendationSubmitted, setRecommendationSubmitted] = useState(false);

  const { user } = useUser();
  const { screenings } = useGuidelines(user);

  useEffect(() => {
    const loadAppointment = async () => {
      if (!params.id) {
        setError('No appointment ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchAppointmentById(params.id as string);

        // Convert date string to Date object
        const processedAppointment = {
          ...data,
          date: new Date(data.date),
          detailsPath: `/appointments/${data.id}`,
        };

        setAppointment(processedAppointment);
        setError(null);
      } catch (err) {
        console.error('Failed to load appointment:', err);
        setError(
          'Failed to load appointment details. The appointment may not exist or you may not have permission to view it.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointment();
  }, [params.id]);

  // Find the associated screening if present
  const associatedScreening = appointment?.screeningId
    ? screenings.find((s: ScreeningRecommendation) => s.id === appointment.screeningId)
    : null;

  const handleRecommendSubmit = (comment: string) => {
    // In a real app, this would save the recommendation to a database
    setShowRecommendModal(false);
    setRecommendationSubmitted(true);

    // Show success message briefly
    setTimeout(() => setRecommendationSubmitted(false), 3000);
  };

  const handleRecordAppointment = () => {
    setShowBookModal(false);
    // In a real app, this would navigate to the booking form or next step
    router.push(`/appointments/new?provider=${encodeURIComponent(appointment?.provider || '')}`);
  };

  const handleDeleteAppointment = async () => {
    if (!appointment) return;

    try {
      setIsDeleting(true);
      await deleteAppointment(appointment.id);

      // Close modal and redirect to appointments list
      setShowDeleteModal(false);
      router.push('/appointments');
    } catch (err) {
      console.error('Failed to delete appointment:', err);
      alert('Failed to delete the appointment. Please try again.');
      setIsDeleting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex">
                      <div className="h-4 w-4 bg-gray-200 rounded-full mt-1 mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-center mt-8">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !appointment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Appointment Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "The appointment you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => router.push('/appointments')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <FaArrowLeft className="inline mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Format date
  const formattedDate = appointment.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Format time
  const formattedTime = appointment.date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Get status
  const getStatusInfo = () => {
    if (!appointment.completed) {
      return {
        label: 'Upcoming',
        class: 'bg-blue-100 text-blue-800',
      };
    }

    if (!appointment.result) {
      return {
        label: 'Completed',
        class: 'bg-green-100 text-green-800',
      };
    }

    switch (appointment.result.status) {
      case 'clear':
        return {
          label: 'All Clear',
          class: 'bg-green-100 text-green-800',
        };
      case 'abnormal':
        return {
          label: 'Abnormal Finding',
          class: 'bg-red-100 text-red-800',
        };
      case 'followup':
        return {
          label: 'Follow-Up Needed',
          class: 'bg-blue-100 text-blue-800',
        };
      default:
        return {
          label: 'Completed',
          class: 'bg-green-100 text-green-800',
        };
    }
  };

  const status = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Book Provider Modal */}
      {showBookModal && (
        <BookProviderModal
          provider={appointment.provider}
          location={appointment.location}
          onClose={() => setShowBookModal(false)}
          onRecordAppointment={handleRecordAppointment}
        />
      )}

      {/* Recommendation Modal */}
      {showRecommendModal && (
        <RecommendProviderModal
          provider={appointment.provider}
          onClose={() => setShowRecommendModal(false)}
          onSubmit={handleRecommendSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={appointment.title}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAppointment}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="mb-6">
          <button
            onClick={() => router.push('/appointments')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition"
          >
            <FaArrowLeft className="mr-2" />
            <span>Back to Appointments</span>
          </button>
        </div>

        {/* Success message */}
        {recommendationSubmitted && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6 flex items-center animate-fadeIn">
            <FaThumbsUp className="mr-2" />
            <span>
              Thank you for recommending this provider! Your friends will appreciate your insight.
            </span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{appointment.title}</h1>
              <div className="flex items-center mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.class}`}>
                  {status.label}
                </span>
                <span className="ml-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {appointment.type}
                </span>
              </div>
            </div>

            <div className="flex space-x-2 mt-2 md:mt-0">
              {!appointment.completed && (
                <>
                  <button
                    onClick={() => setShowBookModal(true)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                  >
                    <FaUserMd className="mr-1" />
                    <span>Contact Provider</span>
                  </button>

                  <button
                    onClick={() =>
                      router.push(
                        `/appointments/new?provider=${encodeURIComponent(appointment.provider)}`
                      )
                    }
                    className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition text-sm"
                  >
                    <FaCalendarAlt className="mr-1 text-gray-600" />
                    <span>Reschedule</span>
                  </button>
                </>
              )}

              {/* Delete button */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center px-3 py-2 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition text-sm"
                disabled={isDeleting}
              >
                <FaTrash className="mr-1" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <FaCalendarAlt className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Date</p>
                    <p className="text-gray-600">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaClock className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Time</p>
                    <p className="text-gray-600">{formattedTime}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaUserMd className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Provider</p>
                    <p className="text-gray-600">{appointment.provider}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Location</p>
                    <p className="text-gray-600">{appointment.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>
              {appointment.notes && (
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                  <p className="text-gray-600">{appointment.notes}</p>
                </div>
              )}

              {!appointment.completed && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Preparation</h3>
                  <p className="text-blue-700 text-sm">
                    {appointment.type === 'Examination'
                      ? 'Please arrive 15 minutes before your scheduled appointment. Bring your insurance card and a list of current medications.'
                      : 'Please follow any preparation instructions provided by your healthcare provider.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add screening info section */}
        {!isLoading && !error && appointment && appointment.screeningId && (
          <div className="bg-white rounded-lg shadow-sm mb-4 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              Health Screening Information
            </h2>

            {associatedScreening ? (
              <div>
                <div className="mb-3">
                  <h3 className="font-medium text-gray-800 text-sm">{associatedScreening.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{associatedScreening.description}</p>
                </div>

                <div className="flex items-center">
                  <span
                    className={`text-xs px-2 py-1 rounded-full mr-2 ${
                      associatedScreening.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : associatedScreening.status === 'due'
                          ? 'bg-yellow-100 text-yellow-800'
                          : associatedScreening.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {associatedScreening.status.charAt(0).toUpperCase() +
                      associatedScreening.status.slice(1)}
                  </span>

                  <span className="text-sm text-gray-600">
                    Recommended every {associatedScreening.frequency}
                  </span>
                </div>

                {appointment.completed && (
                  <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-100">
                    <p className="text-green-800 text-sm">
                      This appointment fulfills this health screening recommendation.
                      {associatedScreening.status === 'completed' &&
                        ' Your next screening will be due based on the recommended frequency.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-600 text-sm">
                This appointment is linked to a health screening that may have been removed from
                your recommendations.
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        <AppointmentResult
          appointment={appointment}
          onRecommendProvider={
            appointment.completed ? () => setShowRecommendModal(true) : undefined
          }
        />

        {/* Related Appointments Section */}
        {appointment.completed &&
          appointment.result &&
          appointment.result.status === 'followup' && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Follow-Up Appointments</h2>
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                <p className="text-yellow-800 text-sm mb-3">
                  Based on your results, a follow-up appointment is recommended. Would you like to
                  schedule it now?
                </p>
                <button
                  onClick={() => router.push('/appointments/new')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                >
                  Schedule Follow-Up
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default AppointmentDetailsPage;

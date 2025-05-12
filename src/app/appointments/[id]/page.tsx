'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaThumbsUp,
  FaUserMd,
} from 'react-icons/fa';

import AppointmentResult from '@/app/components/AppointmentResult';
import { Appointment, appointments } from '@/lib/mockData';

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
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [recommendationSubmitted, setRecommendationSubmitted] = useState(false);

  useEffect(() => {
    if (params.id) {
      const foundAppointment = appointments.find((appt) => appt.id === params.id);
      if (foundAppointment) {
        setAppointment(foundAppointment);
      }
    }
  }, [params.id]);

  const handleRecommendSubmit = (comment: string) => {
    // In a real app, this would save the recommendation to a database
    console.log('Provider recommendation:', comment);
    setShowRecommendModal(false);
    setRecommendationSubmitted(true);

    // Show success message briefly
    setTimeout(() => setRecommendationSubmitted(false), 3000);
  };

  if (!appointment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Appointment Not Found</h1>
          <p className="text-gray-600 mb-6">
            The appointment you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.back()}
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
      {/* Recommendation Modal */}
      {showRecommendModal && (
        <RecommendProviderModal
          provider={appointment.provider}
          onClose={() => setShowRecommendModal(false)}
          onSubmit={handleRecommendSubmit}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 transition"
          >
            <FaArrowLeft className="mr-2" />
            <span>Back to Calendar</span>
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
                <button className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition text-sm">
                  <FaCalendarAlt className="mr-1 text-gray-600" />
                  <span>Reschedule</span>
                </button>
              )}
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
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm">
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

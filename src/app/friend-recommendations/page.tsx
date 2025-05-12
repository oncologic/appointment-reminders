'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FaArrowLeft, FaHeart, FaPhone, FaStar, FaTimes, FaUserMd, FaUsers } from 'react-icons/fa';

import { futureScreenings, upcomingScreenings } from '@/lib/mockData';

// Book Provider Modal Component
const BookProviderModal: React.FC<{
  provider: string;
  location?: string;
  onClose: () => void;
  onRecordAppointment: (provider: string, screeningId?: string) => void;
  screeningId?: string;
}> = ({ provider, onClose, onRecordAppointment, screeningId }) => {
  // Mocked phone number - in a real app this would come from the provider data
  const providerPhone = '(555) 123-4567';
  // Mocked additional provider details - in a real app these would come from the provider data
  const clinic = 'Provider Specialty Center';
  const address = '456 Healthcare Blvd, Suite 200, San Francisco, CA 94107';

  // Get specialty based on provider name
  const getSpecialty = (name: string) => {
    if (name === 'Dr. Michael Chen') return 'Internal Medicine, Primary Care Physician';
    if (name.includes('Lisa Johnson')) return 'Dentist, DDS';
    if (name.includes('Sarah Williams')) return 'OB/GYN';
    if (name.includes('Robert Lee')) return 'Dermatology';
    if (name.includes('Emily Watson')) return 'Psychologist, PhD';
    if (name.includes('Alan Park')) return 'Allergist & Immunologist';
    if (name.includes('James Wilson')) return 'Cardiologist';
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
            onClick={() => onRecordAppointment(provider, screeningId)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Record Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

const FriendRecommendationsPage = () => {
  const router = useRouter();
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedScreeningId, setSelectedScreeningId] = useState<string | undefined>(undefined);

  // Combine all screenings
  const allScreenings = [...upcomingScreenings, ...futureScreenings].filter(
    (screening) => screening.friendRecommendations.length > 0
  );

  const handleRecordAppointment = (provider: string, screeningId?: string) => {
    setShowBookModal(false);
    router.push(
      `/appointments/new?provider=${encodeURIComponent(provider)}${screeningId ? `&screening=${screeningId}` : ''}`
    );
  };

  const handleBookClick = (e: React.MouseEvent, provider: string, screeningId: string) => {
    e.preventDefault(); // Prevent the default link behavior
    setSelectedProvider(provider);
    setSelectedScreeningId(screeningId);
    setShowBookModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Book Provider Modal */}
      {showBookModal && (
        <BookProviderModal
          provider={selectedProvider}
          onClose={() => setShowBookModal(false)}
          onRecordAppointment={handleRecordAppointment}
          screeningId={selectedScreeningId}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mb-4"
        >
          <FaArrowLeft className="text-sm" /> Back to home
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Friend Recommendations</h1>
        <p className="text-gray-600 mb-8">
          See healthcare providers recommended by people you know and trust
        </p>

        {allScreenings.length > 0 ? (
          <div className="space-y-6">
            {allScreenings.map((screening) => (
              <div key={screening.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${screening.bgColor} flex items-center justify-center`}
                    >
                      <FaUserMd className={screening.iconColor} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">{screening.title}</h2>
                      <p className="text-sm text-gray-500">{screening.description}</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <FaUsers /> Friend Recommendations ({screening.friendRecommendations.length})
                  </h3>

                  <div className="space-y-4">
                    {screening.friendRecommendations.map((rec, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-800">{rec.providerName}</h4>
                            <p className="text-sm text-gray-500">Recommended by {rec.friendName}</p>
                          </div>
                          <div className="flex items-center text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={i < rec.rating ? 'text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-gray-600 italic">&ldquo;{rec.comment}&rdquo;</p>
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={(e) => handleBookClick(e, rec.providerName, screening.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                          >
                            <FaHeart /> Book this provider
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <FaUsers className="text-5xl text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No recommendations yet</h2>
            <p className="text-gray-600 mb-4">
              It looks like none of your friends have shared provider recommendations yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRecommendationsPage;

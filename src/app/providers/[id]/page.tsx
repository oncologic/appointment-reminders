'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
  FaPhone,
  FaUserMd,
} from 'react-icons/fa';

import { BookProviderModal } from '@/app/components/BookProviderModal';
import { Provider } from '@/lib/providerData';
import { fetchProviderById } from '@/lib/providerService';

const ProviderDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProvider = async () => {
      if (!params || !params.id) {
        setError('Provider ID is missing');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const providerId = params.id as string;
        const data = await fetchProviderById(providerId);
        setProvider(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch provider:', err);
        setError('Provider not found or error loading provider data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProvider();
  }, [params]);

  const handleRecordAppointment = () => {
    setShowBookModal(false);
    if (provider) {
      router.push(`/appointments/new?provider=${encodeURIComponent(provider.name)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Provider Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "The provider you're looking for doesn't exist."}
          </p>
          <Link
            href="/providers"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center w-max mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Back to Providers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Book Provider Modal */}
      {showBookModal && (
        <BookProviderModal
          provider={provider.name}
          location={provider.address}
          specialty={provider.specialty}
          clinic={provider.clinic}
          phone={provider.phone}
          onClose={() => setShowBookModal(false)}
          onRecordAppointment={handleRecordAppointment}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/providers"
            className="flex items-center text-blue-600 hover:text-blue-800 transition"
          >
            <FaArrowLeft className="mr-2" />
            <span>Back to Providers</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div className="flex items-start">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                <FaUserMd className="text-blue-600" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">{provider.name}</h1>
                <p className="text-gray-600 text-lg">{provider.title}</p>
                {provider.credentials && (
                  <p className="text-gray-500">{provider.credentials.join(', ')}</p>
                )}
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setShowBookModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
              >
                <FaCalendarAlt className="mr-2" />
                Book Appointment
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">About</h2>
                <p className="text-gray-600">{provider.bio}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {provider.specialty}
                  </span>
                </div>
              </div>

              {provider.insuranceAccepted && provider.insuranceAccepted.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Insurance Accepted</h2>
                  <div className="flex flex-wrap gap-2">
                    {provider.insuranceAccepted.map((insurance, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {insurance}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {provider.languages && provider.languages.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Languages</h2>
                  <p className="text-gray-600">{provider.languages.join(', ')}</p>
                </div>
              )}
            </div>

            <div>
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-blue-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Office Location</p>
                      <p className="text-gray-600">{provider.clinic}</p>
                      <p className="text-gray-600">{provider.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaPhone className="text-blue-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Phone</p>
                      <p className="text-gray-600">{provider.phone}</p>
                    </div>
                  </div>
                  {provider.email && (
                    <div className="flex items-start">
                      <FaEnvelope className="text-blue-600 mt-1 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">Email</p>
                        <p className="text-gray-600">{provider.email}</p>
                      </div>
                    </div>
                  )}
                  {provider.website && (
                    <div className="flex items-start">
                      <FaGlobe className="text-blue-600 mt-1 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">Website</p>
                        <a
                          href={`https://${provider.website.replace(/^https?:\/\//, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {provider.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {provider.officeHours && provider.officeHours.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Office Hours</h2>
                  <div className="space-y-2">
                    {provider.officeHours.map((hours, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-gray-700 font-medium">{hours.day}</span>
                        <span className="text-gray-600">{hours.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Link
            href="/providers"
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            Back to Providers
          </Link>
          <button
            onClick={() => setShowBookModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center"
          >
            <FaCalendarAlt className="mr-2" />
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailPage;

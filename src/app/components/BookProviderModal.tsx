'use client';

import React from 'react';
import { FaPhone, FaTimes, FaUserMd } from 'react-icons/fa';

interface BookProviderModalProps {
  provider: string;
  location: string;
  specialty?: string;
  clinic?: string;
  phone?: string;
  onClose: () => void;
  onRecordAppointment: () => void;
}

export const BookProviderModal: React.FC<BookProviderModalProps> = ({
  provider,
  location,
  specialty = '',
  clinic = 'Provider Clinic',
  phone = '(555) 123-4567',
  onClose,
  onRecordAppointment,
}) => {
  // Use provided data or fallbacks
  const providerPhone = phone;
  const providerClinic = clinic;

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
          {specialty && <p className="text-gray-600">{specialty}</p>}
          {providerClinic && <p className="text-gray-600 mt-2">{providerClinic}</p>}
          <p className="text-gray-600 text-sm">{location}</p>

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

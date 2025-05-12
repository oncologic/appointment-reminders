'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';

import { Provider } from '@/lib/providerData';

interface ProviderFormData {
  name: string;
  specialty: string;
  title: string;
  credentials: string;
  clinic: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  acceptingNewPatients: boolean;
  insuranceAccepted: string;
  languages: string;
  bio: string;
  customSpecialty?: string;
}

const NewProviderPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ProviderFormData>({
    name: '',
    specialty: '',
    title: '',
    credentials: '',
    clinic: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    acceptingNewPatients: true,
    insuranceAccepted: '',
    languages: '',
    bio: '',
    customSpecialty: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, this would save the provider to a database
    // For now, we'll just simulate it by logging and navigating back

    const newProvider: Provider = {
      id: `provider-${Date.now()}`, // Generate a unique ID
      name: formData.name,
      specialty:
        formData.specialty === 'Other' ? formData.customSpecialty || 'Other' : formData.specialty,
      title: formData.title,
      credentials: formData.credentials ? formData.credentials.split(',').map((c) => c.trim()) : [],
      clinic: formData.clinic,
      address: formData.address,
      phone: formData.phone,
      email: formData.email || undefined,
      website: formData.website || undefined,
      acceptingNewPatients: formData.acceptingNewPatients,
      insuranceAccepted: formData.insuranceAccepted
        ? formData.insuranceAccepted.split(',').map((i) => i.trim())
        : [],
      languages: formData.languages ? formData.languages.split(',').map((l) => l.trim()) : [],
      bio: formData.bio || undefined,
    };

    console.log('New Provider:', newProvider);

    // Navigate back to providers list
    router.push('/providers');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/providers"
            className="flex items-center text-blue-600 hover:text-blue-800 transition"
          >
            <FaArrowLeft className="mr-2" />
            <span>Back to Providers</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Add New Provider</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Provider Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={handleChange}
                placeholder="Dr. John Doe"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                Specialty <span className="text-red-500">*</span>
              </label>
              <select
                id="specialty"
                name="specialty"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.specialty}
                onChange={handleChange}
              >
                <option value="">Select a specialty</option>
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="Family Medicine">Family Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="OB/GYN">OB/GYN</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Neurology">Neurology</option>
                <option value="Oncology">Oncology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Psychiatry">Psychiatry</option>
                <option value="Psychology">Psychology</option>
                <option value="Optometry">Optometry</option>
                <option value="Dentistry">Dentistry</option>
                <option value="Physical Therapy">Physical Therapy</option>
                <option value="Allergy & Immunology">Allergy & Immunology</option>
                <option value="Radiology">Radiology</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {formData.specialty === 'Other' && (
              <div className="mb-4">
                <label
                  htmlFor="customSpecialty"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Specify Specialty <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="customSpecialty"
                  name="customSpecialty"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.customSpecialty || ''}
                  onChange={handleChange}
                  placeholder="Enter specialty..."
                />
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Professional Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.title}
                onChange={handleChange}
                placeholder="Primary Care Physician"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="credentials" className="block text-sm font-medium text-gray-700 mb-1">
                Credentials (comma-separated)
              </label>
              <input
                type="text"
                id="credentials"
                name="credentials"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.credentials}
                onChange={handleChange}
                placeholder="MD, Board Certified"
              />
            </div>

            <div className="md:col-span-2">
              <div className="mb-4">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Biography
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Brief professional biography and areas of expertise..."
                />
              </div>
            </div>

            {/* Practice Information */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Practice Information</h2>
            </div>

            <div className="mb-4">
              <label htmlFor="clinic" className="block text-sm font-medium text-gray-700 mb-1">
                Clinic/Practice Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="clinic"
                name="clinic"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.clinic}
                onChange={handleChange}
                placeholder="Healthcare Clinic"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Medical Plaza, Suite 300, San Francisco, CA 94107"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={handleChange}
                placeholder="provider@example.com"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="text"
                id="website"
                name="website"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.website}
                onChange={handleChange}
                placeholder="www.example.com"
              />
            </div>

            {/* Additional Information */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>
            </div>

            <div className="mb-4 md:col-span-2">
              <label
                htmlFor="insuranceAccepted"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Insurance
              </label>
              <input
                type="text"
                id="insuranceAccepted"
                name="insuranceAccepted"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.insuranceAccepted}
                onChange={handleChange}
                placeholder="Blue Cross, Aetna, Medicare, United Healthcare"
              />
            </div>

            <div className="mb-4 md:col-span-2">
              <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-1">
                Languages Spoken (comma-separated)
              </label>
              <input
                type="text"
                id="languages"
                name="languages"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.languages}
                onChange={handleChange}
                placeholder="English, Spanish, Mandarin"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <Link
              href="/providers"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition flex items-center"
            >
              <FaTimes className="mr-2" />
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
            >
              <FaSave className="mr-2" />
              Save Provider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProviderPage;

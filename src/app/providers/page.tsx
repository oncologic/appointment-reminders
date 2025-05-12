'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FaChevronLeft, FaPlus, FaSearch, FaUserMd } from 'react-icons/fa';

import { Provider, providers, searchProviders } from '@/lib/providerData';

const ProvidersPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedProviders, setDisplayedProviders] = useState<Provider[]>(providers);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setDisplayedProviders(providers);
    } else {
      setDisplayedProviders(searchProviders(value));
    }
  };

  // Group providers by specialty
  const groupedProviders = displayedProviders.reduce<Record<string, Provider[]>>(
    (acc, provider) => {
      const specialty = provider.specialty;
      if (!acc[specialty]) {
        acc[specialty] = [];
      }
      acc[specialty].push(provider);
      return acc;
    },
    {}
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center mr-4">
            <FaChevronLeft className="mr-1" size={14} />
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Healthcare Providers</h1>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Search providers by name, specialty, or clinic..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <Link
            href="/providers/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Provider
          </Link>
        </div>

        {Object.keys(groupedProviders).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No providers found. Try another search term.</p>
          </div>
        ) : (
          Object.entries(groupedProviders).map(([specialty, specialtyProviders]) => (
            <div key={specialty} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{specialty}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specialtyProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition"
                  >
                    <div className="p-4">
                      <div className="flex items-start">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-4">
                          <FaUserMd className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{provider.name}</h3>
                          <p className="text-sm text-gray-600">{provider.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{provider.clinic}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <Link
                          href={`/providers/${provider.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProvidersPage;

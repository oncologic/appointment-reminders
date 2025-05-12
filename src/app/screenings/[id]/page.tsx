import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShareAlt,
  FaUserMd,
} from 'react-icons/fa';
import * as Icons from 'react-icons/fa';

import {
  ScreeningRecommendation,
  ScreeningResult,
  futureScreenings,
  upcomingScreenings,
} from '@/lib/mockData';

import ScreeningDetailsClient from './ScreeningDetailsClient';

interface ScreeningDetailsPageProps {
  params: {
    id: string;
  };
}

const ScreeningDetailsPage: React.FC<ScreeningDetailsPageProps> = ({ params }) => {
  // Find the screening in our data
  const allScreenings = [...upcomingScreenings, ...futureScreenings];
  const screening = allScreenings.find((s) => s.id === params.id);

  // If screening not found, return 404
  if (!screening) {
    notFound();
  }

  // Get the icon component dynamically
  const IconComponent = Icons[screening.icon as keyof typeof Icons];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center mb-6">
        <FaArrowLeft className="mr-2" />
        Back to dashboard
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center mb-6">
          <div
            className={`w-16 h-16 rounded-full ${screening.bgColor} flex items-center justify-center mr-5`}
          >
            {IconComponent && <IconComponent className={`text-2xl ${screening.iconColor}`} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{screening.title}</h1>
            <p className="text-gray-600">{screening.description}</p>
            <span className="mt-2 inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
              {screening.statusText}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About this screening</h2>
          <p className="text-gray-700">
            {screening.title} is an important preventive health measure. Regular screenings help
            detect potential health issues early, when they are most treatable.
          </p>
        </div>

        {screening.previousResults && screening.previousResults.length > 0 && (
          <ScreeningDetailsClient
            screening={screening}
            previousResults={screening.previousResults}
          />
        )}
      </div>
    </div>
  );
};

export default ScreeningDetailsPage;

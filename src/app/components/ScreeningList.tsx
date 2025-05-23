import Link from 'next/link';
import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

import ScreeningCard from './ScreeningCard';

// Define local interface instead of importing from mockData
interface ScreeningRecommendation {
  id: string;
  title: string;
  description: string;
  status: 'due' | 'overdue' | 'completed' | 'upcoming';
  statusText: string;
  schedulePath: string;
  icon?: string;
  iconColor?: string;
  bgColor?: string;
  friendRecommendations: any[];
}

interface ScreeningListProps {
  title: string;
  screenings: ScreeningRecommendation[];
  viewAllLink: string;
}

const ScreeningList: React.FC<ScreeningListProps> = ({ title, screenings, viewAllLink }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <div className="flex justify-between items-center p-5 border-b">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <Link
          href={viewAllLink}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          View all
          <FaChevronRight className="text-sm" />
        </Link>
      </div>
      <div className="py-2">
        {screenings.map((screening) => (
          <ScreeningCard key={screening.id} screening={screening} />
        ))}
      </div>
    </div>
  );
};

export default ScreeningList;

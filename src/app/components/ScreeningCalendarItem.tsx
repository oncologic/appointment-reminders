import Link from 'next/link';
import React from 'react';
import { FaCalendarPlus, FaUserFriends } from 'react-icons/fa';

// Use a more compatible interface for both screening types
interface CalendarScreeningRecommendation {
  id: string;
  title: string;
  name?: string;
  status: 'due' | 'overdue' | 'completed' | 'upcoming';
  statusText: string;
  schedulePath: string;
  friendRecommendations: any[];
  // Optional additional fields
  description?: string;
  ageRange?: any[];
  ageRangeDetails?: any[];
}

interface ScreeningCalendarItemProps {
  screening: CalendarScreeningRecommendation;
  handleMouseEnter: (
    e: React.MouseEvent<HTMLDivElement>,
    screening: CalendarScreeningRecommendation
  ) => void;
  handleMouseLeave: () => void;
  year: number;
}

const ScreeningCalendarItem: React.FC<ScreeningCalendarItemProps> = ({
  screening,
  handleMouseEnter,
  handleMouseLeave,
  year,
}) => {
  // Only show in the relevant year
  const shouldShowInYear = () => {
    if (screening.status === 'completed') return false;

    // Extract year from statusText if it has one
    const yearMatch = screening.statusText.match(/\(\s*age\s+(\d+)\s*\)/i);
    const ageYear = yearMatch ? parseInt(yearMatch[1]) : null;

    if (ageYear) {
      // Show in the year when the age would be reached
      const currentYear = new Date().getFullYear();
      const userAge = 38; // From the user data in page.tsx
      const yearWhenDue = currentYear + (ageYear - userAge);
      return year === yearWhenDue;
    }

    // If due soon or overdue, always show in current year
    if (screening.status === 'overdue' || screening.status === 'due') {
      return year === new Date().getFullYear() || year === new Date().getFullYear() + 1;
    }

    return true; // Default case
  };

  if (!shouldShowInYear()) return null;

  // Determine color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'due':
        return 'bg-orange-400';
      case 'overdue':
        return 'bg-red-500';
      case 'upcoming':
        return 'bg-blue-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="flex flex-col gap-0.5 mt-1">
      <div
        className="hover:brightness-110 transition-all cursor-pointer"
        onMouseEnter={(e) => handleMouseEnter(e, screening)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`flex items-center text-xs text-white px-1.5 py-0.5 rounded-sm ${getStatusColor(
            screening.status
          )} border-l-4 border-blue-600 opacity-80`}
        >
          <FaCalendarPlus className="mr-1 flex-shrink-0 text-[10px]" />
          <span className="truncate text-[11px] font-medium">{screening.title}</span>
        </div>
      </div>

      {/* Add a request recommendations link if there are no friend recommendations */}
      {screening.friendRecommendations?.length === 0 && (
        <Link href={`/recommendations?screening=${screening.id}`} className="block">
          <div className="flex items-center text-xs text-blue-600 px-1.5 py-0.5 rounded-sm bg-blue-50 hover:bg-blue-100 transition-all text-[10px]">
            <FaUserFriends className="mr-1 flex-shrink-0 text-[10px]" />
            <span className="truncate text-[10px]">Request recommendations</span>
          </div>
        </Link>
      )}
    </div>
  );
};

export default ScreeningCalendarItem;

import React from 'react';
import { FaCalendarPlus, FaClipboardCheck, FaStar, FaUserFriends } from 'react-icons/fa';

// Remove this import and create a local interface instead
interface ScreeningRecommendation {
  id: string;
  title: string;
  description: string;
  status: 'due' | 'overdue' | 'completed' | 'upcoming';
  statusText: string;
  schedulePath: string;
  friendRecommendations: any[];
}

interface ScreeningTooltipProps {
  screening: ScreeningRecommendation;
  position: {
    top: number;
    left: number;
  };
}

const ScreeningTooltip: React.FC<ScreeningTooltipProps> = ({ screening, position }) => {
  // Adjust position to ensure tooltip is visible within viewport
  const adjustedPosition = {
    top: position.top,
    left: Math.min(position.left, window.innerWidth - 320), // Prevent overflow from right edge
  };

  // Extract year (age) info if available
  const yearMatch = screening.statusText.match(/\(\s*age\s+(\d+)\s*\)/i);
  const ageYear = yearMatch ? parseInt(yearMatch[1]) : null;

  // Calculate what year this would be due, based on current age
  const getDueYear = () => {
    if (ageYear) {
      const currentYear = new Date().getFullYear();
      const userAge = 38; // From the user data in page.tsx
      return currentYear + (ageYear - userAge);
    }
    return null;
  };

  const dueYear = getDueYear();

  return (
    <div
      className="absolute z-20 bg-white shadow-lg rounded-md p-4 border border-blue-100 w-72 animate-fadeIn tooltip-container"
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
        maxWidth: '320px',
        transform: 'translateY(5px)',
      }}
      // Allow tooltip to be hovered over to maintain visibility
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-medium text-gray-900">{screening.title}</h3>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            screening.status === 'overdue'
              ? 'bg-red-100 text-red-800'
              : screening.status === 'due'
                ? 'bg-orange-100 text-orange-800'
                : screening.status === 'upcoming'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
          }`}
        >
          {screening.statusText}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1">{screening.description}</p>

      {/* Due year information */}
      {dueYear && (
        <div className="mt-2 flex items-center text-sm text-gray-600">
          <FaCalendarPlus className="mr-2 text-blue-600" />
          <span>Due in {dueYear}</span>
        </div>
      )}

      {/* Show friend recommendations if available */}
      {screening.friendRecommendations?.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-2">
          <p className="text-xs font-medium text-gray-600 mb-2 flex items-center">
            <FaUserFriends className="mr-1 text-blue-600" />
            Friend Recommendations:
          </p>
          <ul className="space-y-2">
            {screening.friendRecommendations.map((rec, idx) => (
              <li key={idx} className="text-xs bg-blue-50 rounded-md p-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{rec.providerName}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < rec.rating ? 'text-yellow-400' : 'text-gray-300'}
                        size={10}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mt-1">&ldquo;{rec.comment}&rdquo;</p>
                <p className="text-gray-500 mt-1">— {rec.friendName}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Request recommendations if none available */}
      {screening.friendRecommendations?.length === 0 && (
        <div className="mt-3 border-t border-gray-100 pt-2">
          <p className="text-xs text-gray-600 mb-2">No friend recommendations yet.</p>
          <a
            href={`/recommendations?screening=${screening.id}`}
            className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-1 rounded-md inline-flex items-center hover:bg-blue-100 transition-colors"
          >
            <FaUserFriends className="mr-1" />
            Request recommendations
          </a>
        </div>
      )}

      <div className="mt-3 flex flex-col space-y-2">
        <a
          href={screening.schedulePath}
          className="text-xs border border-blue-200 rounded-md px-3 py-1.5 bg-blue-50 flex items-center text-blue-600 font-medium hover:bg-blue-100 transition-colors"
        >
          <FaCalendarPlus className="mr-1.5" />
          Schedule this screening
        </a>

        <a
          href={`/guidelines#${screening.id}`}
          className="text-xs border border-gray-200 rounded-md px-3 py-1.5 bg-gray-50 flex items-center text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <FaClipboardCheck className="mr-1.5" />
          View guidelines
        </a>
      </div>
    </div>
  );
};

export default ScreeningTooltip;

import React from 'react';
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaCalendarPlus,
  FaClipboardCheck,
  FaStar,
  FaUserFriends,
} from 'react-icons/fa';

import { useAppointments } from '@/app/appointments/page';

// Use a compatible interface with MonthCalendar
interface CalendarScreeningRecommendation {
  id: string;
  title: string;
  description: string;
  name?: string;
  status: 'due' | 'overdue' | 'completed' | 'upcoming';
  statusText: string;
  schedulePath: string;
  friendRecommendations: any[];
  // Optional additional fields
  ageRange?: any[];
  ageRangeDetails?: any[];
}

interface ScreeningTooltipProps {
  screening: CalendarScreeningRecommendation;
  position: {
    top: number;
    left: number;
  };
}

const ScreeningTooltip: React.FC<ScreeningTooltipProps> = ({ screening, position }) => {
  const { appointments } = useAppointments();

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

  // Get all appointments for this screening
  const screeningAppointments = appointments.filter((appt) => appt.screeningId === screening.id);

  // Sort appointments by date (closest first)
  const sortedAppointments = [...screeningAppointments].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Check if there are any future appointments
  const futureAppointments = sortedAppointments.filter(
    (appt) => !appt.completed && appt.date > new Date()
  );

  // Check if there are any completed appointments in the current year
  const currentYear = new Date().getFullYear();
  const completedThisYear = sortedAppointments.filter(
    (appt) => appt.completed && appt.date.getFullYear() === currentYear
  );

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

      {/* Scheduled appointments section */}
      {screeningAppointments.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-2">
          <p className="text-xs font-medium text-gray-700 mb-1 flex items-center">
            <FaCalendarCheck className="mr-1 text-green-600" />
            Scheduled Appointments:
          </p>

          {futureAppointments.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-gray-600 mb-1">Upcoming:</div>
              {futureAppointments.slice(0, 2).map((appt, idx) => (
                <a key={idx} href={appt.detailsPath} className="block">
                  <div className="text-xs bg-blue-50 rounded-md p-2 mb-1 hover:bg-blue-100 transition-colors">
                    <div className="flex justify-between">
                      <span className="font-medium">{appt.title}</span>
                    </div>
                    <div className="text-gray-600 mt-0.5 flex items-center">
                      <FaCalendarAlt className="mr-1 text-[10px]" />
                      {appt.date.toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-gray-600 mt-0.5">{appt.provider}</div>
                  </div>
                </a>
              ))}
              {futureAppointments.length > 2 && (
                <div className="text-xs text-blue-600 mt-1">
                  +{futureAppointments.length - 2} more upcoming
                </div>
              )}
            </div>
          )}

          {completedThisYear.length > 0 && (
            <div>
              <div className="text-xs text-gray-600 mb-1">Completed this year:</div>
              {completedThisYear.slice(0, 1).map((appt, idx) => (
                <a key={idx} href={appt.detailsPath} className="block">
                  <div className="text-xs bg-green-50 rounded-md p-2 mb-1 hover:bg-green-100 transition-colors">
                    <div className="flex justify-between">
                      <span className="font-medium">{appt.title}</span>
                    </div>
                    <div className="text-gray-600 mt-0.5 flex items-center">
                      <FaCalendarAlt className="mr-1 text-[10px]" />
                      {appt.date.toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    {appt.result && (
                      <div className="mt-1 text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded inline-block">
                        Result: {appt.result.status}
                      </div>
                    )}
                  </div>
                </a>
              ))}
              {completedThisYear.length > 1 && (
                <div className="text-xs text-green-600 mt-1">
                  +{completedThisYear.length - 1} more completed
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Due year information */}
      {dueYear && !completedThisYear.length && !futureAppointments.length && (
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

      {/* Request recommendations if none available and no appointments scheduled */}
      {screening.friendRecommendations?.length === 0 && futureAppointments.length === 0 && (
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
        {futureAppointments.length === 0 ? (
          <a
            href={screening.schedulePath}
            className="text-xs border border-blue-200 rounded-md px-3 py-1.5 bg-blue-50 flex items-center text-blue-600 font-medium hover:bg-blue-100 transition-colors"
          >
            <FaCalendarPlus className="mr-1.5" />
            Schedule this screening
          </a>
        ) : (
          <a
            href={futureAppointments[0].detailsPath}
            className="text-xs border border-green-200 rounded-md px-3 py-1.5 bg-green-50 flex items-center text-green-600 font-medium hover:bg-green-100 transition-colors"
          >
            <FaCalendarCheck className="mr-1.5" />
            View upcoming appointment
          </a>
        )}

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

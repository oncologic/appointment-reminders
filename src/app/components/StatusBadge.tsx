import React from 'react';
import { FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';

interface StatusBadgeProps {
  status: 'completed' | 'due' | 'overdue' | 'upcoming';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'completed':
      return (
        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm">
          <FaCheckCircle /> Completed
        </span>
      );
    case 'due':
      return (
        <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-sm">
          <FaClock /> Due Soon
        </span>
      );
    case 'overdue':
      return (
        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-sm">
          <FaExclamationTriangle /> Overdue
        </span>
      );
    case 'upcoming':
      return (
        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-sm">
          <FaClock /> Upcoming
        </span>
      );
    default:
      return null;
  }
};

export default StatusBadge;

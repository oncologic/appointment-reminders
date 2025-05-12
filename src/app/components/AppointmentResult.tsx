import React from 'react';
import {
  FaArrowRight,
  FaCalendarCheck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileMedical,
  FaThumbsUp,
} from 'react-icons/fa';

import { Appointment } from '@/lib/mockData';

interface AppointmentResultProps {
  appointment: Appointment;
  onRecommendProvider?: () => void;
}

const AppointmentResult: React.FC<AppointmentResultProps> = ({
  appointment,
  onRecommendProvider,
}) => {
  if (!appointment.completed || !appointment.result) {
    return null;
  }

  const { result } = appointment;

  // Format the result date
  const formattedDate = new Date(result.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Determine status styling
  const getStatusInfo = () => {
    switch (result.status) {
      case 'clear':
        return {
          icon: <FaCheckCircle className="text-green-500" />,
          label: 'All Clear',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
        };
      case 'abnormal':
        return {
          icon: <FaExclamationTriangle className="text-red-500" />,
          label: 'Abnormal Finding',
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
        };
      case 'followup':
        return {
          icon: <FaArrowRight className="text-blue-500" />,
          label: 'Follow-Up Recommended',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
        };
      default:
        return {
          icon: <FaFileMedical className="text-blue-500" />,
          label: 'Results Available',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Results</h3>
        <div className="flex items-center text-gray-500 text-sm">
          <FaCalendarCheck className="mr-1" />
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className={`inline-flex items-center py-1 px-3 rounded-md ${statusInfo.bgColor}`}>
          <div className="mr-1.5">{statusInfo.icon}</div>
          <p className={`font-medium text-sm ${statusInfo.textColor}`}>{statusInfo.label}</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Provider Notes</h4>
        <div className="text-gray-600 text-sm p-4 bg-blue-50 rounded-md">{result.notes}</div>
      </div>

      {onRecommendProvider && (
        <div className="flex justify-end">
          <button
            onClick={onRecommendProvider}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
          >
            <FaThumbsUp className="mr-1.5" />
            <span>Recommend Provider</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentResult;

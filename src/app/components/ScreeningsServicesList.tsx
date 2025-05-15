import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

import { BookProviderModal } from './BookProviderModal';
import ScreeningServiceCard from './ScreeningServiceCard';
import { ScreeningRecommendation } from './types';

interface ScreeningsServicesListProps {
  screenings: ScreeningRecommendation[];
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

const ScreeningsServicesList = ({
  screenings,
  searchQuery = '',
  onSearch = () => {},
}: ScreeningsServicesListProps) => {
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProviderSelect = (provider: any) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProvider(null);
  };

  const handleRecordAppointment = () => {
    setIsModalOpen(false);
    // Additional logic for recording appointment could go here
  };

  // Filter screenings with previous results/providers first
  const sortedScreenings = [...screenings].sort((a, b) => {
    // First sort by having previous results
    const aHasResults = a.previousResults && a.previousResults.length > 0;
    const bHasResults = b.previousResults && b.previousResults.length > 0;

    if (aHasResults && !bHasResults) return -1;
    if (!aHasResults && bHasResults) return 1;

    // Then by completion status
    const aCompleted = a.status === 'completed';
    const bCompleted = b.status === 'completed';

    if (aCompleted && !bCompleted) return -1;
    if (!aCompleted && bCompleted) return 1;

    return 0;
  });

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search screenings and services..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Screenings & Services</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedScreenings.map((screening) => (
          <ScreeningServiceCard
            key={screening.id}
            service={{
              id: screening.id,
              name: screening.name,
              description: screening.description || '',
              duration: screening.frequency || 'N/A',
            }}
            enrichedData={{
              ...screening,
              id: screening.id,
              name: screening.name,
              description: screening.description || '',
              duration: screening.frequency || 'N/A',
              previousResults: screening.previousResults,
              status: screening.status,
            }}
            onSelectProvider={handleProviderSelect}
          />
        ))}
      </div>

      {isModalOpen && selectedProvider && (
        <BookProviderModal
          provider={selectedProvider.name}
          location={selectedProvider.specialty || 'Healthcare Provider'}
          specialty={selectedProvider.specialty}
          clinic={selectedProvider.providerDetails?.clinic || ''}
          phone={selectedProvider.providerDetails?.phone || ''}
          onClose={handleModalClose}
          onRecordAppointment={handleRecordAppointment}
        />
      )}
    </div>
  );
};

export default ScreeningsServicesList;

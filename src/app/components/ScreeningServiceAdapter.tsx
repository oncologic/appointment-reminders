import { useMemo, useState } from 'react';
import { FaSearch } from 'react-icons/fa';

import { useGuidelines } from '@/app/hooks/useGuidelines';
import { useUser } from '@/app/hooks/useUser';

import { BookProviderModal } from './BookProviderModal';
import ScreeningServiceCard from './ScreeningServiceCard';
import { ScreeningResult } from './types';

// Interface for the ServiceType from appointments/new/page.tsx
interface ServiceType {
  id: string;
  name: string;
  description: string;
  duration: string;
  relevantForAge?: [number, number]; // [minAge, maxAge]
}

interface EnrichedService extends ServiceType {
  previousResults?: ScreeningResult[];
  status?: 'completed' | 'due' | 'overdue' | 'upcoming';
}

interface ScreeningServiceAdapterProps {
  services: ServiceType[];
  searchTerm?: string;
  onSearch?: (query: string) => void;
  onServiceSelect?: (service: ServiceType) => void;
  onSelectProvider?: (provider: any, service: ServiceType) => void;
}

const ScreeningServiceAdapter = ({
  services,
  searchTerm = '',
  onSearch = () => {},
  onServiceSelect = () => {},
  onSelectProvider = () => {},
}: ScreeningServiceAdapterProps) => {
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get user profile and screenings from the database
  const { user } = useUser();
  const { screenings } = useGuidelines(user);

  // Enrich services with previous results and status from real screening data
  const enrichedServices = useMemo(() => {
    return services.map((service) => {
      // Find if there's matching screening data
      const matchingScreening = screenings.find(
        (s) => s.name.toLowerCase() === service.name.toLowerCase()
      );

      return {
        ...service,
        previousResults: matchingScreening?.previousResults || [],
        status: matchingScreening?.status,
      };
    });
  }, [services, screenings]);

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return enrichedServices;

    const term = searchTerm.toLowerCase();
    return enrichedServices.filter(
      (service) =>
        service.name.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term)
    );
  }, [enrichedServices, searchTerm]);

  const handleProviderSelect = (provider: any, service: ServiceType) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
    onSelectProvider(provider, service);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProvider(null);
  };

  const handleRecordAppointment = () => {
    setIsModalOpen(false);
    // Additional logic for recording appointment
  };

  const handleServiceClick = (service: ServiceType) => {
    onServiceSelect(service);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search screenings..."
          className="w-full p-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 grid-cols-1">
        {filteredServices.map((enrichedService) => (
          <div
            key={enrichedService.id}
            onClick={() => handleServiceClick(enrichedService)}
            className="cursor-pointer"
          >
            <ScreeningServiceCard
              service={enrichedService}
              enrichedData={enrichedService}
              onSelectProvider={(provider) => handleProviderSelect(provider, enrichedService)}
            />
          </div>
        ))}

        {filteredServices.length === 0 && (
          <p className="text-center py-4 text-gray-500">
            No screenings found matching your search.
          </p>
        )}
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

export default ScreeningServiceAdapter;

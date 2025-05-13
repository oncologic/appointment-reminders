import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaUserMd } from 'react-icons/fa';

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

interface ScreeningServiceCardProps {
  service: ServiceType;
  enrichedData: EnrichedService;
  onSelectProvider: (provider: any) => void;
}

const ScreeningServiceCard = ({
  service,
  enrichedData,
  onSelectProvider,
}: ScreeningServiceCardProps) => {
  const [expanded, setExpanded] = useState(false);

  // Get unique providers from previous results
  const getUniqueProviders = () => {
    if (!enrichedData.previousResults || enrichedData.previousResults.length === 0) {
      return [];
    }

    const uniqueProviders = new Map();

    enrichedData.previousResults.forEach((result) => {
      if (!uniqueProviders.has(result.provider.id)) {
        uniqueProviders.set(result.provider.id, result.provider);
      }
    });

    return Array.from(uniqueProviders.values());
  };

  const uniqueProviders = getUniqueProviders();
  const hasProviders = uniqueProviders.length > 0;

  return (
    <div className="border rounded-lg p-4 hover:bg-blue-50 transition">
      <div className="flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-800">{service.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{service.description}</p>
            <p className="text-xs text-gray-600 mt-2">Duration: {service.duration}</p>
          </div>

          {enrichedData.status === 'completed' && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              My Screening
            </span>
          )}
        </div>

        {hasProviders && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 text-sm font-medium flex items-center"
            >
              {expanded ? (
                <>
                  <FaChevronUp className="mr-1" size={14} />
                  Hide previous providers ({uniqueProviders.length})
                </>
              ) : (
                <>
                  <FaChevronDown className="mr-1" size={14} />
                  Show previous providers ({uniqueProviders.length})
                </>
              )}
            </button>

            {expanded && (
              <div className="mt-2 space-y-2 pl-2 border-l-2 border-blue-100">
                {uniqueProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center p-2 rounded hover:bg-blue-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProvider(provider);
                    }}
                  >
                    <FaUserMd className="text-blue-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium">{provider.name}</p>
                      {provider.specialty && (
                        <p className="text-xs text-gray-500">{provider.specialty}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreeningServiceCard;

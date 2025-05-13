import React from 'react';

import { useGuidelines } from '@/app/hooks/useGuidelines';
import { useUser } from '@/app/hooks/useUser';

import ScreeningList from './ScreeningList';

const HealthScreenings: React.FC = () => {
  // Get user profile and screenings from the database
  const { user } = useUser();
  const { screenings } = useGuidelines(user);

  // Split screenings into upcoming (due or overdue) and future (upcoming)
  const upcomingScreenings = screenings
    .filter((screening) => screening.status === 'due' || screening.status === 'overdue')
    .map((screening) => ({
      id: screening.id,
      title: screening.name,
      description: screening.description,
      status: screening.status,
      statusText: `${screening.status === 'overdue' ? 'Overdue' : 'Due soon'}: ${screening.name}`,
      schedulePath: `/appointments/new?screening=${screening.id}`,
      icon: '',
      iconColor: '',
      bgColor: '',
      friendRecommendations: [],
    }));

  const futureScreenings = screenings
    .filter((screening) => screening.status === 'upcoming')
    .map((screening) => ({
      id: screening.id,
      title: screening.name,
      description: screening.description,
      status: screening.status,
      statusText: `Recommended: ${screening.name}`,
      schedulePath: `/appointments/new?screening=${screening.id}`,
      icon: '',
      iconColor: '',
      bgColor: '',
      friendRecommendations: [],
    }));

  return (
    <div className="lg:col-span-4">
      <ScreeningList
        title="Upcoming health screenings"
        screenings={upcomingScreenings}
        viewAllLink="/guidelines"
      />

      <ScreeningList
        title="Future recommended screenings"
        screenings={futureScreenings}
        viewAllLink="/guidelines"
      />
    </div>
  );
};

export default HealthScreenings;

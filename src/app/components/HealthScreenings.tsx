import React from 'react';

import { futureScreenings, upcomingScreenings } from '@/lib/mockData';

import ScreeningList from './ScreeningList';

const HealthScreenings: React.FC = () => {
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

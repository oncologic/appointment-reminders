'use client';

import React, { useEffect, useState } from 'react';

const FirstVisitPopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisitedAppointmentsBefore');
    if (!hasVisited) {
      setShowPopup(true);
      // Set the flag in localStorage
      localStorage.setItem('hasVisitedAppointmentsBefore', 'true');
    }
  }, []);

  const closePopup = () => {
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-blue-800 mb-4">Welcome to our Hackathon Project!</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            This application was developed during OncoLogic&apos;s 2025 Hackathon and is intended
            for demonstration purposes only.
          </p>
          <p>As you explore the application, please note:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>All screening guidelines shown are placeholders</li>
            <li>Always verify any health information with qualified healthcare providers</li>
            <li>This is not a substitute for professional medical advice</li>
          </ul>
        </div>
        <button
          onClick={closePopup}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-150"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

export default FirstVisitPopup;

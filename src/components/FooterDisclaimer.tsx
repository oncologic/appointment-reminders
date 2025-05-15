'use client';

import React from 'react';

const FooterDisclaimer = () => {
  return (
    <footer className="bg-blue-100 py-3 text-center text-sm text-blue-800 fixed bottom-0 w-full shadow-md">
      <div className="container mx-auto px-4">
        <p>
          <strong>Educational Purposes Only:</strong> This site is not intended to provide medical
          advice. Always consult with your healthcare provider for medical guidance.
        </p>
      </div>
    </footer>
  );
};

export default FooterDisclaimer;

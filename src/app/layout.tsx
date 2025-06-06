import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import FirstVisitPopup from '@/components/FirstVisitPopup';
import FooterDisclaimer from '@/components/FooterDisclaimer';
import AuthProvider from '@/components/auth/AuthProvider';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Appointment Reminders',
  description: 'A Next.js application for appointment reminders',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-gray-700 pb-12`}>
        <AuthProvider>
          <FirstVisitPopup />
          {children}
          <FooterDisclaimer />
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}

export interface ScreeningRecommendation {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  status: 'due' | 'overdue' | 'completed' | 'upcoming';
  statusText: string;
  schedulePath: string;
  detailsPath?: string;
  friendRecommendations: FriendRecommendation[];
  previousResults?: ScreeningResult[];
}

export interface FriendRecommendation {
  friendName: string;
  providerName: string;
  rating: number;
  comment: string;
}

export interface ScreeningResult {
  date: string;
  provider: string;
  result: 'clear' | 'abnormal' | 'pending';
  notes?: string;
  providerDetails?: {
    name: string;
    specialty?: string;
    clinic?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface Appointment {
  id: string;
  date: Date;
  title: string;
  type: 'Examination' | 'Treatment' | 'Consultation';
  provider: string;
  location: string;
  notes?: string;
  detailsPath: string;
  completed: boolean;
}

// Create appointments for the calendar view
export const appointments: Appointment[] = [
  {
    id: 'appt-1',
    date: new Date(2025, 0, 4, 8, 0), // Jan 4, 2025, 8:00 AM
    title: 'Annual Physical',
    type: 'Examination',
    provider: 'Dr. Michael Chen',
    location: 'Primary Care Clinic, 123 Health St.',
    notes: 'Yearly physical examination, fasting required',
    detailsPath: '/appointments/appt-1',
    completed: true,
  },
  {
    id: 'appt-2',
    date: new Date(2025, 0, 4, 9, 0), // Jan 4, 2025, 9:00 AM
    title: 'Physical Therapy',
    type: 'Treatment',
    provider: 'Markus Jonsson, PT',
    location: 'Rehabilitation Center, 456 Wellness Ave.',
    notes: 'Bring exercise clothes and comfortable shoes',
    detailsPath: '/appointments/appt-2',
    completed: true,
  },
  {
    id: 'appt-3',
    date: new Date(2025, 0, 4, 10, 0), // Jan 4, 2025, 10:00 AM
    title: 'Follow-up Consultation',
    type: 'Consultation',
    provider: 'Dr. Sarah Williams',
    location: "Women's Health Clinic, 789 Medical Center",
    notes: 'Discussing lab results from previous visit',
    detailsPath: '/appointments/appt-3',
    completed: true,
  },
  {
    id: 'appt-4',
    date: new Date(2025, 0, 7, 11, 0), // Jan 7, 2025, 11:00 AM
    title: 'Dental Cleaning',
    type: 'Treatment',
    provider: 'Dr. Lisa Johnson, DDS',
    location: 'Smile Dental, 321 Tooth Ln.',
    notes: 'Routine cleaning and check-up',
    detailsPath: '/appointments/appt-4',
    completed: true,
  },
  {
    id: 'appt-5',
    date: new Date(2025, 0, 7, 10, 0), // Jan 7, 2025, 10:00 AM
    title: 'Eye Exam',
    type: 'Examination',
    provider: 'Dr. John Bo, OD',
    location: 'Clear Vision Optometry, 654 Sight Blvd.',
    notes: 'Annual eye examination, bring current glasses',
    detailsPath: '/appointments/appt-5',
    completed: true,
  },
  {
    id: 'appt-6',
    date: new Date(2025, 0, 10, 11, 0), // Jan 10, 2025, 11:00 AM
    title: 'Dermatology Check',
    type: 'Examination',
    provider: 'Dr. Robert Lee',
    location: 'Pacific Dermatology Center',
    notes: 'Annual skin cancer screening',
    detailsPath: '/appointments/appt-6',
    completed: true,
  },
  {
    id: 'appt-7',
    date: new Date(2025, 1, 15, 9, 30), // Feb 15, 2025, 9:30 AM
    title: 'Mammogram',
    type: 'Examination',
    provider: 'Dr. Maria Rodriguez',
    location: "Women's Imaging Center, 987 Health Pkwy.",
    notes: 'Annual breast cancer screening',
    detailsPath: '/appointments/appt-7',
    completed: true,
  },
  {
    id: 'appt-8',
    date: new Date(2025, 2, 22, 14, 0), // Mar 22, 2025, 2:00 PM
    title: 'Therapy Session',
    type: 'Consultation',
    provider: 'Dr. Emily Watson, PhD',
    location: 'Mind Wellness Center, 543 Calm St.',
    notes: 'Monthly therapy session',
    detailsPath: '/appointments/appt-8',
    completed: true,
  },
  {
    id: 'appt-9',
    date: new Date(2025, 3, 12, 10, 15), // Apr 12, 2025, 10:15 AM
    title: 'Allergist Consultation',
    type: 'Consultation',
    provider: 'Dr. Alan Park',
    location: 'Allergy & Asthma Specialists, 876 Respiratory Rd.',
    notes: 'Seasonal allergy management',
    detailsPath: '/appointments/appt-9',
    completed: true,
  },
  {
    id: 'appt-10',
    date: new Date(2025, 4, 20, 11, 30), // May 20, 2025, 11:30 AM
    title: 'Physical Therapy',
    type: 'Treatment',
    provider: 'Markus Jonsson, PT',
    location: 'Rehabilitation Center, 456 Wellness Ave.',
    notes: 'Follow-up session for shoulder therapy',
    detailsPath: '/appointments/appt-10',
    completed: true,
  },
  {
    id: 'appt-11',
    date: new Date(2025, 5, 8, 13, 45), // Jun 8, 2025, 1:45 PM
    title: 'Dental Filling',
    type: 'Treatment',
    provider: 'Dr. Lisa Johnson, DDS',
    location: 'Smile Dental, 321 Tooth Ln.',
    notes: 'Filling for cavity on lower right molar',
    detailsPath: '/appointments/appt-11',
    completed: true,
  },
  {
    id: 'appt-12',
    date: new Date(2025, 6, 15, 9, 0), // Jul 15, 2025, 9:00 AM
    title: 'Blood Work',
    type: 'Examination',
    provider: 'HealthFirst Labs',
    location: 'HealthFirst Labs, 789 Test Blvd.',
    notes: 'Fasting required for 12 hours prior',
    detailsPath: '/appointments/appt-12',
    completed: true,
  },
  {
    id: 'appt-13',
    date: new Date(2025, 7, 5, 10, 30), // Aug 5, 2025, 10:30 AM
    title: 'Cardiology Check-up',
    type: 'Examination',
    provider: 'Dr. James Wilson',
    location: 'Heart Center, 432 Pulse Ave.',
    notes: 'Annual heart health check-up',
    detailsPath: '/appointments/appt-13',
    completed: true,
  },
  {
    id: 'appt-14',
    date: new Date(2025, 8, 18, 15, 0), // Sep 18, 2025, 3:00 PM
    title: 'Therapy Session',
    type: 'Consultation',
    provider: 'Dr. Emily Watson, PhD',
    location: 'Mind Wellness Center, 543 Calm St.',
    notes: 'Monthly therapy session',
    detailsPath: '/appointments/appt-14',
    completed: true,
  },
  {
    id: 'appt-15',
    date: new Date(2025, 9, 25, 8, 30), // Oct 25, 2025, 8:30 AM
    title: 'Flu Shot',
    type: 'Treatment',
    provider: 'Dr. Michael Chen',
    location: 'Primary Care Clinic, 123 Health St.',
    notes: 'Annual flu vaccination',
    detailsPath: '/appointments/appt-15',
    completed: true,
  },
  {
    id: 'appt-16',
    date: new Date(2025, 10, 13, 11, 0), // Nov 13, 2025, 11:00 AM
    title: 'Dermatology Follow-up',
    type: 'Examination',
    provider: 'Dr. Robert Lee',
    location: 'Pacific Dermatology Center',
    notes: 'Follow-up for skin condition',
    detailsPath: '/appointments/appt-16',
    completed: true,
  },
  {
    id: 'appt-17',
    date: new Date(2025, 11, 7, 14, 15), // Dec 7, 2025, 2:15 PM
    title: 'Physical Therapy',
    type: 'Treatment',
    provider: 'Markus Jonsson, PT',
    location: 'Rehabilitation Center, 456 Wellness Ave.',
    notes: 'Final session for shoulder therapy',
    detailsPath: '/appointments/appt-17',
    completed: true,
  },
  // Upcoming appointments (not completed)
  {
    id: 'appt-18',
    date: new Date(2026, 0, 10, 9, 0), // Jan 10, 2026, 9:00 AM
    title: 'Annual Physical',
    type: 'Examination',
    provider: 'Dr. Michael Chen',
    location: 'Primary Care Clinic, 123 Health St.',
    notes: 'Yearly physical examination, fasting required',
    detailsPath: '/appointments/appt-18',
    completed: false,
  },
  {
    id: 'appt-19',
    date: new Date(2026, 1, 20, 13, 0), // Feb 20, 2026, 1:00 PM
    title: 'Dental Cleaning',
    type: 'Treatment',
    provider: 'Dr. Lisa Johnson, DDS',
    location: 'Smile Dental, 321 Tooth Ln.',
    notes: 'Routine cleaning and check-up',
    detailsPath: '/appointments/appt-19',
    completed: false,
  },
];

export const upcomingScreenings: ScreeningRecommendation[] = [
  {
    id: 'annual-physical',
    title: 'Annual Physical',
    description: 'Comprehensive examination',
    icon: 'FaUserMd',
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-100',
    status: 'due',
    statusText: 'Due in 2 months',
    schedulePath: '/appointments/new?screening=annual-physical',
    friendRecommendations: [
      {
        friendName: 'Jessica Miller',
        providerName: 'Dr. Michael Chen',
        rating: 5,
        comment: 'Great doctor, very thorough and takes time to explain everything.',
      },
    ],
  },
  {
    id: 'cervical-cancer',
    title: 'Cervical Cancer (Pap)',
    description: 'Screening test',
    icon: 'FaClipboardCheck',
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100',
    status: 'overdue',
    statusText: 'Overdue',
    schedulePath: '/appointments/new?screening=cervical-cancer',
    friendRecommendations: [
      {
        friendName: 'Lisa Thompson',
        providerName: 'Dr. Sarah Williams',
        rating: 4,
        comment: 'Very professional and gentle. The office staff is also wonderful.',
      },
    ],
  },
  {
    id: 'skin-cancer',
    title: 'Skin Cancer Check',
    description: 'Full-body examination',
    icon: 'FaSearch',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    status: 'completed',
    statusText: 'Completed',
    schedulePath: '/appointments/new?screening=skin-cancer',
    detailsPath: '/screenings/skin-cancer',
    previousResults: [
      {
        date: 'April 3, 2023',
        provider: 'Dr. Robert Lee, Dermatologist',
        result: 'abnormal',
        notes:
          'Suspicious mole on upper back was biopsied. Follow-up revealed benign lesion. Recommend annual skin checks with more frequent monitoring of the site.',
        providerDetails: {
          name: 'Dr. Robert Lee',
          specialty: 'Dermatology',
          clinic: 'Pacific Dermatology Center',
          address: '2234 Market Street, Suite 301, San Francisco, CA 94114',
          phone: '(415) 555-3456',
          email: 'appointments@pacificdermatology.com',
          website: 'www.pacificdermatology.com',
        },
      },
      {
        date: 'April 18, 2022',
        provider: 'Dr. Robert Lee, Dermatologist',
        result: 'clear',
        notes:
          'No suspicious lesions identified. Continue using sunscreen and monitoring for any changes in moles.',
        providerDetails: {
          name: 'Dr. Robert Lee',
          specialty: 'Dermatology',
          clinic: 'Pacific Dermatology Center',
          address: '2234 Market Street, Suite 301, San Francisco, CA 94114',
          phone: '(415) 555-3456',
          email: 'appointments@pacificdermatology.com',
          website: 'www.pacificdermatology.com',
        },
      },
    ],
    friendRecommendations: [],
  },
  {
    id: 'breast-exam',
    title: 'Breast Exam (Clinical)',
    description: 'Physical examination',
    icon: 'FaHeartbeat',
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100',
    status: 'completed',
    statusText: 'Completed',
    schedulePath: '/appointments/new?screening=breast-exam',
    detailsPath: '/screenings/breast-exam',
    previousResults: [
      {
        date: 'March 15, 2023',
        provider: 'Dr. Emily Johnson',
        result: 'clear',
        notes: 'No abnormalities detected. Next examination recommended in 12 months.',
        providerDetails: {
          name: 'Dr. Emily Johnson',
          specialty: 'OB/GYN',
          clinic: "Women's Health Associates",
          address: '850 Health Way, Suite 200, San Francisco, CA 94107',
          phone: '(415) 555-2121',
          email: 'info@womenshealthsf.com',
          website: 'www.womenshealthsf.com',
        },
      },
      {
        date: 'February 22, 2022',
        provider: 'Dr. Emily Johnson',
        result: 'clear',
        notes: 'No concerning findings.',
        providerDetails: {
          name: 'Dr. Emily Johnson',
          specialty: 'OB/GYN',
          clinic: "Women's Health Associates",
          address: '850 Health Way, Suite 200, San Francisco, CA 94107',
          phone: '(415) 555-2121',
          email: 'info@womenshealthsf.com',
          website: 'www.womenshealthsf.com',
        },
      },
    ],
    friendRecommendations: [],
  },
];

export const futureScreenings: ScreeningRecommendation[] = [
  {
    id: 'mammogram',
    title: 'Mammogram',
    description: 'Breast cancer screening',
    icon: 'FaHeartbeat',
    iconColor: 'text-pink-600',
    bgColor: 'bg-pink-100',
    status: 'upcoming',
    statusText: 'Due in 2 years (age 40)',
    schedulePath: '/appointments/new?screening=mammogram',
    friendRecommendations: [],
  },
  {
    id: 'colonoscopy',
    title: 'Colonoscopy',
    description: 'Colon cancer screening',
    icon: 'FaUserMd',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    status: 'upcoming',
    statusText: 'Due in 7 years (age 45)',
    schedulePath: '/appointments/new?screening=colonoscopy',
    friendRecommendations: [
      {
        friendName: 'Tom Johnson',
        providerName: 'Dr. Robert Garcia',
        rating: 5,
        comment:
          'The prep is the worst part, but Dr. Garcia made the procedure as comfortable as possible.',
      },
    ],
  },
  {
    id: 'cholesterol',
    title: 'Cholesterol Screening',
    description: 'Lipid profile test',
    icon: 'FaClipboardCheck',
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100',
    status: 'upcoming',
    statusText: 'Due in 3 years',
    schedulePath: '/appointments/new?screening=cholesterol',
    friendRecommendations: [
      {
        friendName: 'Emma Davis',
        providerName: 'Dr. James Wilson',
        rating: 5,
        comment: 'The lab is very efficient and Dr. Wilson explained all the results thoroughly.',
      },
      {
        friendName: 'Kevin Brown',
        providerName: 'HealthFirst Labs',
        rating: 4,
        comment: 'Quick service and they have multiple locations around the city.',
      },
    ],
  },
];

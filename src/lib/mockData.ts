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

import { GuidelineResource, RiskAssessmentTool } from '../app/components/GuidelineDetail';
import { GuidelineItem } from '../app/components/PersonalizedGuidelines';

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
  guidelineId?: string;
  archived?: boolean;
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
  provider: {
    id: string;
    name: string;
    specialty?: string;
  };
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
  // Additional fields for tooltip display
  description?: string;
  startTime?: string;
  endTime?: string;
  doctor?: string;
  result?: {
    status: string;
    notes: string;
    date: string;
  };
}

// Create appointments for the calendar view
export const appointments: Appointment[] = [
  // Previous appointments (before May 12, 2025)
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
    result: {
      status: 'clear',
      notes:
        'All tests within normal range. Blood pressure: 120/75. Cholesterol: 180mg/dL. Blood glucose: 90mg/dL. Continue regular exercise and balanced diet. Next check-up in 12 months.',
      date: '2025-01-04',
    },
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
    result: {
      status: 'clear',
      notes:
        'Good progress on shoulder mobility. Range of motion improved by 15 degrees. Continue home exercises 3x daily. Follow-up in 1 month.',
      date: '2025-01-04',
    },
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
    result: {
      status: 'abnormal',
      notes:
        'Slightly elevated hormone levels. Additional blood work ordered. Schedule follow-up in 3 months. Adjust medication dosage as discussed.',
      date: '2025-01-04',
    },
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
    result: {
      status: 'clear',
      notes:
        'No cavities found. Gums healthy. Professional cleaning completed. Continue brushing twice daily and flossing. Next cleaning in 6 months.',
      date: '2025-01-07',
    },
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
    result: {
      status: 'followup',
      notes:
        'Slight change in prescription. Small increase in astigmatism in left eye. New glasses or contacts recommended. Follow up next year.',
      date: '2025-01-07',
    },
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
    result: {
      status: 'clear',
      notes:
        'No suspicious moles or lesions found. Skin appears healthy. Continue using SPF 30+ sunscreen daily. Next screening in 12 months.',
      date: '2025-01-10',
    },
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
    result: {
      status: 'abnormal',
      notes:
        'Dense breast tissue noted. Additional ultrasound recommended for complete evaluation. Schedule follow-up ultrasound within 2 weeks.',
      date: '2025-02-15',
    },
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
    result: {
      status: 'clear',
      notes:
        'Discussed work-related stress management techniques and progress with mindfulness practice. Continue daily mindfulness exercises. Next session in 4 weeks.',
      date: '2025-03-22',
    },
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
    result: {
      status: 'abnormal',
      notes:
        'New allergens identified: birch pollen and cat dander. Allergy testing completed. Start prescribed antihistamine. Consider immunotherapy for long-term management.',
      date: '2025-04-12',
    },
  },
  {
    id: 'appt-10',
    date: new Date(2025, 4, 7, 11, 30), // May 7, 2025, 11:30 AM
    title: 'Physical Therapy',
    type: 'Treatment',
    provider: 'Markus Jonsson, PT',
    location: 'Rehabilitation Center, 456 Wellness Ave.',
    notes: 'Follow-up session for shoulder therapy',
    detailsPath: '/appointments/appt-10',
    completed: true,
    result: {
      status: 'clear',
      notes:
        'Significant improvement in shoulder mobility and strength. Completed full exercise regimen. Continue home exercises. Final follow-up in one month.',
      date: '2025-05-07',
    },
  },
  // After today (May 12, 2025) appointments should not be completed
  {
    id: 'appt-11',
    date: new Date(2025, 5, 8, 13, 45), // Jun 8, 2025, 1:45 PM
    title: 'Dental Filling',
    type: 'Treatment',
    provider: 'Dr. Lisa Johnson, DDS',
    location: 'Smile Dental, 321 Tooth Ln.',
    notes: 'Filling for cavity on lower right molar',
    detailsPath: '/appointments/appt-11',
    completed: false,
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
    completed: false,
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
    completed: false,
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
    completed: false,
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
    completed: false,
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
    completed: false,
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
    id: 'mammogram',
    title: 'Breast Cancer Screening',
    description: 'Mammography and clinical breast exams for early detection',
    icon: 'FaHeartbeat',
    iconColor: 'text-pink-600',
    bgColor: 'bg-pink-100',
    status: 'completed',
    statusText: 'Completed',
    schedulePath: '/appointments/new?screening=mammogram',
    detailsPath: '/screenings/mammogram',
    previousResults: [
      {
        date: 'February 15, 2025',
        provider: {
          id: 'Dr. Maria Rodriguez',
          name: 'Dr. Maria Rodriguez',
          specialty: 'Radiology',
        },
        result: 'abnormal',
        notes:
          'Dense breast tissue noted. Additional ultrasound recommended for complete evaluation. Schedule follow-up ultrasound within 2 weeks.',
        providerDetails: {
          name: 'Dr. Maria Rodriguez',
          specialty: 'Radiology',
          clinic: "Women's Imaging Center",
          address: '987 Health Parkway, San Francisco, CA 94115',
          phone: '(415) 555-9876',
          email: 'appointments@womensimaging.com',
          website: 'www.womensimaging.com',
        },
      },
      {
        date: 'February 10, 2024',
        provider: {
          id: 'Dr. Maria Rodriguez',
          name: 'Dr. Maria Rodriguez',
          specialty: 'Radiology',
        },
        result: 'clear',
        notes: 'No concerning findings. Dense breast tissue noted. Continue annual screening.',
        providerDetails: {
          name: 'Dr. Maria Rodriguez',
          specialty: 'Radiology',
          clinic: "Women's Imaging Center",
          address: '987 Health Parkway, San Francisco, CA 94115',
          phone: '(415) 555-9876',
          email: 'appointments@womensimaging.com',
          website: 'www.womensimaging.com',
        },
      },
      {
        date: 'February 3, 2023',
        provider: {
          id: 'Dr. Maria Rodriguez',
          name: 'Dr. Maria Rodriguez',
          specialty: 'Radiology',
        },
        result: 'clear',
        notes:
          'No abnormalities detected. Dense breast tissue noted. Next mammogram recommended in 12 months.',
        providerDetails: {
          name: 'Dr. Maria Rodriguez',
          specialty: 'Radiology',
          clinic: "Women's Imaging Center",
          address: '987 Health Parkway, San Francisco, CA 94115',
          phone: '(415) 555-9876',
          email: 'appointments@womensimaging.com',
          website: 'www.womensimaging.com',
        },
      },
    ],
    friendRecommendations: [],
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
        provider: {
          id: 'Dr. Robert Lee, Dermatologist',
          name: 'Dr. Robert Lee',
          specialty: 'Dermatology',
        },
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
        provider: {
          id: 'Dr. Robert Lee, Dermatologist',
          name: 'Dr. Robert Lee',
          specialty: 'Dermatology',
        },
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
        provider: {
          id: 'Dr. Emily Johnson',
          name: 'Dr. Emily Johnson',
          specialty: 'OB/GYN',
        },
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
        provider: {
          id: 'Dr. Emily Johnson',
          name: 'Dr. Emily Johnson',
          specialty: 'OB/GYN',
        },
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

export const mockGuidelines: GuidelineItem[] = [
  {
    id: '1',
    name: 'Colorectal Cancer Screening',
    description: 'Screening for colorectal cancer using various testing methods',
    frequency: 'Varies by age',
    ageRanges: [
      {
        min: 45,
        max: 49,
        label: '45-49',
        frequency: 'Every 1-3 years with FIT or other stool-based test',
        frequencyMonths: 12, // Annual minimum
        frequencyMonthsMax: 36, // Up to every 3 years
        notes: 'Starting at age 45 for average risk individuals',
      },
      {
        min: 50,
        max: 75,
        label: '50-75',
        frequency: 'Every 10 years with colonoscopy, or other methods at different intervals',
        frequencyMonths: 12, // Annual for FIT
        frequencyMonthsMax: 120, // Up to 10 years for colonoscopy
        notes: 'High risk individuals may need more frequent screening',
      },
      {
        min: 76,
        max: 85,
        label: '76-85',
        frequency: 'Based on individual health status and screening history',
        frequencyMonths: 12, // Minimum annual for high risk
        frequencyMonthsMax: 120, // Up to 10 years for low risk
        notes: 'Decision should be made with healthcare provider',
      },
    ],
    genders: ['all'],
    category: 'Cancer Screening',
    visibility: 'public',
    createdBy: 'system',
    resources: [
      {
        name: 'Colorectal Cancer Risk Assessment Tool',
        url: 'https://ccrisktool.cancer.gov/',
        description: 'Estimates 5-year, 10-year, and lifetime risk of developing colorectal cancer',
        type: 'risk',
      },
      {
        name: 'QCancer® Colorectal',
        url: 'https://qcancer.org/colorectal/',
        description:
          'Calculates risk of developing colorectal cancer within the next 10 years based on risk factors',
        type: 'risk',
      },
      {
        name: 'USPSTF Colorectal Cancer Screening Recommendations',
        url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening',
        description: 'Evidence-based recommendations for colorectal cancer screening',
        type: 'resource',
      },
      {
        name: 'Colorectal Cancer Screening Guidelines',
        url: 'https://www.cancer.org/cancer/colon-rectal-cancer/detection-diagnosis-staging/acs-recommendations.html',
        description: 'Guidelines for early detection of colorectal cancer and polyps',
        type: 'resource',
      },
      {
        name: 'Colorectal Cancer Screening Tests',
        url: 'https://www.cdc.gov/cancer/colorectal/basic_info/screening/tests.htm',
        description: 'Information about different types of colorectal cancer screening tests',
        type: 'resource',
      },
      {
        name: 'Screening Information for Patients',
        url: 'https://www.ccalliance.org/screening-prevention/screening-methods',
        description: 'Patient-friendly information about colorectal cancer screening options',
        type: 'resource',
      },
    ],
  },
  {
    id: '2',
    name: 'Breast Cancer Screening',
    description: 'Mammography and clinical breast exams for early detection',
    frequency: 'Varies by age',
    ageRanges: [
      {
        min: 25,
        max: 39,
        label: '25-39',
        frequency: 'Clinical breast exam every 1-3 years',
        frequencyMonths: 12, // Annual minimum
        frequencyMonthsMax: 36, // Up to every 3 years
        notes: 'For women at average risk',
      },
      {
        min: 40,
        max: 44,
        label: '40-44',
        frequency: 'Optional annual mammogram',
        frequencyMonths: 12, // Annual
        notes: 'Consider individual risk factors and preferences',
      },
      {
        min: 45,
        max: 54,
        label: '45-54',
        frequency: 'Annual mammogram recommended',
        frequencyMonths: 12, // Annual
        notes: 'More frequent screening for high-risk individuals',
      },
      {
        min: 55,
        max: 74,
        label: '55-74',
        frequency: 'Mammogram every 1-2 years',
        frequencyMonths: 12, // Annual minimum
        frequencyMonthsMax: 24, // Up to every 2 years
        notes: 'Based on individual preferences and risk factors',
      },
      {
        min: 75,
        max: null,
        label: '75+',
        frequency: 'Based on overall health and life expectancy',
        frequencyMonths: 12, // Annual minimum if continuing screening
        frequencyMonthsMax: 24, // Up to every 2 years
        notes: 'Consult with healthcare provider',
      },
    ],
    genders: ['female'],
    category: 'Cancer Screening',
    visibility: 'public',
    createdBy: 'system',
    resources: [
      {
        name: 'Breast Cancer Risk Assessment Tool (Gail Model)',
        url: 'https://bcrisktool.cancer.gov/',
        description:
          "Estimates a woman's risk of developing invasive breast cancer over the next 5 years and up to age 90",
        type: 'risk',
      },
      {
        name: 'IBIS Breast Cancer Risk Evaluation Tool',
        url: 'https://www.ems-trials.org/riskevaluator/',
        description:
          'Calculates the likelihood of developing breast cancer based on family history, reproductive factors, and other risk factors',
        type: 'risk',
      },
      {
        name: 'Breast Cancer Surveillance Consortium Risk Calculator',
        url: 'https://tools.bcsc-scc.org/BC5yearRisk/calculator.htm',
        description:
          'Estimates 5-year and 10-year risk of invasive breast cancer based on demographic factors and breast density',
        type: 'risk',
      },
      {
        name: 'ACR Breast Cancer Screening Guidelines',
        url: 'https://www.acr.org/Clinical-Resources/Breast-Imaging-Resources/Breast-Cancer-Screening-Resources',
        description: 'Detailed screening recommendations from the American College of Radiology',
        type: 'resource',
      },
      {
        name: 'Breast Cancer Information for Patients',
        url: 'https://www.komen.org/breast-cancer/',
        description:
          'Educational resources about breast cancer detection, diagnosis, and treatment',
        type: 'resource',
      },
      {
        name: 'Breast Cancer: What You Need to Know',
        url: 'https://www.cdc.gov/cancer/breast/basic_info/index.htm',
        description: 'Basic information about breast cancer, screening, and risk factors',
        type: 'resource',
      },
      {
        name: 'Breast-Cancer Screening — Viewpoint of the IARC Working Group',
        url: 'https://www.nejm.org/doi/full/10.1056/NEJMsr1504363',
        description: 'Research paper on current evidence for breast cancer screening effectiveness',
        type: 'resource',
      },
    ],
  },
  {
    id: '3',
    name: 'Cervical Cancer Screening (Pap test)',
    description: 'Screening test for cervical cancer and HPV',
    frequency: 'Varies by age',
    ageRanges: [
      {
        min: 21,
        max: 29,
        label: '21-29',
        frequency: 'Every 3 years with Pap test alone',
        frequencyMonths: 36, // Every 3 years
        notes: 'HPV testing not recommended in this age group',
      },
      {
        min: 30,
        max: 65,
        label: '30-65',
        frequency:
          'Every 5 years with HPV and Pap co-testing, or every 3 years with Pap test alone',
        frequencyMonths: 36, // Every 3 years minimum with Pap alone
        frequencyMonthsMax: 60, // Up to every 5 years with co-testing
        notes: 'HPV testing alone every 5 years is also an option',
      },
      {
        min: 66,
        max: null,
        label: '66+',
        frequency: 'No screening needed after adequate prior screening',
        notes: 'If history of normal results and no high risk factors',
      },
    ],
    genders: ['female'],
    category: 'Cancer Screening',
    visibility: 'public',
    createdBy: 'system',
    resources: [
      {
        name: 'Cervical Cancer Risk Assessment Tool',
        url: 'https://cervicalcancerrisk.org/',
        description: 'Evaluates risk based on HPV status, screening history, and other factors',
        type: 'risk',
      },
      {
        name: 'ACOG Cervical Cancer Screening Guidelines',
        url: 'https://www.acog.org/clinical/clinical-guidance/practice-advisory/articles/2021/04/updated-cervical-cancer-screening-guidelines',
        description: 'Clinical guidance for cervical cancer screening and management',
        type: 'resource',
      },
      {
        name: 'Cervical Cancer Screening (PDQ®)–Patient Version',
        url: 'https://www.cancer.gov/types/cervical/patient/cervical-screening-pdq',
        description: 'Information about cervical cancer screening for patients',
        type: 'resource',
      },
      {
        name: 'WHO Guidelines for Screening and Treatment of Cervical Pre-Cancer Lesions',
        url: 'https://www.who.int/publications/i/item/9789240030824',
        description: 'Global recommendations for cervical cancer prevention',
        type: 'resource',
      },
    ],
  },
  {
    id: '4',
    name: 'Prostate Cancer Screening',
    description: 'PSA blood test and digital rectal exam',
    frequency: 'Varies by age and risk factors',
    ageRanges: [
      {
        min: 40,
        max: 44,
        label: '40-44',
        frequency: 'Consider baseline screening for high-risk men',
        frequencyMonths: 12, // Annual for high-risk
        notes: 'Including African American men and those with family history',
      },
      {
        min: 45,
        max: 49,
        label: '45-49',
        frequency: 'Consider screening for high-risk men',
        frequencyMonths: 12, // Annual for high-risk
        notes: 'Discuss benefits and risks with healthcare provider',
      },
      {
        min: 50,
        max: 69,
        label: '50-69',
        frequency: 'Consider screening every 1-2 years',
        frequencyMonths: 12, // Annual minimum
        frequencyMonthsMax: 24, // Up to every 2 years
        notes: 'Based on PSA levels and individual risk assessment',
      },
      {
        min: 70,
        max: null,
        label: '70+',
        frequency: 'Individualized decision based on health status',
        frequencyMonths: 24, // Every 2 years if continuing screening
        notes: 'Limited benefit for men with less than 10-15 year life expectancy',
      },
    ],
    genders: ['male'],
    category: 'Cancer Screening',
    visibility: 'public',
    createdBy: 'system',
    resources: [
      {
        name: 'Prostate Cancer Prevention Trial Risk Calculator',
        url: 'https://riskcalc.org/PCPTRC/',
        description:
          'Estimates risk of prostate cancer and high-grade disease based on PSA levels and other factors',
        type: 'risk',
      },
      {
        name: 'PBCG Prostate Cancer Risk Calculator',
        url: 'https://riskcalc.org/PBCG/',
        description: 'Incorporates family history, race, and PSA to estimate prostate cancer risk',
        type: 'risk',
      },
      {
        name: 'AUA PSA Screening Guidelines',
        url: 'https://www.auanet.org/guidelines/guidelines/prostate-cancer-early-detection-guideline',
        description: 'Clinical guidelines for prostate cancer screening',
        type: 'resource',
      },
      {
        name: 'Prostate Cancer Screening for Patients',
        url: 'https://www.pcf.org/about-prostate-cancer/screening-early-detection/',
        description: 'Information about prostate cancer screening options and decision-making',
        type: 'resource',
      },
      {
        name: 'Screening for Prostate Cancer: USPSTF Recommendation Statement',
        url: 'https://www.nejm.org/doi/full/10.1056/NEJMsr1804988',
        description: 'Research and evidence for prostate cancer screening recommendations',
        type: 'resource',
      },
    ],
  },
  {
    id: '5',
    name: 'Skin Cancer Screening',
    description: 'Full body skin examination',
    frequency: 'Annual',
    frequencyMonths: 12, // Annual
    ageRanges: [{ min: 20, max: null, label: '20+' }],
    genders: ['all'],
    category: 'Cancer Screening',
    visibility: 'public',
    createdBy: 'system',
    resources: [
      {
        name: 'Melanoma Risk Assessment Tool',
        url: 'https://mrisktool.cancer.gov/',
        description:
          'Estimates 5-year risk of melanoma based on skin characteristics and sun exposure',
        type: 'risk',
      },
      {
        name: 'AAD Skin Cancer Screening Guidelines',
        url: 'https://www.aad.org/public/diseases/skin-cancer/find-skin-cancer-early',
        description: 'Professional guidelines for skin cancer screening and prevention',
        type: 'resource',
      },
      {
        name: 'Skin Cancer Prevention Guidelines',
        url: 'https://www.skincancer.org/early-detection/',
        description: 'Information for patients about preventing skin cancer and self-examination',
        type: 'resource',
      },
    ],
  },
  {
    id: '6',
    name: 'Cholesterol Screening',
    description: 'Lipid profile to check cholesterol levels',
    frequency: 'Varies by age and risk factors',
    ageRanges: [
      {
        min: 20,
        max: 39,
        label: '20-39',
        frequency: 'Every 4-6 years for those at average risk',
        frequencyMonths: 48, // Every 4 years minimum
        frequencyMonthsMax: 72, // Up to every 6 years
        notes: 'More frequent for those with cardiovascular risk factors',
      },
      {
        min: 40,
        max: 75,
        label: '40-75',
        frequency: 'Every 1-2 years',
        frequencyMonths: 12, // Annual minimum
        frequencyMonthsMax: 24, // Up to every 2 years
        notes: 'May be more frequent based on risk factors and previous results',
      },
      {
        min: 76,
        max: null,
        label: '76+',
        frequency: 'Individualized based on health status',
        frequencyMonths: 12, // Annual minimum if continuing screening
        frequencyMonthsMax: 24, // Up to every 2 years
        notes: 'Discuss with healthcare provider',
      },
    ],
    genders: ['all'],
    category: 'Cardiovascular Health',
    visibility: 'public',
    createdBy: 'system',
    resources: [
      {
        name: 'ASCVD Risk Estimator Plus',
        url: 'https://tools.acc.org/ascvd-risk-estimator-plus',
        description:
          'Calculates 10-year risk of heart disease or stroke using the Pooled Cohort Equations',
        type: 'risk',
      },
      {
        name: 'Framingham Heart Study Risk Score',
        url: 'https://framinghamheartstudy.org/fhs-risk-functions/cardiovascular-disease-10-year-risk/',
        description:
          'Predicts 10-year cardiovascular disease risk based on the Framingham Heart Study',
        type: 'risk',
      },
      {
        name: 'ACC/AHA Cardiovascular Risk Assessment Guidelines',
        url: 'https://www.acc.org/Guidelines/About-Guidelines-and-Clinical-Documents/Guidelines-and-Documents-Search#q=risk%20assessment&sort=relevancy',
        description: 'Clinical practice guidelines for cardiovascular risk assessment',
        type: 'resource',
      },
      {
        name: 'Heart Disease Risk Factors',
        url: 'https://www.heart.org/en/health-topics/heart-attack/understand-your-risks-to-prevent-a-heart-attack',
        description: 'Information about heart disease risk factors and prevention',
        type: 'resource',
      },
    ],
  },
  {
    id: '7',
    name: 'Blood Pressure Screening',
    description: 'Measurement of blood pressure',
    frequency: 'Annual, or more frequently based on readings',
    frequencyMonths: 12, // Annual minimum
    ageRanges: [{ min: 18, max: null, label: '18+' }],
    genders: ['all'],
    category: 'Cardiovascular Health',
    visibility: 'public',
    createdBy: 'system',
    resources: [
      {
        name: 'ASCVD Risk Estimator Plus',
        url: 'https://tools.acc.org/ascvd-risk-estimator-plus',
        description:
          'Calculates 10-year risk of heart disease or stroke using the Pooled Cohort Equations',
        type: 'risk',
      },
      {
        name: 'Framingham Heart Study Risk Score',
        url: 'https://framinghamheartstudy.org/fhs-risk-functions/cardiovascular-disease-10-year-risk/',
        description:
          'Predicts 10-year cardiovascular disease risk based on the Framingham Heart Study',
        type: 'risk',
      },
      {
        name: 'ACC/AHA Cardiovascular Risk Assessment Guidelines',
        url: 'https://www.acc.org/Guidelines/About-Guidelines-and-Clinical-Documents/Guidelines-and-Documents-Search#q=risk%20assessment&sort=relevancy',
        description: 'Clinical practice guidelines for cardiovascular risk assessment',
        type: 'resource',
      },
      {
        name: 'Heart Disease Risk Factors',
        url: 'https://www.heart.org/en/health-topics/heart-attack/understand-your-risks-to-prevent-a-heart-attack',
        description: 'Information about heart disease risk factors and prevention',
        type: 'resource',
      },
    ],
  },
  {
    id: '8',
    name: 'Lung Cancer Screening',
    description: 'Low-dose CT scan',
    frequency: 'Annual',
    frequencyMonths: 12, // Annual
    ageRanges: [
      {
        min: 50,
        max: 80,
        label: '50-80',
        frequency: 'Annual for current smokers or those who quit within past 15 years',
        frequencyMonths: 12, // Annual
        notes: 'With at least a 20 pack-year smoking history',
      },
    ],
    genders: ['all'],
    category: 'Cancer Screening',
    visibility: 'public',
    createdBy: 'system',
    resources: [
      {
        name: 'PLCO Lung Cancer Screening Tool',
        url: 'https://www.shouldiscreen.com/lung-cancer-risk-calculator',
        description:
          'Helps determine who should get screening based on smoking history and other risk factors',
        type: 'risk',
      },
      {
        name: 'ATS/CHEST Lung Cancer Screening Guidelines',
        url: 'https://www.thoracic.org/statements/resources/lcod/lung-cancer-screening.pdf',
        description: 'Professional guidelines for lung cancer screening with low-dose CT',
        type: 'resource',
      },
      {
        name: 'Lung Cancer Screening Information',
        url: 'https://www.lungevity.org/for-patients-caregivers/lung-cancer-101/lung-cancer-screening',
        description:
          'Patient-friendly information about lung cancer screening eligibility and process',
        type: 'resource',
      },
    ],
  },
  {
    id: '9',
    name: 'Diabetes Screening',
    description: 'Blood tests to measure glucose levels',
    frequency: 'Every 3 years, more frequently with risk factors',
    frequencyMonths: 12, // Annual minimum with risk factors
    frequencyMonthsMax: 36, // Up to every 3 years for normal weight
    ageRanges: [
      {
        min: 35,
        max: 70,
        label: '35-70',
        frequency: 'Every 3 years for those with normal weight',
        frequencyMonths: 12, // Annual minimum with risk factors
        frequencyMonthsMax: 36, // Up to every 3 years
        notes: 'More frequently with overweight/obesity or other risk factors',
      },
    ],
    genders: ['all'],
    category: 'Metabolic Health',
    visibility: 'public',
    createdBy: 'system',
    resources: [
      {
        name: 'Type 2 Diabetes Risk Test',
        url: 'https://diabetes.org/risk-test',
        description:
          'Assesses risk for developing type 2 diabetes based on lifestyle and personal factors',
        type: 'risk',
      },
      {
        name: 'ADA Standards of Medical Care in Diabetes',
        url: 'https://diabetesjournals.org/care/issue/46/Supplement_1',
        description: 'Comprehensive guidelines for diabetes screening and management',
        type: 'resource',
      },
      {
        name: 'Diabetes Risk Test and Prevention',
        url: 'https://www.cdc.gov/diabetes/prevention/index.html',
        description: 'Information about diabetes prevention and risk assessment',
        type: 'resource',
      },
    ],
  },
];

// Helper function to get tools and resources for a specific guideline
export const getToolsAndResourcesForGuideline = (guidelineId: string) => {
  const guideline = mockGuidelines.find((g) => g.id === guidelineId);

  if (!guideline) {
    return {
      tools: [],
      resources: [],
    };
  }

  // Convert risk resources to RiskAssessmentTool format
  const tools: RiskAssessmentTool[] =
    guideline.resources
      ?.filter((r) => r.type === 'risk')
      .map((r) => ({
        id: r.name.toLowerCase().replace(/\s+/g, '-'),
        name: r.name,
        description: r.description || '',
        url: r.url,
        organization: r.name.includes('ASCVD')
          ? 'American College of Cardiology'
          : r.name.includes('Framingham')
            ? 'Framingham Heart Study'
            : r.name.includes('Breast Cancer')
              ? 'National Cancer Institute'
              : r.name.includes('Diabetes')
                ? 'American Diabetes Association'
                : r.name.includes('Melanoma')
                  ? 'National Cancer Institute'
                  : r.name.includes('Prostate')
                    ? 'Fred Hutchinson Cancer Research Center'
                    : r.name.includes('PLCO')
                      ? 'National Cancer Institute'
                      : r.name.includes('Cervical')
                        ? 'American Cancer Society'
                        : r.name.includes('Colorectal')
                          ? 'National Cancer Institute'
                          : 'Medical Organization',
      })) || [];

  // Convert resource resources to GuidelineResource format
  const resources: GuidelineResource[] =
    guideline.resources
      ?.filter((r) => r.type === 'resource')
      .map((r) => ({
        id: r.name.toLowerCase().replace(/\s+/g, '-'),
        title: r.name,
        description: r.description || '',
        url: r.url,
        source: r.name.includes('ADA')
          ? 'American Diabetes Association'
          : r.name.includes('CDC')
            ? 'Centers for Disease Control and Prevention'
            : r.name.includes('ACC')
              ? 'American College of Cardiology'
              : r.name.includes('AHA')
                ? 'American Heart Association'
                : r.name.includes('AAD')
                  ? 'American Academy of Dermatology'
                  : r.name.includes('Skin Cancer')
                    ? 'Skin Cancer Foundation'
                    : r.name.includes('AUA')
                      ? 'American Urological Association'
                      : r.name.includes('USPSTF')
                        ? 'U.S. Preventive Services Task Force'
                        : r.name.includes('ACS')
                          ? 'American Cancer Society'
                          : r.name.includes('Lung')
                            ? 'American Thoracic Society'
                            : r.name.includes('ACOG')
                              ? 'American College of Obstetricians and Gynecologists'
                              : r.name.includes('WHO')
                                ? 'World Health Organization'
                                : r.name.includes('Komen')
                                  ? 'Susan G. Komen'
                                  : r.name.includes('ACR')
                                    ? 'American College of Radiology'
                                    : 'Medical Organization',
        type:
          r.name.includes('Patient') || r.name.includes('Information')
            ? 'patient'
            : r.name.includes('Research') || r.name.includes('Study')
              ? 'research'
              : 'professional',
      })) || [];

  return {
    tools,
    resources,
  };
};

export default mockGuidelines;

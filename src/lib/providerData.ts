// Define the Healthcare Provider interface
export interface Provider {
  id: string;
  name: string;
  specialty: string;
  title?: string;
  credentials?: string[];
  clinic: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  acceptingNewPatients: boolean;
  insuranceAccepted?: string;
  languages?: string;
  officeHours?: {
    day: string;
    hours: string;
  }[];
  profileImage?: string;
  bio?: string;
}

// Create a comprehensive list of providers
export const providers: Provider[] = [
  {
    id: 'provider-1',
    name: 'Dr. Michael Chen',
    specialty: 'Internal Medicine',
    title: 'Primary Care Physician',
    credentials: ['MD', 'Board Certified'],
    clinic: 'Primary Care Associates',
    address: '123 Medical Plaza, Suite 300, San Francisco, CA 94107',
    phone: '(555) 123-4567',
    email: 'dr.chen@primarycare.example.com',
    website: 'www.primarycareassociates.example.com',
    acceptingNewPatients: true,
    insuranceAccepted: 'Blue Cross,Aetna,Medicare,United Healthcare',
    languages: 'English,Mandarin',
    officeHours: [
      { day: 'Monday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Wednesday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Thursday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Friday', hours: '9:00 AM - 3:00 PM' },
    ],
    profileImage: '/doctor-avatar.png',
    bio: 'Dr. Chen specializes in preventive care and chronic disease management with over a decade of experience helping patients achieve their health goals.',
  },
  {
    id: 'provider-2',
    name: 'Dr. Sarah Williams',
    specialty: 'OB/GYN',
    title: 'Gynecologist',
    credentials: ['MD', 'FACOG'],
    clinic: "Women's Health Associates",
    address: '850 Health Way, Suite 200, San Francisco, CA 94107',
    phone: '(555) 234-5678',
    email: 'dr.williams@womenshealth.example.com',
    website: 'www.womenshealthsf.example.com',
    acceptingNewPatients: true,
    insuranceAccepted: 'Blue Cross,Aetna,Kaiser,United Healthcare',
    languages: 'English,Spanish',
    officeHours: [
      { day: 'Monday', hours: '8:00 AM - 4:00 PM' },
      { day: 'Tuesday', hours: '10:00 AM - 6:00 PM' },
      { day: 'Wednesday', hours: '8:00 AM - 4:00 PM' },
      { day: 'Thursday', hours: '10:00 AM - 6:00 PM' },
      { day: 'Friday', hours: '8:00 AM - 2:00 PM' },
    ],
    profileImage: '/doctor-avatar.png',
    bio: 'Dr. Williams provides comprehensive women&apos;s health services with a focus on preventive care and reproductive health.',
  },
  {
    id: 'provider-3',
    name: 'Dr. Robert Lee',
    specialty: 'Dermatology',
    title: 'Dermatologist',
    credentials: ['MD', 'FAAD'],
    clinic: 'Pacific Dermatology Center',
    address: '2234 Market Street, Suite 301, San Francisco, CA 94114',
    phone: '(415) 555-3456',
    email: 'appointments@pacificdermatology.example.com',
    website: 'www.pacificdermatology.example.com',
    acceptingNewPatients: true,
    insuranceAccepted: 'Blue Cross,Aetna,Medicare,Cigna',
    languages: 'English',
    officeHours: [
      { day: 'Monday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Wednesday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Thursday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Friday', hours: '9:00 AM - 4:00 PM' },
    ],
    profileImage: '/doctor-avatar.png',
    bio: 'Dr. Lee specializes in skin cancer detection and treatment, as well as a wide range of cosmetic procedures.',
  },
  {
    id: 'provider-4',
    name: 'Dr. Lisa Johnson, DDS',
    specialty: 'Dentistry',
    title: 'Dentist',
    credentials: ['DDS'],
    clinic: 'Smile Dental',
    address: '321 Tooth Lane, San Francisco, CA 94110',
    phone: '(555) 456-7890',
    email: 'info@smiledental.example.com',
    website: 'www.smiledental.example.com',
    acceptingNewPatients: true,
    insuranceAccepted: 'Delta Dental,Cigna Dental,Guardian',
    languages: 'English,French',
    officeHours: [
      { day: 'Monday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Tuesday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Wednesday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Thursday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Friday', hours: '8:00 AM - 2:00 PM' },
    ],
    profileImage: '/doctor-avatar.png',
    bio: 'Dr. Johnson provides comprehensive dental care for the whole family, from routine cleanings to cosmetic procedures.',
  },
  {
    id: 'provider-5',
    name: 'Dr. James Wilson',
    specialty: 'Cardiology',
    title: 'Cardiologist',
    credentials: ['MD', 'FACC'],
    clinic: 'Heart Center',
    address: '432 Pulse Avenue, San Francisco, CA 94158',
    phone: '(555) 567-8901',
    email: 'cardiology@heartcenter.example.com',
    website: 'www.sfheartcenter.example.com',
    acceptingNewPatients: true,
    insuranceAccepted: 'Blue Cross,Aetna,Medicare,United Healthcare',
    languages: 'English',
    officeHours: [
      { day: 'Monday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Wednesday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Thursday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Friday', hours: '9:00 AM - 3:00 PM' },
    ],
    profileImage: '/doctor-avatar.png',
    bio: 'Dr. Wilson specializes in cardiovascular disease prevention, diagnosis, and treatment of heart conditions.',
  },
  {
    id: 'provider-6',
    name: 'Dr. Emily Watson, PhD',
    specialty: 'Psychology',
    title: 'Psychologist',
    credentials: ['PhD', 'Licensed Clinical Psychologist'],
    clinic: 'Mind Wellness Center',
    address: '543 Calm Street, San Francisco, CA 94115',
    phone: '(555) 678-9012',
    email: 'dr.watson@mindwellness.example.com',
    website: 'www.mindwellnesscenter.example.com',
    acceptingNewPatients: true,
    insuranceAccepted: 'Blue Cross,Aetna,United Healthcare,Cigna',
    languages: 'English',
    officeHours: [
      { day: 'Monday', hours: '10:00 AM - 6:00 PM' },
      { day: 'Tuesday', hours: '10:00 AM - 6:00 PM' },
      { day: 'Wednesday', hours: '12:00 PM - 8:00 PM' },
      { day: 'Thursday', hours: '10:00 AM - 6:00 PM' },
      { day: 'Friday', hours: '9:00 AM - 3:00 PM' },
    ],
    profileImage: '/doctor-avatar.png',
    bio: 'Dr. Watson specializes in cognitive behavioral therapy, mindfulness-based stress reduction, and treatment of anxiety and depression.',
  },
  {
    id: 'provider-7',
    name: 'Dr. John Bo, OD',
    specialty: 'Optometry',
    title: 'Optometrist',
    credentials: ['OD'],
    clinic: 'Clear Vision Optometry',
    address: '654 Sight Boulevard, San Francisco, CA 94103',
    phone: '(555) 789-0123',
    email: 'appointments@clearvision.example.com',
    website: 'www.clearvisionoptometry.example.com',
    acceptingNewPatients: true,
    insuranceAccepted: 'VSP,EyeMed,Davis Vision,Spectera',
    languages: 'English,Cantonese',
    officeHours: [
      { day: 'Monday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Tuesday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Wednesday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Thursday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Friday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Saturday', hours: '10:00 AM - 3:00 PM' },
    ],
    profileImage: '/doctor-avatar.png',
    bio: 'Dr. Bo provides comprehensive eye exams, contact lens fittings, and diagnosis and treatment of eye conditions.',
  },
  {
    id: 'provider-8',
    name: 'Markus Jonsson, PT',
    specialty: 'Physical Therapy',
    title: 'Physical Therapist',
    credentials: ['PT', 'DPT', 'OCS'],
    clinic: 'Rehabilitation Center',
    address: '456 Wellness Avenue, San Francisco, CA 94109',
    phone: '(555) 890-1234',
    email: 'therapy@rehabcenter.example.com',
    website: 'www.sfrehab.example.com',
    acceptingNewPatients: true,
    insuranceAccepted: 'Blue Cross,Aetna,Medicare,Workers Comp',
    languages: 'English,Swedish',
    officeHours: [
      { day: 'Monday', hours: '7:00 AM - 7:00 PM' },
      { day: 'Tuesday', hours: '7:00 AM - 7:00 PM' },
      { day: 'Wednesday', hours: '7:00 AM - 7:00 PM' },
      { day: 'Thursday', hours: '7:00 AM - 7:00 PM' },
      { day: 'Friday', hours: '7:00 AM - 5:00 PM' },
    ],
    profileImage: '/doctor-avatar.png',
    bio: 'Markus specializes in sports injury rehabilitation, post-surgical recovery, and chronic pain management.',
  },
  {
    id: 'provider-9',
    name: 'Dr. Alan Park',
    specialty: 'Allergy & Immunology',
    title: 'Allergist',
    credentials: ['MD', 'FAAAAI'],
    clinic: 'Allergy & Asthma Specialists',
    address: '876 Respiratory Road, San Francisco, CA 94133',
    phone: '(555) 901-2345',
    email: 'info@allergyspecialists.example.com',
    website: 'www.allergyasthmaspecialists.example.com',
    acceptingNewPatients: true,
    insuranceAccepted: 'Blue Cross,Aetna,Medicare,Kaiser',
    languages: 'English,Korean',
    officeHours: [
      { day: 'Monday', hours: '8:30 AM - 5:00 PM' },
      { day: 'Tuesday', hours: '8:30 AM - 5:00 PM' },
      { day: 'Wednesday', hours: '8:30 AM - 5:00 PM' },
      { day: 'Thursday', hours: '8:30 AM - 5:00 PM' },
      { day: 'Friday', hours: '8:30 AM - 3:00 PM' },
    ],
    profileImage: '/doctor-avatar.png',
    bio: 'Dr. Park specializes in the diagnosis and treatment of allergies, asthma, and immune system disorders.',
  },
  {
    id: 'provider-10',
    name: 'Dr. Maria Rodriguez',
    specialty: 'Radiology',
    title: 'Radiologist',
    credentials: ['MD'],
    clinic: "Women's Imaging Center",
    address: '987 Health Parkway, San Francisco, CA 94102',
    phone: '(555) 012-3456',
    email: 'appointments@womensimaging.example.com',
    website: 'www.womensimaging.example.com',
    acceptingNewPatients: true,
    insuranceAccepted: 'Blue Cross,Aetna,Medicare,United Healthcare',
    languages: 'English,Spanish',
    officeHours: [
      { day: 'Monday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Tuesday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Wednesday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Thursday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Friday', hours: '8:00 AM - 4:00 PM' },
    ],
    profileImage: '/doctor-avatar.png',
    bio: "Dr. Rodriguez specializes in mammography, ultrasound, and other diagnostic imaging procedures with a focus on women's health.",
  },
  {
    id: 'provider-11',
    name: 'Dr. Thomas Wright',
    specialty: 'Oncology',
    title: 'Medical Oncologist',
    credentials: ['MD', 'FASCO'],
    clinic: 'Bay Area Cancer Center',
    address: '555 Treatment Way, San Francisco, CA 94143',
    phone: '(555) 321-7890',
    email: 'appointments@bayareacancer.example.com',
    website: 'www.bayareacancercenter.example.com',
    acceptingNewPatients: true,
    insuranceAccepted: 'Blue Cross,Aetna,Medicare,United Healthcare,Cigna',
    languages: 'English,German',
    officeHours: [
      { day: 'Monday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Tuesday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Wednesday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Thursday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Friday', hours: '8:00 AM - 3:00 PM' },
    ],
    profileImage: '/doctor-avatar.png',
    bio: 'Dr. Wright specializes in the diagnosis and treatment of various cancers with expertise in precision medicine and targeted therapies.',
  },
];

// Function to find a provider by ID
export const getProviderById = (id: string): Provider | undefined => {
  return providers.find((provider) => provider.id === id);
};

// Function to find a provider by name
export const getProviderByName = (name: string): Provider | undefined => {
  return providers.find((provider) => provider.name.toLowerCase() === name.toLowerCase());
};

// Function to get all providers filtered by specialty
export const getProvidersBySpecialty = (specialty: string): Provider[] => {
  return providers.filter((provider) =>
    provider.specialty.toLowerCase().includes(specialty.toLowerCase())
  );
};

// Function to search providers by name, specialty, or clinic
export const searchProviders = (query: string): Provider[] => {
  const searchTerm = query.toLowerCase();
  return providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchTerm) ||
      provider.specialty.toLowerCase().includes(searchTerm) ||
      provider.clinic.toLowerCase().includes(searchTerm)
  );
};

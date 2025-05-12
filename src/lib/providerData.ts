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
  insuranceAccepted?: string[];
  languages?: string[];
  officeHours?: {
    day: string;
    hours: string;
  }[];
  profileImage?: string;
  bio?: string;
}

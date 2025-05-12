import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Provider } from '@/lib/providerData';

// Transform database row to match our Provider interface
const mapDbProviderToProvider = (dbProvider: any): Provider => {
  return {
    id: dbProvider.id,
    name: dbProvider.name,
    specialty: dbProvider.specialty,
    title: dbProvider.title || undefined,
    credentials: dbProvider.credentials || undefined,
    clinic: dbProvider.clinic,
    address: dbProvider.address,
    phone: dbProvider.phone,
    email: dbProvider.email || undefined,
    website: dbProvider.website || undefined,
    acceptingNewPatients: dbProvider.accepting_new_patients,
    insuranceAccepted: Array.isArray(dbProvider.insurance_accepted)
      ? dbProvider.insurance_accepted 
      : dbProvider.insurance_accepted?.split(',') || undefined,
    languages: Array.isArray(dbProvider.languages) 
      ? dbProvider.languages 
      : dbProvider.languages?.split(',') || undefined,
    officeHours: dbProvider.office_hours || undefined,
    profileImage: dbProvider.profile_image || undefined,
    bio: dbProvider.bio || undefined,
  };
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*');
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch providers' },
        { status: 500 }
      );
    }

    // Map database providers to our Provider interface
    const providers = data.map(mapDbProviderToProvider);
    
    // Ensure we're returning an array, not an object with numeric keys
    const finalData = Array.isArray(providers) ? providers : Object.values(providers);
    
    return new NextResponse(JSON.stringify(finalData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Exception fetching providers:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 
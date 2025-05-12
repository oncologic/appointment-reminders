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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Map database provider to our Provider interface
    const provider = mapDbProviderToProvider(data);
    
    // Make sure the response is structured correctly
    return new NextResponse(JSON.stringify(provider), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Exception fetching provider:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 
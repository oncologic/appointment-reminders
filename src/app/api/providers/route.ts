import { NextRequest, NextResponse } from 'next/server';

import { Provider } from '@/lib/providerData';
import { createClient } from '@/lib/supabase/server';

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
    user_id: dbProvider.user_id || undefined,
  };
};

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client for the current request
    const supabase = createClient();

    // Get session to check authentication and get user ID
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to access providers' },
        { status: 401 }
      );
    }

    // Get the current user's ID
    const userId = session.user.id;

    // Query providers filtered by user_id
    const { data, error } = await supabase.from('providers').select('*').eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
    }

    // Map database providers to our Provider interface
    const providers = data.map(mapDbProviderToProvider);

    // Return the providers as JSON
    return NextResponse.json(providers);
  } catch (error) {
    console.error('Exception fetching providers:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

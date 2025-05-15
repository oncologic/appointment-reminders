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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Create a Supabase client for the current request
    const supabase = createClient();

    // Get session to check authentication and get user ID
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to access provider details' },
        { status: 401 }
      );
    }

    // Get the current user's ID
    const userId = session.user.id;

    // Query the provider with both id and user_id filters for security
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Provider not found or you do not have permission to view this provider' },
        { status: 404 }
      );
    }

    // Map database provider to our Provider interface
    const provider = mapDbProviderToProvider(data);

    // Return the provider as JSON
    return NextResponse.json(provider);
  } catch (error) {
    console.error('Exception fetching provider:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

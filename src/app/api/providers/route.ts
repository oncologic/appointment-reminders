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

export async function POST(request: NextRequest) {
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
        { error: 'Unauthorized: You must be logged in to create providers' },
        { status: 401 }
      );
    }

    // Get the current user's ID
    const userId = session.user.id;

    // Parse the request body to get provider data
    const providerData = await request.json();

    // Validate required fields
    if (!providerData.name) {
      return NextResponse.json({ error: 'Provider name is required' }, { status: 400 });
    }

    // Create a new provider record with minimal required fields
    // and default values for other required fields
    const newProvider = {
      name: providerData.name,
      specialty: providerData.specialty || 'General',
      clinic: providerData.clinic || 'Custom Provider',
      address: providerData.address || 'No address provided',
      phone: providerData.phone || 'No phone provided',
      accepting_new_patients: true,
      user_id: userId,
      // Add any other required fields with default values
    };

    // Insert the new provider into the database
    const { data, error } = await supabase.from('providers').insert(newProvider).select().single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
    }

    // Map the created database provider to our Provider interface
    const provider = mapDbProviderToProvider(data);

    // Return the new provider data
    return NextResponse.json(provider);
  } catch (error) {
    console.error('Exception creating provider:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

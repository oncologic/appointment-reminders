import { Provider } from './providerData';

/**
 * Fetches all providers for the current authenticated user from the API
 */
export async function fetchProviders(): Promise<Provider[]> {
  try {
    const response = await fetch('/api/providers');

    if (!response.ok) {
      // Handle unauthorized or other errors
      if (response.status === 401) {
        throw new Error('You must be logged in to view providers');
      }
      throw new Error(`Failed to fetch providers: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching providers:', error);
    throw error;
  }
}

/**
 * Fetches a single provider by ID from the API
 * Only returns providers that belong to the current user
 */
export async function fetchProviderById(id: string): Promise<Provider> {
  try {
    const response = await fetch(`/api/providers/${id}`);

    if (!response.ok) {
      // Handle unauthorized, not found, or other errors
      if (response.status === 401) {
        throw new Error('You must be logged in to view provider details');
      }
      if (response.status === 404) {
        throw new Error('Provider not found or you do not have access to this provider');
      }
      throw new Error(`Failed to fetch provider: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching provider with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Searches providers that match the query against name, specialty, or clinic
 */
export async function searchProviders(query: string): Promise<Provider[]> {
  try {
    // For now, we'll fetch all providers and filter client-side
    // In a production app, you'd implement server-side search
    const allProviders = await fetchProviders();

    if (!query.trim()) {
      return allProviders;
    }

    const searchTerm = query.toLowerCase();
    return allProviders.filter(
      (provider) =>
        provider.name.toLowerCase().includes(searchTerm) ||
        provider.specialty.toLowerCase().includes(searchTerm) ||
        provider.clinic.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error('Error searching providers:', error);
    throw error;
  }
}

/**
 * Gets all providers filtered by specialty
 */
export async function getProvidersBySpecialty(specialty: string): Promise<Provider[]> {
  try {
    // For now, we'll fetch all providers and filter client-side
    // In a production app, you'd implement server-side filtering
    const allProviders = await fetchProviders();

    return allProviders.filter((provider) =>
      provider.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  } catch (error) {
    console.error(`Error getting providers by specialty ${specialty}:`, error);
    throw error;
  }
}

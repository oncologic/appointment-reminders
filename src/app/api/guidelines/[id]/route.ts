import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    // Get the current session to determine user ID
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Fetch the guideline with its age ranges
    const { data: guideline, error: guidelineError } = await supabase
      .from('guidelines')
      .select('*')
      .eq('id', id)
      .single();
      
    if (guidelineError) {
      if (guidelineError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Guideline not found' }, { status: 404 });
      }
      return NextResponse.json({ error: guidelineError.message }, { status: 500 });
    }
    
    // Check permission - users can only access public guidelines or their own private ones
    if (guideline.visibility === 'private' && guideline.created_by !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Fetch age ranges for this guideline
    const { data: ageRanges, error: ageRangesError } = await supabase
      .from('guideline_age_ranges')
      .select('*')
      .eq('guideline_id', id);
      
    if (ageRangesError) {
      return NextResponse.json({ error: ageRangesError.message }, { status: 500 });
    }
    
    // Fetch resources for this guideline
    const { data: resources, error: resourcesError } = await supabase
      .from('guideline_resources')
      .select('*')
      .eq('guideline_id', id);
      
    if (resourcesError) {
      return NextResponse.json({ error: resourcesError.message }, { status: 500 });
    }
    
    return NextResponse.json({
      guideline: {
        ...guideline,
        ageRanges,
        resources: resources || []
      }
    });
    
  } catch (error) {
    console.error('Error fetching guideline:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  // Get session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // Only allow authenticated users to update guidelines
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const userId = session.user.id;
    
    // First check if the guideline exists and if user has permission
    const { data: existingGuideline, error: checkError } = await supabase
      .from('guidelines')
      .select('*')
      .eq('id', id)
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Guideline not found' }, { status: 404 });
      }
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }
    
    // Check if user has permission to edit this guideline
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
      
    const isAdmin = userRole?.role === 'admin';
    
    if (!isAdmin && existingGuideline.created_by !== userId) {
      return NextResponse.json({ error: 'You do not have permission to edit this guideline' }, { status: 403 });
    }
    
    // Parse request body
    const requestData = await request.json();
    const { guideline, ageRanges, resources } = requestData;
    
    // Non-admin users can only create private guidelines
    if (!isAdmin && guideline.visibility === 'public') {
      guideline.visibility = 'private';
    }
    
    // Update the guideline
    const { data: updatedGuideline, error: updateError } = await supabase
      .from('guidelines')
      .update(guideline)
      .eq('id', id)
      .select()
      .single();
      
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    // Update age ranges if provided
    if (ageRanges) {
      // First delete existing age ranges
      const { error: deleteAgeRangesError } = await supabase
        .from('guideline_age_ranges')
        .delete()
        .eq('guideline_id', id);
        
      if (deleteAgeRangesError) {
        return NextResponse.json({ error: deleteAgeRangesError.message }, { status: 500 });
      }
      
      // Then insert new age ranges
      if (ageRanges.length > 0) {
        const ageRangesWithGuidelineId = ageRanges.map((range: any) => ({
          ...range,
          guideline_id: id
        }));
        
        const { error: insertAgeRangesError } = await supabase
          .from('guideline_age_ranges')
          .insert(ageRangesWithGuidelineId);
          
        if (insertAgeRangesError) {
          return NextResponse.json({ error: insertAgeRangesError.message }, { status: 500 });
        }
      }
    }
    
    // Update resources if provided
    if (resources) {
      // First delete existing resources
      const { error: deleteResourcesError } = await supabase
        .from('guideline_resources')
        .delete()
        .eq('guideline_id', id);
        
      if (deleteResourcesError) {
        return NextResponse.json({ error: deleteResourcesError.message }, { status: 500 });
      }
      
      // Then insert new resources
      if (resources.length > 0) {
        const resourcesWithGuidelineId = resources.map((resource: any) => ({
          ...resource,
          guideline_id: id
        }));
        
        const { error: insertResourcesError } = await supabase
          .from('guideline_resources')
          .insert(resourcesWithGuidelineId);
          
        if (insertResourcesError) {
          return NextResponse.json({ error: insertResourcesError.message }, { status: 500 });
        }
      }
    }
    
    return NextResponse.json({ 
      guideline: updatedGuideline,
      message: 'Guideline updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating guideline:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  // Get session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // Only allow authenticated users to delete guidelines
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const userId = session.user.id;
    
    // First check if the guideline exists and if user has permission
    const { data: existingGuideline, error: checkError } = await supabase
      .from('guidelines')
      .select('*')
      .eq('id', id)
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Guideline not found' }, { status: 404 });
      }
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }
    
    // Check if user has permission to delete this guideline
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
      
    const isAdmin = userRole?.role === 'admin';
    
    if (!isAdmin && existingGuideline.created_by !== userId) {
      return NextResponse.json({ 
        error: 'You do not have permission to delete this guideline' 
      }, { status: 403 });
    }
    
    // Delete the guideline (cascade will handle age ranges and resources)
    const { error: deleteError } = await supabase
      .from('guidelines')
      .delete()
      .eq('id', id);
      
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Guideline deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting guideline:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 
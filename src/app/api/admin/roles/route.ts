import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface RoleUpdatePayload {
  userId: string;
  role: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Loaded' : 'Missing');
console.log('Supabase Service Key:', supabaseServiceKey ? 'Loaded' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  console.log('PUT request received for /api/admin/roles');
  try {
    const { userId, role }: RoleUpdatePayload = await request.json();

    console.log('Received role update request for:', { userId, role });

    if (!userId || !role) {
      console.error('Missing userId or role in PUT request', { userId, role });
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: role }, { onConflict: 'user_id' });

    if (updateError) {
      console.error('Error updating user role in Supabase:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Role updated successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Unexpected error in API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
} 
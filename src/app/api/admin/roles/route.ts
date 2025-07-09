import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

interface RoleUpdatePayload {
  userId: string;
  role: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

logger.api.debug('Supabase configuration check', {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
});

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
  logger.api.info('PUT request received for /api/admin/roles');
  try {
    const { userId, role }: RoleUpdatePayload = await request.json();

    logger.api.info('Received role update request', { userId, role });

    if (!userId || !role) {
      logger.api.error('Missing userId or role in PUT request', {
        userId,
        role,
      });
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: role }, { onConflict: 'user_id' });

    if (updateError) {
      logger.api.error('Error updating user role in Supabase', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Role updated successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    logger.api.error('Unexpected error in API route', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { UserRole, UserData, UserRoleData } from '@/lib/types';
import { User } from '@supabase/auth-js';
import { logger } from '@/lib/logger';

// Инициализация Supabase клиента с service role key
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

export async function GET() {
  try {
    // Получаем список всех пользователей из auth.users
    const { data: allAuthUsersData, error: authUsersError } =
      await supabase.auth.admin.listUsers();

    if (authUsersError) {
      logger.api.error('Error listing users from auth', authUsersError);
      return NextResponse.json(
        { error: authUsersError.message },
        { status: 500 }
      );
    }

    const authUsers: User[] = (allAuthUsersData?.users || []) as User[];

    // Получаем все роли пользователей из таблицы user_roles
    const { data: allUserRolesRaw, error: userRolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (userRolesError) {
      logger.api.error('Error listing user roles', userRolesError);
      return NextResponse.json(
        { error: userRolesError.message },
        { status: 500 }
      );
    }

    const allUserRoles: UserRoleData[] = (allUserRolesRaw ||
      []) as UserRoleData[];

    const rolesMap = new Map<string, UserRole>();
    allUserRoles.forEach((ur: UserRoleData) => {
      rolesMap.set(ur.user_id, ur.role);
    });

    const usersWithRoles: UserData[] = authUsers.map((u: User) => ({
      id: u.id,
      email: u.email || '',
      role: rolesMap.get(u.id) || 'viewer',
    }));

    return NextResponse.json(usersWithRoles, { status: 200 });
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

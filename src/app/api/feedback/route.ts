import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Service role client для админских операций
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// GET - получение всех заявок (для админов) или своих заявок (для пользователей)
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверяем роль пользователя
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // Используем admin client для получения данных
    let query = supabaseAdmin
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    // Если не админ, показываем только свои заявки
    if (userRole?.role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    const { data: feedback, error } = await query;

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    // Форматируем данные для фронтенда
    const formattedFeedback = feedback?.map((item) => ({
      ...item,
      user_email: `user-${item.user_id.slice(0, 8)}@example.com`,
      user_name: `Пользователь ${item.user_id.slice(0, 8)}`,
    }));

    return NextResponse.json(formattedFeedback);
  } catch (error) {
    console.error('Error in feedback GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - создание новой заявки
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      current_page,
      user_agent,
      attachments = [],
    } = body;

    // Валидация
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: feedback, error } = await supabaseAdmin
      .from('feedback')
      .insert({
        user_id: user.id,
        title,
        description,
        category,
        current_page,
        user_agent,
        attachments: attachments,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback:', error);
      return NextResponse.json(
        { error: 'Failed to create feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error in feedback POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

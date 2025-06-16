import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { UpdateFeedbackData } from '@/types/feedback';

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

// PATCH - обновление заявки (статус, заметки админа)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: feedbackId } = await params;
    const body: UpdateFeedbackData = await request.json();

    // Проверяем роль пользователя
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // Получаем текущую заявку
    const { data: currentFeedback, error: fetchError } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .eq('id', feedbackId)
      .single();

    if (fetchError || !currentFeedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Проверяем права доступа
    const isAdmin = userRole?.role === 'admin';
    const isOwner = currentFeedback.user_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Обновляем заявку
    const { data: updatedFeedback, error } = await supabaseAdmin
      .from('feedback')
      .update(body)
      .eq('id', feedbackId)
      .select()
      .single();

    if (error) {
      console.error('Error updating feedback:', error);
      return NextResponse.json(
        { error: 'Failed to update feedback' },
        { status: 500 }
      );
    }

    // Если статус изменился и это сделал админ, логируем изменение
    if (body.status && body.status !== currentFeedback.status && isAdmin) {
      console.log(
        'Status changed for feedback:',
        feedbackId,
        'from',
        currentFeedback.status,
        'to',
        body.status
      );
      // TODO: Добавить отправку email уведомлений
    }

    return NextResponse.json(updatedFeedback);
  } catch (error) {
    console.error('Error in feedback PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Проверяем размер файла (5MB максимум)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only images are allowed' },
        { status: 400 }
      );
    }

    // Генерируем уникальное имя файла
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `feedback/${fileName}`;

    // Конвертируем файл в ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Загружаем файл в Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('campaign-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        duplex: 'half',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        {
          error: 'Upload failed',
          details: uploadError.message,
          bucket: 'campaign-images',
          path: filePath,
        },
        { status: 500 }
      );
    }

    // Получаем публичный URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('campaign-images').getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

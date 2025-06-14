import { supabase } from './supabase';
import { compressImage } from './imageUtils';

/**
 * Загружает изображение в Supabase Storage
 */
export async function uploadCampaignImage(
  file: File,
  campaignId: string
): Promise<{ url: string; error?: string }> {
  try {
    // Сжимаем изображение перед загрузкой
    const compressedFile = await compressImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      format: 'jpeg',
    });

    // Генерируем уникальное имя файла
    const fileExt = 'jpg'; // Всегда JPEG после сжатия
    const fileName = `${campaignId}-${Date.now()}.${fileExt}`;

    // Загружаем в Storage
    const { error } = await supabase.storage
      .from('campaign-images')
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { url: '', error: 'Ошибка загрузки изображения в хранилище' };
    }

    // Получаем публичный URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('campaign-images').getPublicUrl(fileName);

    return { url: publicUrl };
  } catch (error) {
    console.error('Image upload error:', error);
    return { url: '', error: 'Ошибка обработки изображения' };
  }
}

/**
 * Обновляет изображение кампании (удаляет старое, загружает новое)
 */
export async function updateCampaignImage(
  file: File,
  campaignId: string,
  oldImageUrl?: string
): Promise<{ url: string; error?: string }> {
  try {
    // Удаляем старое изображение, если оно есть
    if (oldImageUrl) {
      await deleteCampaignImage(oldImageUrl);
    }

    // Загружаем новое изображение
    return await uploadCampaignImage(file, campaignId);
  } catch (error) {
    console.error('Image update error:', error);
    return { url: '', error: 'Ошибка обновления изображения' };
  }
}

/**
 * Удаляет изображение из Storage
 */
export async function deleteCampaignImage(imageUrl: string): Promise<void> {
  try {
    // Извлекаем имя файла из URL
    const fileName = extractFileNameFromUrl(imageUrl);
    if (!fileName) return;

    const { error } = await supabase.storage
      .from('campaign-images')
      .remove([fileName]);

    if (error) {
      console.error('Storage delete error:', error);
    }
  } catch (error) {
    console.error('Image delete error:', error);
  }
}

/**
 * Извлекает имя файла из URL Supabase Storage
 */
function extractFileNameFromUrl(url: string): string | null {
  try {
    // URL формат: https://[project].supabase.co/storage/v1/object/public/campaign-images/filename.jpg
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];

    // Проверяем, что это файл из нашего bucket
    if (url.includes('/campaign-images/') && fileName) {
      return fileName;
    }

    return null;
  } catch (error) {
    console.error('Error extracting filename from URL:', error);
    return null;
  }
}

/**
 * Проверяет, является ли URL изображением из Supabase Storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('/storage/v1/object/public/campaign-images/');
}

/**
 * Загружает изображение из буфера обмена в Storage
 */
export async function uploadImageFromClipboard(
  clipboardFile: File,
  campaignId: string
): Promise<{ url: string; error?: string }> {
  return await uploadCampaignImage(clipboardFile, campaignId);
}

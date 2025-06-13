import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';

export const supabase = createClientComponentClient<Database>();

export type UserRole = 'super_admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  level: 'T1' | 'T2' | 'T3' | 'special';
  start_date: string;
  end_date: string;
  budget: number;
  vertical_id: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
}

export interface Vertical {
  id: string;
  name: string;
  description: string;
}

export interface CampaignMaterial {
  id: string;
  campaign_id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  created_at: string;
}

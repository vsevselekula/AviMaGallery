import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';
import { Campaign, UserRole, Vertical } from './types';

export const supabase = createClientComponentClient<Database>();

export type { Campaign, UserRole, Vertical };

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface CampaignMaterial {
  id: string;
  campaign_id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  created_at: string;
}

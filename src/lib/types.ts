export interface Campaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  key_message: string;
  vertical: string;
  flight_period: {
    start_date: string;
    end_date: string;
  };
  main_image?: string;
  status: 'active' | 'completed' | 'planned';
  budget: number;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
  };
  campaign_vertical: string;
  geo: string;
  audience: string;
  objectives: string[];
  channels: string[];
  materials: string[];
  links: {
    label: string;
    url: string;
  }[];
  attachments: {
    label: string;
    url: string;
  }[];
  image_url?: string;
  video_url?: string | null;
  video_type?: 'google_drive' | 'yandex_disk';
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
}

export interface TeamMember {
  name: string;
  role: string;
  initials: string;
}

export interface Vertical {
  id: string;
  name: string;
  description: string;
  main_image: string;
  team_members: TeamMember[];
}

export type UserRole = 'super_admin' | 'editor' | 'viewer';

export interface UserRoleData {
  user_id: string;
  role: UserRole;
}

export interface UserData {
  id: string;
  email: string;
  role: string;
}

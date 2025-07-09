export interface Campaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  key_message?: string;
  flight_period: {
    start_date: string;
    end_date: string;
  };
  status: 'active' | 'completed' | 'planned';
  campaign_vertical: string;
  geo?: string;
  audience?: string;
  objectives?: string[];
  channels?: string[];
  links?: {
    label: string;
    url: string;
  }[];
  image_url?: string;
  video_url?: string | null;
  type?: string;
  slogan?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  targets?: string[];
  pre_tests?: unknown;
  post_tests?: unknown;
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

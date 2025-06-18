export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      campaigns_v2: {
        Row: {
          id: string;
          campaign_name: string;
          campaign_type: string;
          key_message: string | null;
          flight_period: Json;
          status: string | null;
          campaign_vertical: string;
          geo: string | null;
          audience: string | null;
          objectives: string[] | null;
          channels: string[] | null;
          links: Json | null;
          created_at: string | null;
          updated_at: string | null;
          image_url: string | null;
          video_url: string | null;
          type: string | null;
          slogan: string | null;
          description: string | null;
          targets: string[] | null;
          pre_tests: Json | null;
          post_tests: Json | null;
        };
        Insert: {
          id?: string;
          campaign_name: string;
          campaign_type: string;
          key_message?: string | null;
          flight_period?: Json;
          status?: string | null;
          campaign_vertical: string;
          geo?: string | null;
          audience?: string | null;
          objectives?: string[] | null;
          channels?: string[] | null;
          links?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          type?: string | null;
          slogan?: string | null;
          description?: string | null;
          targets?: string[] | null;
          pre_tests?: Json | null;
          post_tests?: Json | null;
        };
        Update: {
          id?: string;
          campaign_name?: string;
          campaign_type?: string;
          key_message?: string | null;
          flight_period?: Json;
          status?: string | null;
          campaign_vertical?: string;
          geo?: string | null;
          audience?: string | null;
          objectives?: string[] | null;
          channels?: string[] | null;
          links?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          type?: string | null;
          slogan?: string | null;
          description?: string | null;
          targets?: string[] | null;
          pre_tests?: Json | null;
          post_tests?: Json | null;
        };
      };
      verticals: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          main_image: string | null;
          team_members: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          main_image?: string | null;
          team_members?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          main_image?: string | null;
          team_members?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          created_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

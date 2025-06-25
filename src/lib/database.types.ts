export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      campaign_reactions: {
        Row: {
          campaign_id: string;
          created_at: string | null;
          id: string;
          reaction_type: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          campaign_id: string;
          created_at?: string | null;
          id?: string;
          reaction_type: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          campaign_id?: string;
          created_at?: string | null;
          id?: string;
          reaction_type?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'campaign_reactions_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns_v2';
            referencedColumns: ['id'];
          },
        ];
      };
      campaign_types: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          audience: string | null;
          campaign_name: string;
          campaign_type: string;
          campaign_vertical: string;
          channels: string[] | null;
          created_at: string | null;
          description: string | null;
          flight_period: Json | null;
          geo: string | null;
          id: string;
          image_url: string | null;
          key_message: string | null;
          links: Json | null;
          objectives: string[] | null;
          post_tests: Json | null;
          pre_tests: Json | null;
          slogan: string | null;
          status: string | null;
          targets: string[] | null;
          type: string | null;
          updated_at: string | null;
          video_url: string | null;
        };
        Insert: {
          audience?: string | null;
          campaign_name: string;
          campaign_type: string;
          campaign_vertical: string;
          channels?: string[] | null;
          created_at?: string | null;
          description?: string | null;
          flight_period?: Json | null;
          geo?: string | null;
          id?: string;
          image_url?: string | null;
          key_message?: string | null;
          links?: Json | null;
          objectives?: string[] | null;
          post_tests?: Json | null;
          pre_tests?: Json | null;
          slogan?: string | null;
          status?: string | null;
          targets?: string[] | null;
          type?: string | null;
          updated_at?: string | null;
          video_url?: string | null;
        };
        Update: {
          audience?: string | null;
          campaign_name?: string;
          campaign_type?: string;
          campaign_vertical?: string;
          channels?: string[] | null;
          created_at?: string | null;
          description?: string | null;
          flight_period?: Json | null;
          geo?: string | null;
          id?: string;
          image_url?: string | null;
          key_message?: string | null;
          links?: Json | null;
          objectives?: string[] | null;
          post_tests?: Json | null;
          pre_tests?: Json | null;
          slogan?: string | null;
          status?: string | null;
          targets?: string[] | null;
          type?: string | null;
          updated_at?: string | null;
          video_url?: string | null;
        };
        Relationships: [];
      };
      campaigns_v2: {
        Row: {
          audience: string | null;
          campaign_name: string;
          campaign_type: string;
          campaign_vertical: string;
          channels: string[] | null;
          created_at: string | null;
          description: string | null;
          flight_period: Json | null;
          geo: string | null;
          id: string;
          image_url: string | null;
          key_message: string | null;
          links: Json | null;
          objectives: string[] | null;
          post_tests: Json | null;
          pre_tests: Json | null;
          slogan: string | null;
          status: string | null;
          targets: string[] | null;
          type: string | null;
          updated_at: string | null;
          video_url: string | null;
        };
        Insert: {
          audience?: string | null;
          campaign_name: string;
          campaign_type: string;
          campaign_vertical: string;
          channels?: string[] | null;
          created_at?: string | null;
          description?: string | null;
          flight_period?: Json | null;
          geo?: string | null;
          id?: string;
          image_url?: string | null;
          key_message?: string | null;
          links?: Json | null;
          objectives?: string[] | null;
          post_tests?: Json | null;
          pre_tests?: Json | null;
          slogan?: string | null;
          status?: string | null;
          targets?: string[] | null;
          type?: string | null;
          updated_at?: string | null;
          video_url?: string | null;
        };
        Update: {
          audience?: string | null;
          campaign_name?: string;
          campaign_type?: string;
          campaign_vertical?: string;
          channels?: string[] | null;
          created_at?: string | null;
          description?: string | null;
          flight_period?: Json | null;
          geo?: string | null;
          id?: string;
          image_url?: string | null;
          key_message?: string | null;
          links?: Json | null;
          objectives?: string[] | null;
          post_tests?: Json | null;
          pre_tests?: Json | null;
          slogan?: string | null;
          status?: string | null;
          targets?: string[] | null;
          type?: string | null;
          updated_at?: string | null;
          video_url?: string | null;
        };
        Relationships: [];
      };
      campaigns_v2_names_backup: {
        Row: {
          campaign_name: string | null;
          id: string | null;
        };
        Insert: {
          campaign_name?: string | null;
          id?: string | null;
        };
        Update: {
          campaign_name?: string | null;
          id?: string | null;
        };
        Relationships: [];
      };
      campaigns_v2_restore: {
        Row: {
          audience: string | null;
          campaign_name: string | null;
          campaign_type: string | null;
          campaign_vertical: string | null;
          channels: Json | null;
          created_at: string | null;
          description: string | null;
          flight_period: Json | null;
          geo: string | null;
          id: string;
          image_url: string | null;
          key_message: string | null;
          links: string | null;
          objectives: string | null;
          post_tests: string | null;
          pre_tests: Json | null;
          slogan: string | null;
          status: string | null;
          targets: string | null;
          type: string | null;
          updated_at: string | null;
          video_url: string | null;
        };
        Insert: {
          audience?: string | null;
          campaign_name?: string | null;
          campaign_type?: string | null;
          campaign_vertical?: string | null;
          channels?: Json | null;
          created_at?: string | null;
          description?: string | null;
          flight_period?: Json | null;
          geo?: string | null;
          id: string;
          image_url?: string | null;
          key_message?: string | null;
          links?: string | null;
          objectives?: string | null;
          post_tests?: string | null;
          pre_tests?: Json | null;
          slogan?: string | null;
          status?: string | null;
          targets?: string | null;
          type?: string | null;
          updated_at?: string | null;
          video_url?: string | null;
        };
        Update: {
          audience?: string | null;
          campaign_name?: string | null;
          campaign_type?: string | null;
          campaign_vertical?: string | null;
          channels?: Json | null;
          created_at?: string | null;
          description?: string | null;
          flight_period?: Json | null;
          geo?: string | null;
          id?: string;
          image_url?: string | null;
          key_message?: string | null;
          links?: string | null;
          objectives?: string | null;
          post_tests?: string | null;
          pre_tests?: Json | null;
          slogan?: string | null;
          status?: string | null;
          targets?: string | null;
          type?: string | null;
          updated_at?: string | null;
          video_url?: string | null;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          admin_notes: string | null;
          attachments: Json | null;
          category: string;
          created_at: string | null;
          current_page: string | null;
          description: string;
          id: string;
          status: string;
          title: string;
          updated_at: string | null;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          admin_notes?: string | null;
          attachments?: Json | null;
          category: string;
          created_at?: string | null;
          current_page?: string | null;
          description: string;
          id?: string;
          status?: string;
          title: string;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          admin_notes?: string | null;
          attachments?: Json | null;
          category?: string;
          created_at?: string | null;
          current_page?: string | null;
          description?: string;
          id?: string;
          status?: string;
          title?: string;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      verticals: {
        Row: {
          description: string | null;
          id: string;
          main_image: string | null;
          name: string;
          team_members: Json | null;
        };
        Insert: {
          description?: string | null;
          id?: string;
          main_image?: string | null;
          name: string;
          team_members?: Json | null;
        };
        Update: {
          description?: string | null;
          id?: string;
          main_image?: string | null;
          name?: string;
          team_members?: Json | null;
        };
        Relationships: [];
      };
    };
    Views: {
      campaign_reactions_summary: {
        Row: {
          campaign_id: string | null;
          count: number | null;
          reaction_type: string | null;
          user_ids: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'campaign_reactions_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns_v2';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

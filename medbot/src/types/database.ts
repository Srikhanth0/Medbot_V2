export interface ProfileRow {
  id?: string;
  clerk_user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  blood_group?: string;
  age?: number;
  medical_id?: string;
  emergency_contact?: string;
  conditions?: string[];
  insurance_provider?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface UserPreferencesRow {
  id?: string;
  user_id: string;
  theme: string;
  compact_mode: boolean;
  auto_scroll: boolean;
  updated_at?: string;
}

export interface ModelSettingsRow {
  id?: string;
  user_id: string;
  x_position: number;
  y_position: number;
  zoom: number;
  rotation: number;
  lighting: string;
  updated_at?: string;
}

export interface DatabaseSchema {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileRow;
        Update: Partial<ProfileRow>;
      };
      user_preferences: {
        Row: UserPreferencesRow;
        Insert: UserPreferencesRow;
        Update: Partial<UserPreferencesRow>;
      };
      model_settings: {
        Row: ModelSettingsRow;
        Insert: ModelSettingsRow;
        Update: Partial<ModelSettingsRow>;
      };
    };
  };
}

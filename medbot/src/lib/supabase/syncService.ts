import { getAuthenticatedSupabaseClient } from './supabaseClient';
import { ProfileRow, UserPreferencesRow, ModelSettingsRow } from '@/types/database';
import { User } from '@/types/auth';

/**
 * Supabase User & Telemetry Synchronization Service
 * Handles persistence, fetching, and updating profile data in Supabase.
 */
export class SupabaseSyncService {
  /**
   * Synchronizes User profile data into Supabase `profiles` (and `users`) table with User ID.
   */
  static async syncUserToSupabase(user: User, clerkToken?: string): Promise<ProfileRow | null> {
    try {
      const client = getAuthenticatedSupabaseClient(clerkToken);
      const now = new Date().toISOString();

      const profilePayload: ProfileRow = {
        clerk_user_id: user.id,
        email: user.email,
        full_name: user.name,
        avatar_url: user.avatar,
        role: user.role || 'patient',
        blood_group: user.bloodGroup || 'A+',
        age: user.age || 28,
        medical_id: user.medicalId || 'MC-792BD012',
        emergency_contact: user.emergencyContact || '+1 (555) 019-2834',
        conditions: user.conditions || ['Mild Asthma'],
        insurance_provider: user.insuranceProvider || 'BlueCross Health',
        updated_at: now,
        last_login: now,
      };

      // 1. Upsert into Supabase `profiles` table
      const { data, error } = await client
        .from('profiles')
        .upsert(profilePayload as any, { onConflict: 'clerk_user_id' })
        .select()
        .single();

      if (error) {
        console.warn('Supabase profiles table upsert notice:', error.message);
      }

      // 2. Fallback upsert into `users` table if present in database schema
      try {
        await (client.from('users' as any) as any).upsert({
          id: user.id,
          clerk_user_id: user.id,
          email: user.email,
          full_name: user.name,
          name: user.name,
          blood_group: user.bloodGroup,
          age: user.age,
          emergency_contact: user.emergencyContact,
          insurance_provider: user.insuranceProvider,
          updated_at: now,
        }, { onConflict: 'id' });
      } catch {
        // ignore if users table does not exist
      }

      return (data ? (data as ProfileRow) : profilePayload);
    } catch (err) {
      console.warn('Supabase syncService exception:', err);
      return null;
    }
  }

  /**
   * Fetches persistent profile record from Supabase by User ID.
   */
  static async fetchProfile(clerkUserId: string, clerkToken?: string): Promise<ProfileRow | null> {
    try {
      const client = getAuthenticatedSupabaseClient(clerkToken);

      // Query `profiles` table by clerk_user_id or id
      const { data: profileData, error: profileErr } = await client
        .from('profiles')
        .select('*')
        .or(`clerk_user_id.eq.${clerkUserId},id.eq.${clerkUserId}`)
        .maybeSingle();

      if (profileData && !profileErr) {
        return profileData as ProfileRow;
      }

      // Query `users` table as fallback
      const { data: userData, error: userErr } = await (client.from('users' as any) as any)
        .select('*')
        .or(`clerk_user_id.eq.${clerkUserId},id.eq.${clerkUserId}`)
        .maybeSingle();

      if (userData && !userErr) {
        const u = userData as any;
        return {
          clerk_user_id: u.clerk_user_id || u.id,
          email: u.email,
          full_name: u.full_name || u.name,
          avatar_url: u.avatar_url || u.avatar,
          role: u.role || 'patient',
          blood_group: u.blood_group || u.bloodGroup,
          age: u.age,
          medical_id: u.medical_id || u.medicalId,
          emergency_contact: u.emergency_contact || u.emergencyContact,
          conditions: u.conditions,
          insurance_provider: u.insurance_provider || u.insuranceProvider,
        } as ProfileRow;
      }

      return null;
    } catch (err) {
      console.warn('Fetch profile error:', err);
      return null;
    }
  }

  /**
   * Updates user preferences in Supabase `user_preferences` table
   */
  static async updatePreferences(
    clerkUserId: string,
    theme: string = 'MedBot Dark Navy',
    compactMode: boolean = false,
    clerkToken?: string
  ): Promise<boolean> {
    try {
      const client = getAuthenticatedSupabaseClient(clerkToken);
      const payload: UserPreferencesRow = {
        user_id: clerkUserId,
        theme,
        compact_mode: compactMode,
        auto_scroll: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await client
        .from('user_preferences')
        .upsert(payload as any, { onConflict: 'user_id' });

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Updates 3D model settings in Supabase `model_settings` table
   */
  static async updateModelSettings(
    clerkUserId: string,
    xPos: number,
    yPos: number,
    zoom: number,
    clerkToken?: string
  ): Promise<boolean> {
    try {
      const client = getAuthenticatedSupabaseClient(clerkToken);
      const payload: ModelSettingsRow = {
        user_id: clerkUserId,
        x_position: xPos,
        y_position: yPos,
        zoom,
        rotation: 0,
        lighting: 'clinical',
        updated_at: new Date().toISOString(),
      };

      const { error } = await client
        .from('model_settings')
        .upsert(payload as any, { onConflict: 'user_id' });

      return !error;
    } catch {
      return false;
    }
  }
}

export default SupabaseSyncService;

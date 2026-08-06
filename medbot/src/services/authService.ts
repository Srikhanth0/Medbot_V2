import SupabaseSyncService from '@/lib/supabase/syncService';
import { extractUserFromClerk, ClerkUserResource } from '@/lib/auth/session';
import { User } from '@/types/auth';

export class AuthService {
  /**
   * Synchronizes Clerk User resource to Zustand store and Supabase database backend
   */
  static async handleAuthenticatedUser(
    clerkUser: NonNullable<ClerkUserResource>,
    clerkToken?: string
  ): Promise<User> {
    const formattedUser = extractUserFromClerk(clerkUser);

    // Sync to Supabase relational profiles database table
    await SupabaseSyncService.syncUserToSupabase(formattedUser, clerkToken);

    return formattedUser;
  }
}

export default AuthService;

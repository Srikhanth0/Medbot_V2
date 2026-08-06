import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useAuthStore } from '@/stores/authStore';
import { extractUserFromClerk, isEmailVerified } from '@/lib/auth/session';
import SupabaseSyncService from '@/lib/supabase/syncService';

export type AuthStateStatus =
  | 'Unauthenticated'
  | 'SigningUp'
  | 'VerificationPending'
  | 'Verified'
  | 'Authenticated';

export function useAuthState() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { login } = useAuthStore();
  const [status, setStatus] = useState<AuthStateStatus>('Unauthenticated');

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && clerkUser) {
      const verified = isEmailVerified(clerkUser);
      if (verified) {
        setStatus('Authenticated');

        // Extract user and sync to Supabase once authenticated
        const formattedUser = extractUserFromClerk(clerkUser);
        login(formattedUser);

        getToken({ template: 'supabase' }).then((token) => {
          SupabaseSyncService.syncUserToSupabase(formattedUser, token || undefined);
        });
      } else {
        setStatus('VerificationPending');
      }
    } else {
      setStatus('Unauthenticated');
    }
  }, [isLoaded, isSignedIn, clerkUser, login, getToken]);

  return { status, setStatus, clerkUser, isLoaded, isSignedIn };
}

export default useAuthState;

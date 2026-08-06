import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useAuthStore } from '@/stores/authStore';
import SupabaseSyncService from '@/lib/supabase/syncService';

/**
 * Custom hook to automatically synchronize Clerk user login & profile data with Supabase
 * Preserves existing profile edits in Supabase & localStorage upon page refresh.
 */
export function useSupabaseSync() {
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const { getToken } = useAuth();
  const { user: localUser, login } = useAuthStore();

  useEffect(() => {
    async function performSync() {
      if (!isUserLoaded || !clerkUser) return;

      try {
        const token = (await getToken({ template: 'supabase' })) || undefined;

        // 1. Fetch persistent profile from Supabase first
        const existingProfile = await SupabaseSyncService.fetchProfile(clerkUser.id, token);

        if (existingProfile) {
          const persistentUser = {
            id: clerkUser.id,
            name: existingProfile.full_name || clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress || 'MedBot Patient',
            email: existingProfile.email || clerkUser.primaryEmailAddress?.emailAddress || 'sarah@example.com',
            avatar: existingProfile.avatar_url || clerkUser.imageUrl,
            role: existingProfile.role || 'patient',
            bloodGroup: existingProfile.blood_group || 'A+',
            age: existingProfile.age || 28,
            medicalId: existingProfile.medical_id || 'MC-792BD012',
            emergencyContact: existingProfile.emergency_contact || '+1 (555) 019-2834',
            conditions: existingProfile.conditions || ['Mild Asthma'],
            insuranceProvider: existingProfile.insurance_provider || 'BlueCross Health',
            joinedDate: new Date(clerkUser.createdAt || Date.now()).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }),
            lastLogin: new Date(clerkUser.lastSignInAt || Date.now()).toLocaleString(),
            provider: 'Clerk API (Supabase Persistent)',
          };

          // Update local Zustand store and localStorage
          login(persistentUser);
          return;
        }

        // 2. Fallback to localStorage if cached locally
        const cachedStr = localStorage.getItem('medbot_user_profile');
        if (cachedStr) {
          try {
            const cachedUser = JSON.parse(cachedStr);
            if (cachedUser && cachedUser.id === clerkUser.id) {
              login(cachedUser);
              await SupabaseSyncService.syncUserToSupabase(cachedUser, token);
              return;
            }
          } catch {
            // Ignore parse errors
          }
        }

        // 3. Fallback: Initialize initial user profile if new account
        const initialUser = {
          id: clerkUser.id,
          name: clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress || 'MedBot Patient',
          email: clerkUser.primaryEmailAddress?.emailAddress || 'sarah@example.com',
          avatar: clerkUser.imageUrl,
          role: (clerkUser.unsafeMetadata?.role as string) || 'patient',
          bloodGroup: (clerkUser.unsafeMetadata?.bloodGroup as string) || 'A+',
          age: (clerkUser.unsafeMetadata?.age as number) || 28,
          medicalId: (clerkUser.unsafeMetadata?.medicalId as string) || 'MC-792BD012',
          emergencyContact: (clerkUser.unsafeMetadata?.emergencyContact as string) || '+1 (555) 019-2834',
          conditions: (clerkUser.unsafeMetadata?.conditions as string[]) || ['Mild Asthma'],
          insuranceProvider: (clerkUser.unsafeMetadata?.insuranceProvider as string) || 'BlueCross Health',
          joinedDate: new Date(clerkUser.createdAt || Date.now()).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          lastLogin: new Date(clerkUser.lastSignInAt || Date.now()).toLocaleString(),
          provider: 'Clerk API (Supabase Synced)',
        };

        login(initialUser);
        await SupabaseSyncService.syncUserToSupabase(initialUser, token);
      } catch (err) {
        console.warn('Auto Supabase sync notice:', err);
      }
    }

    performSync();
  }, [clerkUser, isUserLoaded, getToken, login]);

  return { localUser, clerkUser };
}

export default useSupabaseSync;

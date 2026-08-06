import { useUser } from '@clerk/clerk-react';
import { User } from '@/types/auth';

export type ClerkUserResource = ReturnType<typeof useUser>['user'];

/**
 * Extracts and formats standardized User data object from Clerk UserResource
 */
export function extractUserFromClerk(clerkUser: NonNullable<ClerkUserResource>): User {
  const publicMeta = clerkUser.publicMetadata || {};
  const unsafeMeta = clerkUser.unsafeMetadata || {};

  const name = clerkUser.fullName ||
    (clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : '') ||
    clerkUser.primaryEmailAddress?.emailAddress.split('@')[0] ||
    'MedBot Patient';

  return {
    id: clerkUser.id,
    name,
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    avatar: clerkUser.imageUrl,
    role: (unsafeMeta.role as string) || (publicMeta.role as string) || 'patient',
    bloodGroup: (unsafeMeta.bloodGroup as string) || 'A+',
    age: (unsafeMeta.age as number) || 28,
    medicalId: (unsafeMeta.medicalId as string) || 'MC-792BD012',
    emergencyContact: (unsafeMeta.emergencyContact as string) || '+1 (555) 019-2834',
    conditions: (unsafeMeta.conditions as string[]) || ['Mild Asthma'],
    insuranceProvider: (unsafeMeta.insuranceProvider as string) || 'BlueCross Health',
    joinedDate: clerkUser.createdAt
      ? new Date(clerkUser.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'July 24, 2026',
    lastLogin: clerkUser.lastSignInAt
      ? new Date(clerkUser.lastSignInAt).toLocaleString()
      : 'Just Now',
    provider: clerkUser.externalAccounts.length > 0
      ? `OAuth (${clerkUser.externalAccounts[0].provider})`
      : 'Clerk Verified Email',
    theme: (publicMeta.theme as string) || 'MedBot Dark Navy',
  };
}

/**
 * Checks if a Clerk user's primary email address is already verified
 */
export function isEmailVerified(clerkUser: ClerkUserResource | null | undefined): boolean {
  if (!clerkUser) return false;
  return clerkUser.primaryEmailAddress?.verification?.status === 'verified';
}

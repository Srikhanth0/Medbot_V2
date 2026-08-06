/**
 * Helper to retrieve Clerk JWT session token for authenticated backend/Supabase API requests
 */
export async function getClerkJWTToken(getToken: (options?: { template?: string }) => Promise<string | null>): Promise<string | undefined> {
  try {
    const token = await getToken({ template: 'supabase' });
    return token || undefined;
  } catch (err) {
    console.warn('Failed to retrieve Clerk JWT token:', err);
    return undefined;
  }
}

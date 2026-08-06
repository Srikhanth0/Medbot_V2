/**
 * Clerk Authentication Utilities and Configuration Constants
 */

export const CLERK_CONFIG = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_aW50ZWdyYWwtdXJjaGluLTQ5LmNsZXJrLmFjY291bnRzLmRldiQ',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
  signInUrl: '/login',
  signUpUrl: '/signup',
};

export default CLERK_CONFIG;

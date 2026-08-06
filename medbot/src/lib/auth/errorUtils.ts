/**
 * Formats raw Clerk API errors into clear, user-friendly UI messages
 */
export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected authentication error occurred. Please try again.';

  const code = error.errors?.[0]?.code || error.code;
  const rawMessage = error.errors?.[0]?.longMessage || error.errors?.[0]?.message || error.message || '';

  // Part 4 & 11: Specific Clerk Error handling
  if (code === 'form_identifier_exists' || rawMessage.includes('already exists')) {
    return 'An account already exists with this email address. Please sign in instead.';
  }

  if (code === 'form_identifier_not_found' || rawMessage.includes('not found')) {
    return 'No account was found with this email address. Please check your spelling or sign up.';
  }

  if (code === 'form_password_incorrect' || rawMessage.includes('password')) {
    return 'The password you entered is incorrect. Please try again or reset your password.';
  }

  if (rawMessage.includes('already verified') || code === 'verification_already_completed') {
    return 'Your email address has already been verified. Redirecting you to your dashboard...';
  }

  if (code === 'verification_expired' || rawMessage.includes('expired')) {
    return 'Your verification link or code has expired. A new verification code has been sent to your email.';
  }

  if (code === 'verification_failed' || rawMessage.includes('invalid code')) {
    return 'The verification code you entered is invalid. Please check the code in your email and try again.';
  }

  if (rawMessage) {
    return rawMessage;
  }

  return 'Unable to complete request. Please verify your connection and try again.';
}

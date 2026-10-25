/**
 * User-Friendly Error Formatting Utility
 * Translates low-level network, authentication, or provider exceptions
 * into clear, merchant-oriented language.
 */

export function formatUserFriendlyError(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const rawMessage = error instanceof Error ? error.message : String(error);

  // Network / Offline errors
  if (
    rawMessage.includes('unavailable') ||
    rawMessage.includes('offline') ||
    rawMessage.includes('network') ||
    rawMessage.includes('the client is offline') ||
    rawMessage.includes('Failed to fetch')
  ) {
    return "You're offline. Changes will sync automatically when your connection returns.";
  }

  // Security & Permission errors
  if (
    rawMessage.includes('permission-denied') ||
    rawMessage.includes('Missing or insufficient permissions') ||
    rawMessage.includes('insufficient permissions') ||
    rawMessage.includes('PERMISSION_DENIED')
  ) {
    return "You don't have permission to perform this action.";
  }

  // Payment errors
  if (
    rawMessage.includes('payment') ||
    rawMessage.includes('declined') ||
    rawMessage.includes('gateway') ||
    rawMessage.includes('upi') ||
    rawMessage.includes('transaction failed')
  ) {
    return 'Payment could not be completed. Please verify your payment details and retry, or use an alternative payment mode.';
  }

  // Auth / Login errors
  if (
    rawMessage.includes('user-not-found') ||
    rawMessage.includes('wrong-password') ||
    rawMessage.includes('invalid-credential') ||
    rawMessage.includes('invalid-email')
  ) {
    return 'Incorrect phone number or password. Please verify your credentials and try again.';
  }

  if (rawMessage.includes('quota-exceeded') || rawMessage.includes('Quota exceeded')) {
    return 'System daily request limit reached. Please try again in a few moments.';
  }

  // If the error message is too long or contains stack traces/JSON, return a friendly fallback
  if (rawMessage.length > 140 || rawMessage.includes('{')) {
    return 'Something went wrong while processing your request. Please try again or check your connection.';
  }

  return rawMessage;
}

import crypto from 'crypto';

/**
 * Generates a privacy-preserving anonymous identifier for a student.
 * Never leaks student name, email, roll number, or internal database ID.
 */
export function getAnonymousAlias(userId: string, contextId?: string | null): string {
  // Use a secret salt combined with user ID and optional context so aliases
  // remain consistent within a room/topic while preventing correlation across different contexts
  const secret = process.env.ANONYMOUS_SALT || 'cc_anon_salt_9284';
  const seed = `${secret}:${userId}:${contextId || 'global'}`;
  const hash = crypto.createHash('sha256').update(seed).digest('hex');

  // Derive a 4-digit number between 1000 and 9999
  const num = (parseInt(hash.substring(0, 6), 16) % 9000) + 1000;

  return `Anonymous Student #${num}`;
}

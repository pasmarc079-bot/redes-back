/**
 * A JWT secret that anyone can read is the same as having no secret at all: with it, anyone can
 * sign a token for the administrator account. These are the values that must never reach production.
 */
export const WEAK_SECRETS = [
  'dev-secret-change-in-production',
  'REDES_CHANGE_ME',
  'CHANGE_ME',
  'secret',
  'redes',
];

export const MIN_SECRET_LENGTH = 32;

/** True when the secret is a random-looking value of enough length. */
export function isJwtSecretSecure(secret: string | undefined | null): boolean {
  if (!secret) return false;
  return !WEAK_SECRETS.includes(secret) && secret.length >= MIN_SECRET_LENGTH;
}

import { describe, it, expect } from 'vitest';
import { isJwtSecretSecure, WEAK_SECRETS, MIN_SECRET_LENGTH } from '../jwtSecret';

describe('isJwtSecretSecure', () => {
  it('rejects the example values that were in production', () => {
    for (const secret of WEAK_SECRETS) {
      expect(isJwtSecretSecure(secret), `debería rechazar "${secret}"`).toBe(false);
    }
    expect(isJwtSecretSecure('REDES_CHANGE_ME')).toBe(false);
  });

  it('rejects a secret that is too short', () => {
    expect(isJwtSecretSecure('a'.repeat(MIN_SECRET_LENGTH - 1))).toBe(false);
    expect(isJwtSecretSecure('corto')).toBe(false);
  });

  it('rejects a missing secret', () => {
    expect(isJwtSecretSecure(undefined)).toBe(false);
    expect(isJwtSecretSecure(null)).toBe(false);
    expect(isJwtSecretSecure('')).toBe(false);
  });

  it('accepts a random value of enough length', () => {
    expect(isJwtSecretSecure('a'.repeat(MIN_SECRET_LENGTH))).toBe(true);
    expect(isJwtSecretSecure('91195ab43d4a96a32c378e6d7fa9432dc85f49f1a3a56f2b22c4f57804682bed')).toBe(true);
  });
});

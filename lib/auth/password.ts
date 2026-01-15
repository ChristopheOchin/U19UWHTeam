/**
 * Password Utilities
 *
 * Handles password hashing and verification for team authentication
 */

import bcrypt from 'bcryptjs';

/**
 * Verify password against hashed password from environment variable
 */
export async function verifyPassword(password: string): Promise<boolean> {
  const hashedPassword = process.env.TEAM_PASSWORD_HASH;

  if (!hashedPassword) {
    console.error('TEAM_PASSWORD_HASH environment variable is not set');
    return false;
  }

  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Hash a password (use this to generate TEAM_PASSWORD_HASH)
 * Run: node -e "require('./lib/auth/password').hashPassword('your-password')"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Hashed password:', hash);
  console.log('Add this to your .env.local:');
  console.log(`TEAM_PASSWORD_HASH=${hash}`);
  return hash;
}

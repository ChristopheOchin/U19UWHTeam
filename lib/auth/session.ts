/**
 * Session Management
 *
 * Handles encrypted session cookies for team authentication
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'uwh_team_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Get the secret key for JWT signing
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Session payload
 */
export interface SessionPayload {
  authenticated: boolean;
  created_at: number;
  expires_at: number;
  [key: string]: unknown; // Index signature for JWT compatibility
}

/**
 * Create a new session
 */
export async function createSession(): Promise<string> {
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION;

  const payload: SessionPayload = {
    authenticated: true,
    created_at: now,
    expires_at: expiresAt,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(getSecretKey());

  return token;
}

/**
 * Verify a session token
 */
export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256'],
    });

    return payload as unknown as SessionPayload;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

/**
 * Set session cookie in response
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  });
}

/**
 * Get session from request
 */
export async function getSession(
  request: NextRequest
): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

/**
 * Get session from cookies (for Server Components)
 */
export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

/**
 * Clear session cookie
 */
export function clearSession(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(
  request: NextRequest
): Promise<boolean> {
  const session = await getSession(request);
  return session?.authenticated === true;
}

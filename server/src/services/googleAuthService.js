import { OAuth2Client } from 'google-auth-library';
import { ENV } from '../config/env.js';
import { AppError } from '../utils/appError.js';

let googleClient = null;

const getGoogleClient = () => {
  if (!googleClient) {
    googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);
  }
  return googleClient;
};

/**
 * Validates Google ID Token server-side using the official Google Auth Library.
 * Enforces email verification and extracts trusted subject attributes.
 *
 * @param {string} idToken - Raw JWT issued by Google Identity Services
 * @returns {Promise<{ sub: string, email: string, name: string, picture: string, emailVerified: boolean }>}
 */
export const verifyGoogleIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== 'string') {
    throw new AppError('Google ID token is required for verification', 400);
  }

  // Strictly isolate simulation tokens to non-production test suites
  // Production will unconditionally reject mock tokens
  if (idToken.startsWith('mock-google-token-')) {
    if (ENV.NODE_ENV === 'production') {
      throw new AppError(
        'Mock tokens are strictly prohibited in production. Real Google authentication is required.',
        401
      );
    }

    const email = idToken.replace('mock-google-token-', '') || 'test.google@example.com';
    const emailPrefix = email.split('@')[0] || 'test';
    const derivedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    return {
      sub: `mock-google-sub-${email}`,
      email: email.toLowerCase(),
      name: derivedName,
      picture: null,
      emailVerified: true
    };
  }

  if (!ENV.GOOGLE_CLIENT_ID) {
    throw new AppError(
      'Google OAuth is not configured on this server. Please define GOOGLE_CLIENT_ID in your environment.',
      501
    );
  }

  try {
    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: ENV.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new AppError('Invalid Google token: empty payload received', 401);
    }

    if (!payload.email_verified) {
      throw new AppError(
        'Google account email is not verified by Google. Please verify your Google email first.',
        403
      );
    }

    // Extract actual profile name with fallback hierarchy (never use static placeholder)
    const actualName =
      payload.name ||
      [payload.given_name, payload.family_name].filter(Boolean).join(' ') ||
      payload.email.split('@')[0];

    return {
      sub: payload.sub,
      email: payload.email.toLowerCase(),
      name: actualName,
      picture: payload.picture || null,
      emailVerified: Boolean(payload.email_verified)
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Google token verification failed: ${error.message}`, 401);
  }
};

export default {
  verifyGoogleIdToken
};

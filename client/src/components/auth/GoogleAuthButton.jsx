import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';

/**
 * GoogleAuthButton Component
 *
 * Implements Google Identity Services (GIS) with secure client-side
 * authentication and mandatory account chooser prompt.
 *
 * @param {Object} props
 * @param {'client' | 'freelancer'} [props.role='client'] - Role to assign if new user is created
 * @param {'continue_with' | 'signup_with' | 'signin_with'} [props.text='continue_with'] - Button text type
 * @param {(user: Object) => void} [props.onSuccess] - Callback when authentication succeeds
 * @param {(error: string) => void} [props.onError] - Callback on error
 * @param {boolean} [props.disabled=false] - Whether button interaction is disabled
 */
export const GoogleAuthButton = ({
  role = 'client',
  text = 'continue_with',
  onSuccess,
  onError,
  disabled = false
}) => {
  const containerRef = useRef(null);
  const { googleLogin } = useAuth();
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Handle successful credential from Google Identity Services
  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response || !response.credential) {
        onError?.('Google authentication did not provide a valid ID token. Please try again.');
        return;
      }

      setIsSubmitting(true);
      try {
        const user = await googleLogin({
          idToken: response.credential,
          role
        });
        if (onSuccess) {
          onSuccess(user);
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Google authentication failed';
        if (onError) {
          onError(message);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [googleLogin, role, onSuccess, onError]
  );

  // 1. Ensure Google Identity Services script is available
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setIsGsiLoaded(true);
      return;
    }

    const checkInterval = setInterval(() => {
      if (window.google?.accounts?.id) {
        setIsGsiLoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.google?.accounts?.id) {
        console.warn('[GoogleAuthButton] Google Identity Services script load timed out.');
      }
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, []);

  // 2. Initialize Google Identity Services and render button
  useEffect(() => {
    if (!isGsiLoaded || !clientId || !containerRef.current) return;

    try {
      // Configure account selection: disable auto-select so user can always choose account
      window.google.accounts.id.disableAutoSelect();

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true,
        context: text === 'signup_with' ? 'signup' : 'signin'
      });

      // Clear previous button render
      containerRef.current.innerHTML = '';

      // Determine width to fill the container nicely
      const containerWidth = containerRef.current.offsetWidth || 384;
      const buttonWidth = Math.max(240, Math.min(containerWidth, 400));

      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: text,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: buttonWidth
      });
    } catch (err) {
      console.error('[GoogleAuthButton] Failed to initialize Google button:', err);
    }
  }, [isGsiLoaded, clientId, text, handleCredentialResponse]);

  if (!clientId) {
    return (
      <div className="w-full mb-5 p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800 text-center">
        <p className="font-semibold mb-0.5">Google OAuth Not Configured</p>
        <p>Please define <code className="font-mono text-amber-900 font-bold">VITE_GOOGLE_CLIENT_ID</code> in <code className="font-mono">client/.env</code></p>
      </div>
    );
  }

  return (
    <div className="w-full mb-5 flex flex-col items-center">
      {/* Container where Google Identity Services renders the official iframe button */}
      <div
        ref={containerRef}
        className={`w-full flex justify-center [&>div]:w-full [&_iframe]:!w-full ${
          !isGsiLoaded || disabled || isSubmitting ? 'hidden' : 'block'
        }`}
      />

      {/* Fallback button shown while GSI SDK is loading or during submission */}
      {(!isGsiLoaded || disabled || isSubmitting) && (
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-surface-white border border-border text-content-muted text-sm font-medium rounded-md shadow-subtle opacity-70 cursor-not-allowed"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {isSubmitting
              ? 'Signing in with Google...'
              : text === 'signup_with'
              ? 'Sign up with Google'
              : 'Continue with Google'}
          </span>
        </button>
      )}

      {isSubmitting && (
        <span className="text-[11px] text-brand-600 font-medium mt-1.5 animate-pulse">
          Verifying your Google account with WorkBridge...
        </span>
      )}
    </div>
  );
};

export default GoogleAuthButton;

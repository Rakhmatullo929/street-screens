
import { paths } from 'src/routes/paths';

import baseAxios from 'src/utils/base-axios';

let expiredTimer: NodeJS.Timeout | null = null;

function jwtDecode(token: string) {
  try {
    if (!token || token.split('.').length !== 3) {
      throw new Error('Invalid token format');
    }

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

// ----------------------------------------------------------------------

export const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false;
  }

  const decoded = jwtDecode(accessToken);

  if (!decoded || !decoded.exp) {
    return false;
  }

  const currentTime = Date.now() / 1000;

  return decoded.exp > currentTime;
};

// ----------------------------------------------------------------------

export const tokenExpired = (exp: number) => {
  // Clear any existing timer to prevent memory leaks
  if (expiredTimer) {
    clearTimeout(expiredTimer);
    expiredTimer = null;
  }

  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  // Only set timer if token hasn't already expired
  if (timeLeft > 0) {
    expiredTimer = setTimeout(() => {
      console.warn('Token expired, redirecting to login...');

      sessionStorage.removeItem('accessToken');

      
      window.location.href = paths.auth.jwt.login;
    }, timeLeft);
  }
};

export const setSession = (accessToken: string | null) => {
  if (accessToken) {
    sessionStorage.setItem('accessToken', accessToken);

    baseAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    
    const decoded = jwtDecode(accessToken);
    if (decoded && decoded.exp) {
      tokenExpired(decoded.exp);
    }
  } else {
    sessionStorage.removeItem('accessToken');

    delete baseAxios.defaults.headers.common.Authorization;

    
    if (expiredTimer) {
      clearTimeout(expiredTimer);
      expiredTimer = null;
    }
  }
};

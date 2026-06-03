// Simple localStorage-based auth helpers
export const AUTH_KEY = 'oluso_auth';

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function login(): void {
  localStorage.setItem(AUTH_KEY, 'true');
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

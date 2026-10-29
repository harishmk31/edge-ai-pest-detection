// AgriVision AI — Authentication Client Service

import type { AuthResponse, User } from '../types';

const TOKEN_KEY = 'agrivision_auth_token';
const API_BASE = '/api/v1/auth';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to save auth token to localStorage:', e);
  }
}

export function removeStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to remove auth token from localStorage:', e);
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    let errorMsg = 'Registration failed';
    try {
      const data = await res.json();
      errorMsg = data.detail || errorMsg;
    } catch {
      errorMsg = `Server returned status ${res.status}`;
    }
    throw new Error(errorMsg);
  }

  const data: AuthResponse = await res.json();
  if (data.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let errorMsg = 'Invalid email or password';
    try {
      const data = await res.json();
      errorMsg = data.detail || errorMsg;
    } catch {
      errorMsg = `Server returned status ${res.status}`;
    }
    throw new Error(errorMsg);
  }

  const data: AuthResponse = await res.json();
  if (data.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        removeStoredToken();
      }
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn('Could not verify current user session:', err);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  removeStoredToken();
}

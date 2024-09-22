import { fetchPurchases } from './purchases.js';
import { displayUsername, hideLoading, showAppContent } from './ui.js';

export async function checkAuthAndInitialize() {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  try {
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Invalid token');
    }

    return true;
  } catch (error) {
    console.error('Auth error:', error);
    localStorage.removeItem('token');
    return false;
  }
}

export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

export function setupLogout() {
  document.getElementById('logout-button').addEventListener('click', logout);
}

export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  };

  return fetch(url, authOptions);
}

export async function login(username, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    // ... rest of the login logic ...
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}


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

export function setupLogout() {
  document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  });
}

export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return response;
}

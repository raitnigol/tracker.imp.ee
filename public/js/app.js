import { checkAuthAndInitialize, setupLogout } from './auth.js';
import { setupEventListeners } from './uiEventListeners.js';
import { fetchPurchases } from './purchases.js';
import { displayUsername, hideLoading, showAppContent } from './ui.js';

async function initializeApp() {
  console.log('Initializing app');
  const isAuthenticated = await checkAuthAndInitialize();
  console.log('Authentication check result:', isAuthenticated);

  if (isAuthenticated) {
    setupEventListeners();
    console.log('Setting up event listeners');
    setupLogout();
    console.log('Setting up logout');
    displayUsername();
    console.log('Displaying username');
    await fetchPurchases();
    console.log('Fetching purchases');
    hideLoading();
    console.log('Hiding loading screen');
    showAppContent();
    console.log('Showing app content');
  } else {
    console.log('Not authenticated, redirecting to login page');
    window.location.href = '/login';
  }
}

document.addEventListener('DOMContentLoaded', initializeApp);


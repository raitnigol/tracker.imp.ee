import { checkAuthAndInitialize, setupLogout } from './auth.js';
import { setupEventListeners, displayPurchases, hideLoading, showAppContent, displayUsername } from './ui.js';
import { fetchPurchases } from './purchases.js';

async function initializeApp() {
  try {
    console.log('Initializing app');
    const isAuthenticated = await checkAuthAndInitialize();
    console.log('Authentication check result:', isAuthenticated);
    if (isAuthenticated) {
      console.log('Setting up event listeners');
      setupEventListeners();
      console.log('Setting up logout');
      setupLogout();
      console.log('Displaying username');
      displayUsername();
      console.log('Fetching purchases');
      await fetchPurchases();
      console.log('Hiding loading screen');
      hideLoading();
      console.log('Showing app content');
      showAppContent();
    } else {
      console.log('Not authenticated, redirecting to login page');
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error initializing app:', error);
    hideLoading();
    document.body.innerHTML += '<p>An error occurred while initializing the app. Please try refreshing the page.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeApp().catch(error => {
    console.error('Unhandled error during app initialization:', error);
    hideLoading();
    document.body.innerHTML += '<p>An unexpected error occurred. Please try refreshing the page.</p>';
  });
});

import { setupEventListeners } from './uiEventListeners.js';
import { displayPurchases as displayPurchasesOriginal, openDeleteConfirmModal } from './uiPurchaseDisplay.js';
import { openModal, closeModal } from './uiModalHandling.js';
import { openViewItemsModal } from './uiItemsModal.js';

// Wrap the original displayPurchases function
function wrappedDisplayPurchases() {
  console.log('Calling displayPurchases from ui.js');
  displayPurchasesOriginal();
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

function showAppContent() {
  document.getElementById('app-content').classList.remove('hidden');
}

function displayUsername() {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('username-display').textContent = payload.username;
  }
}

// Export all functions in a single export statement
export {
  setupEventListeners,
  wrappedDisplayPurchases as displayPurchases,
  openDeleteConfirmModal,
  openModal,
  closeModal,
  openViewItemsModal,
  hideLoading,
  showAppContent,
  displayUsername
};



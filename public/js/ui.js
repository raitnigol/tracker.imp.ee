import { setupEventListeners } from './uiEventListeners.js';
import { displayPurchases, openDeleteConfirmModal } from './uiPurchaseDisplay.js';
import { openModal, closeModal, openViewItemsModal } from './uiModalHandling.js';

export {
  setupEventListeners,
  displayPurchases,
  openDeleteConfirmModal,
  openModal,
  closeModal,
  openViewItemsModal  // Add this line
};

export function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

export function showAppContent() {
  document.getElementById('app-content').classList.remove('hidden');
}

export function displayUsername() {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('username-display').textContent = payload.username;
  }
}

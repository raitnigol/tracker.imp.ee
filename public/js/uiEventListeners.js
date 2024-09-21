import { handlePurchaseSubmit, deletePurchase } from './purchases.js';
import { handleItemSubmit, markAsSold, markAsUnsold, deleteItem } from './items.js';
import { closeModal, openModal } from './uiModalHandling.js';

export function setupEventListeners() {
  document.getElementById('item-form').addEventListener('submit', handleItemSubmit);
  document.getElementById('confirm-delete').addEventListener('click', deletePurchase);
  document.getElementById('cancel-delete').addEventListener('click', () => closeModal('delete-confirm-modal'));

  window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
      closeModal(event.target.id);
    }
  };

  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => closeModal(closeBtn.closest('.modal').id));
  });

  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('mark-sold')) {
      markAsSold(e.target.getAttribute('data-item-id'));
    } else if (e.target.classList.contains('mark-unsold')) {
      markAsUnsold(e.target.getAttribute('data-item-id'));
    } else if (e.target.classList.contains('delete-item')) {
      deleteItem(e.target.getAttribute('data-item-id'));
    }
  });

  document.getElementById('add-purchase-btn').addEventListener('click', () => openModal('add-purchase-modal'));
  document.getElementById('cancel-add-purchase').addEventListener('click', () => closeModal('add-purchase-modal'));
  document.getElementById('purchase-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handlePurchaseSubmit(e);
    closeModal('add-purchase-modal');
  });
}

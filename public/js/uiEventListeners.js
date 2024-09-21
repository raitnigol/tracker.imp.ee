import { updateItem } from './items.js';
import { handlePurchaseSubmit, deletePurchase } from './purchases.js';
import { handleItemSubmit, markAsUnsold, deleteItem } from './items.js';
import { closeModal, openModal } from './uiModalHandling.js';

let itemToMarkAsSold = null;

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

  document.addEventListener('click', async function(e) {
    if (e.target.classList.contains('mark-sold')) {
      const itemId = e.target.dataset.itemId;
      const purchaseId = e.target.closest('li').dataset.purchaseId;
      console.log('Setting itemToMarkAsSold:', { itemId, purchaseId });
      itemToMarkAsSold = { itemId, purchaseId };
      openModal('mark-as-sold-modal');
    } else if (e.target.classList.contains('mark-unsold')) {
      const itemId = e.target.dataset.itemId;
      const purchaseId = e.target.closest('li').dataset.purchaseId;
      try {
        const updatedItem = await markAsUnsold(purchaseId, itemId);
        updateItemUI(e.target, 'Unsold');
      } catch (error) {
        console.error('Error marking item as unsold:', error);
        alert('Failed to mark item as unsold');
      }
    } else if (e.target.classList.contains('delete-item')) {
      deleteItem(e.target.getAttribute('data-item-id'));
    } else if (e.target.classList.contains('save-quick-edit')) {
      const itemId = e.target.getAttribute('data-item-id');
      const newName = e.target.parentElement.querySelector('.quick-edit-name').value;
      const newType = e.target.parentElement.querySelector('.quick-edit-type').value;
      const newPlatform = e.target.parentElement.querySelector('.quick-edit-platform').value;
      updateItem(itemId, { name: newName, type: newType, platform: newPlatform });
    }
  });

  document.getElementById('add-purchase-btn').addEventListener('click', () => openModal('add-purchase-modal'));
  document.getElementById('cancel-add-purchase').addEventListener('click', () => closeModal('add-purchase-modal'));
  document.getElementById('purchase-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handlePurchaseSubmit(e);
    closeModal('add-purchase-modal');
  });

  document.getElementById('cancel-add-item').addEventListener('click', () => closeModal('item-modal'));

  document.getElementById('mark-as-sold-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const soldForPrice = parseFloat(document.getElementById('sold-for-price').value);
    if (itemToMarkAsSold) {
      console.log('Updating item:', itemToMarkAsSold);
      try {
        const updatedItem = await updateItem(itemToMarkAsSold.purchaseId, itemToMarkAsSold.itemId, {
          status: 'Sold',
          soldFor: soldForPrice
        });
        console.log('Item updated successfully', updatedItem);
        closeModal('mark-as-sold-modal');
        
        // Update the UI
        const button = document.querySelector(`[data-item-id="${itemToMarkAsSold.itemId}"]`);
        updateItemUI(button, 'Sold', soldForPrice);
        
      } catch (error) {
        console.error('Error updating item:', error);
        alert('Failed to mark item as sold');
      }
    } else {
      console.error('No item selected for marking as sold');
    }
  });

  document.getElementById('cancel-mark-as-sold').addEventListener('click', () => {
    closeModal('mark-as-sold-modal');
  });
}

// Add this function to update the UI
function updateItemUI(button, newStatus, soldFor = null) {
  const listItem = button.closest('li');
  const statusElement = listItem.querySelector('.item-status');
  const soldForElement = listItem.querySelector('.item-sold-for');
  const iconElement = statusElement.querySelector('i');  // Get the icon element
  
  statusElement.innerHTML = `
    <div class="tooltip">
      <i class="fas ${newStatus === 'Sold' ? 'fa-check-circle' : 'fa-clock'}"></i>
      <span class="tooltiptext">${newStatus === 'Sold' ? 'Item sold' : 'Item not yet sold'}</span>
    </div>
    Status: ${newStatus}
  `;
  
  if (newStatus === 'Sold') {
    button.innerHTML = '<i class="fas fa-undo"></i> Mark as Unsold';
    button.classList.remove('mark-sold', 'primary');
    button.classList.add('mark-unsold', 'secondary');
    if (soldFor !== null) {
      if (soldForElement) {
        soldForElement.innerHTML = `<i class="fas fa-euro-sign"></i> Sold for: ${soldFor.toFixed(2)} €`;
      } else {
        const newSoldForElement = document.createElement('div');
        newSoldForElement.className = 'item-sold-for';
        newSoldForElement.innerHTML = `<i class="fas fa-euro-sign"></i> Sold for: ${soldFor.toFixed(2)} €`;
        statusElement.parentNode.insertBefore(newSoldForElement, statusElement.nextSibling);
      }
    }
  } else {
    button.innerHTML = '<i class="fas fa-check"></i> Mark as Sold';
    button.classList.remove('mark-unsold', 'secondary');
    button.classList.add('mark-sold', 'primary');
    if (soldForElement) {
      soldForElement.remove();
    }
  }
}


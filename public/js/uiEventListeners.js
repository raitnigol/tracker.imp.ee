import { handleItemSubmit, handleEditItem, handleDeleteItem, handleMarkAsSold } from './items.js';
import { markAsSold, markAsUnsold, deleteItem } from './itemOperations.js';
import { handlePurchaseSubmit, deletePurchase, getPurchaseToDelete, setPurchaseToDelete, purchases } from './purchases.js';
import { closeModal, openModal } from './uiModalHandling.js';
import { openViewItemsModal, updateViewItemsModalProfit } from './uiItemsModal.js';
import { displayPurchases, updateTotalProfit, createItemElement } from './uiPurchaseDisplay.js';
import { calculateProfit } from './utils.js';
import { fetchWithAuth } from './auth.js';

let itemToMarkAsSold = null;

export function setupEventListeners() {
  console.log('Setting up event listeners');

  // Add New Purchase button
  const addPurchaseBtn = document.getElementById('add-purchase-btn');
  if (addPurchaseBtn) {
    addPurchaseBtn.addEventListener('click', (e) => {
      console.log('Add New Purchase button clicked');
      e.preventDefault();
      openModal('add-purchase-modal');
    });
  } else {
    console.error('Add New Purchase button not found');
  }

  // Purchase form submission
  const purchaseForm = document.getElementById('purchase-form');
  if (purchaseForm) {
    purchaseForm.addEventListener('submit', async (e) => {
      console.log('Purchase form submitted');
      e.preventDefault();
      await handlePurchaseSubmit(e);
    });
  } else {
    console.error('Purchase form not found');
  }

  // Item form submission
  const itemForm = document.getElementById('add-item-form');
  if (itemForm) {
    itemForm.addEventListener('submit', handleItemSubmit);
  }

  // Add Item modal cancel button
  const cancelAddItemBtn = document.querySelector('#add-item-modal .cancel-button');
  if (cancelAddItemBtn) {
    cancelAddItemBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal('add-item-modal');
    });
  }

  // Close modal buttons
  const closeButtons = document.querySelectorAll('.close');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });

  // Cancel buttons
  const cancelButtons = document.querySelectorAll('[id$="-cancel"]');
  cancelButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });

  // Delete confirmation modal
  const deleteConfirmModal = document.getElementById('delete-confirm-modal');
  if (deleteConfirmModal) {
    const cancelDeleteBtn = deleteConfirmModal.querySelector('#cancel-delete');
    const confirmDeleteBtn = deleteConfirmModal.querySelector('#confirm-delete');

    cancelDeleteBtn.addEventListener('click', () => {
      closeModal('delete-confirm-modal');
    });

    confirmDeleteBtn.addEventListener('click', async () => {
      const purchaseToDelete = getPurchaseToDelete();
      if (purchaseToDelete) {
        try {
          await deletePurchase(purchaseToDelete);
          closeModal('delete-confirm-modal');
          displayPurchases();
        } catch (error) {
          console.error('Error deleting purchase:', error);
          alert('Failed to delete purchase: ' + error.message);
        }
      } else {
        console.error('No purchase selected for deletion');
      }
    });
  } else {
    console.error('Delete confirmation modal not found');
  }

  // Event delegation for mark as sold/unsold buttons
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('mark-sold') || e.target.classList.contains('mark-unsold')) {
      const itemId = e.target.dataset.itemId;
      const purchaseId = e.target.dataset.purchaseId;
      if (e.target.classList.contains('mark-sold')) {
        openModal('mark-as-sold-modal');
        itemToMarkAsSold = { itemId, purchaseId };
      } else {
        try {
          await markAsUnsold(purchaseId, itemId);
          // The UI update is now handled inside the markAsUnsold function
        } catch (error) {
          console.error('Error marking item as unsold:', error);
          alert('Failed to mark item as unsold. Please try again.');
        }
      }
    }
  });

  // Event listener for the mark as sold form submission
  document.getElementById('mark-as-sold-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const soldForPrice = parseFloat(document.getElementById('sold-for-price').value);
    if (isNaN(soldForPrice) || soldForPrice <= 0) {
      alert('Please enter a valid price.');
      return;
    }
    try {
      await markAsSold(itemToMarkAsSold.purchaseId, itemToMarkAsSold.itemId, soldForPrice);
      closeModal('mark-as-sold-modal');
      const itemCard = document.querySelector(`.item-card[data-item-id="${itemToMarkAsSold.itemId}"]`);
      if (itemCard) {
        const markSoldButton = itemCard.querySelector('.mark-sold, .mark-unsold');
        if (markSoldButton) {
          markSoldButton.textContent = 'Mark as Unsold';
          markSoldButton.classList.remove('mark-sold');
          markSoldButton.classList.add('mark-unsold');
        }
        const statusElement = itemCard.querySelector('.item-status');
        if (statusElement) {
          statusElement.textContent = `Status: Sold for ${soldForPrice} €`;
        }
      }
    } catch (error) {
      console.error('Error marking item as sold:', error);
      alert('Failed to mark item as sold. Please try again.');
    }
  });

  // Event delegation for delete item buttons
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-item-btn')) {
      const itemId = e.target.dataset.itemId;
      const purchaseId = e.target.dataset.purchaseId;
      if (confirm('Are you sure you want to delete this item?')) {
        try {
          await deleteItem(purchaseId, itemId);
          e.target.closest('.item-card').remove();
        } catch (error) {
          console.error('Error deleting item:', error);
          alert('Failed to delete item. Please try again.');
        }
      }
    }
  });

  // Event delegation for edit item buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-item')) {
      const itemCard = e.target.closest('.item-card');
      const itemId = itemCard.dataset.itemId;
      const purchaseId = itemCard.dataset.purchaseId;
      const purchase = purchases.find(p => p.id === parseInt(purchaseId));
      if (purchase) {
        const item = purchase.items.find(i => i.id === parseInt(itemId));
        if (item) {
          createQuickEditForm(itemCard, item, purchaseId);
        } else {
          console.error('Item not found');
        }
      } else {
        console.error('Purchase not found');
      }
    }
  });

  const addPurchaseModal = document.getElementById('add-purchase-modal');
  if (addPurchaseModal) {
    const cancelButton = addPurchaseModal.querySelector('#purchase-cancel');
    if (cancelButton) {
      cancelButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default button behavior
        closeModal('add-purchase-modal');
      });
    }
  }

  // Add New Purchase modal cancel button
  const cancelAddPurchaseBtn = document.getElementById('purchase-cancel');
  if (cancelAddPurchaseBtn) {
    cancelAddPurchaseBtn.addEventListener('click', (e) => {
      console.log('Cancel Add Purchase button clicked');
      e.preventDefault();
      closeModal('add-purchase-modal');
    });
  } else {
    console.error('Cancel button for Add New Purchase modal not found');
  }

  console.log('Event listeners set up');
}

function createQuickEditForm(itemCard, item, purchaseId) {
  const itemInfo = itemCard.querySelector('.item-info');
  const originalContent = itemInfo.innerHTML;

  const form = document.createElement('form');
  form.innerHTML = `
    <input type="text" name="name" value="${item.name}" required>
    <input type="text" name="type" value="${item.type}" required>
    <input type="text" name="platform" value="${item.platform}" required>
    <button type="submit">Save</button>
    <button type="button" class="cancel-edit">Cancel</button>
  `;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedItem = {
      ...item,
      name: form.name.value,
      type: form.type.value,
      platform: form.platform.value
    };
    try {
      const response = await fetchWithAuth(`/api/purchases/${purchaseId}/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      const updated = await response.json();
      itemInfo.innerHTML = originalContent;
      Object.assign(item, updated);
      const newItemElement = createItemElement(item, purchaseId);
      itemCard.replaceWith(newItemElement);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    }
  });

  form.querySelector('.cancel-edit').addEventListener('click', () => {
    itemInfo.innerHTML = originalContent;
  });

  itemInfo.innerHTML = '';
  itemInfo.appendChild(form);
}


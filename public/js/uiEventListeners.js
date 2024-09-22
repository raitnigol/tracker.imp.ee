import { updateItem, deleteItem, markAsSold, markAsUnsold } from './items.js';
import { handlePurchaseSubmit, deletePurchase, getPurchaseToDelete, setPurchaseToDelete, purchases } from './purchases.js';
import { closeModal, openModal } from './uiModalHandling.js';
import { displayPurchases } from './uiPurchaseDisplay.js';
import { handleItemSubmit } from './items.js';
import { calculateProfit } from './utils.js';
import { updateTotalProfit } from './uiPurchaseDisplay.js';

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
    itemForm.addEventListener('submit', async (e) => {
      console.log('Item form submitted');
      e.preventDefault();
      await handleItemSubmit(e);
    });
  } else {
    console.error('Item form not found');
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

  // Item actions
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('mark-sold') || e.target.classList.contains('mark-unsold')) {
      const itemId = e.target.dataset.itemId;
      const purchaseId = e.target.closest('li').dataset.purchaseId;
      
      if (e.target.classList.contains('mark-sold')) {
        openModal('mark-as-sold-modal');
        itemToMarkAsSold = { itemId, purchaseId };
      } else {
        try {
          await markAsUnsold(itemId, purchaseId);
          updateItemUI(e.target, 'Unsold');
          updatePurchaseProfit(purchaseId);
        } catch (error) {
          console.error('Error marking item as unsold:', error);
          alert('Failed to mark item as unsold: ' + error.message);
        }
      }
    } else if (e.target.classList.contains('edit-item')) {
      const listItem = e.target.closest('li');
      const infoElement = listItem.querySelector('.item-info');
      let editElement = listItem.querySelector('.item-quick-edit');
      
      if (!editElement) {
        editElement = createQuickEditForm(listItem);
        listItem.insertBefore(editElement, infoElement.nextSibling);
      }

      infoElement.style.display = 'none';
      editElement.style.display = 'block';
      e.target.style.display = 'none';
    } else if (e.target.classList.contains('save-quick-edit')) {
      const listItem = e.target.closest('li');
      const itemId = listItem.dataset.itemId;
      const purchaseId = listItem.dataset.purchaseId;
      const newName = listItem.querySelector('.quick-edit-name').value;
      const newType = listItem.querySelector('.quick-edit-type').value;
      const newPlatform = listItem.querySelector('.quick-edit-platform').value;

      try {
        const updatedItem = await updateItem(purchaseId, itemId, { name: newName, type: newType, platform: newPlatform });
        updateItemUIAfterEdit(listItem, updatedItem);
      } catch (error) {
        console.error('Error updating item:', error);
        alert('Failed to update item: ' + error.message);
      }
    } else if (e.target.classList.contains('delete-item-btn')) {
      const listItem = e.target.closest('li');
      const itemId = listItem.dataset.itemId;
      const purchaseId = listItem.dataset.purchaseId;

      if (confirm('Are you sure you want to delete this item?')) {
        try {
          await deleteItem(purchaseId, itemId);
          listItem.remove();
          // Update the items count in the purchase card
          updatePurchaseItemCount(purchaseId, itemId);
        } catch (error) {
          console.error('Error deleting item:', error);
          alert('Failed to delete item: ' + error.message);
        }
      }
    }
  });

  // Mark as sold form submission
  const markAsSoldForm = document.getElementById('mark-as-sold-form');
  if (markAsSoldForm) {
    markAsSoldForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const soldForPrice = parseFloat(document.getElementById('sold-for-price').value);
      
      if (itemToMarkAsSold) {
        try {
          await markAsSold(itemToMarkAsSold.itemId, itemToMarkAsSold.purchaseId, soldForPrice);
          closeModal('mark-as-sold-modal');
        } catch (error) {
          console.error('Error marking item as sold:', error);
          alert('Failed to mark item as sold: ' + error.message);
        }
      }
    });
  }

  const addPurchaseModal = document.getElementById('add-purchase-modal');
  if (addPurchaseModal) {
    const cancelButton = addPurchaseModal.querySelector('#purchase-cancel');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        closeModal('add-purchase-modal');
      });
    }
  }

  console.log('Event listeners set up');
}

export function updateItemUI(button, newStatus, soldFor = null) {
  const listItem = button.closest('li');
  if (!listItem) {
    console.error('Could not find list item');
    return;
  }

  const statusElement = listItem.querySelector('.item-status');
  let soldForElement = listItem.querySelector('.item-sold-for');
  const itemDetails = listItem.querySelector('.item-details');
  
  // Update status
  if (statusElement) {
    statusElement.innerHTML = `
      <i class="fas ${newStatus === 'Sold' ? 'fa-check-circle' : 'fa-clock'}"></i>
      Status: ${newStatus}
    `;
  }

  // Update sold for information
  if (newStatus === 'Sold' && soldFor !== null) {
    if (!soldForElement) {
      soldForElement = document.createElement('span');
      soldForElement.className = 'item-sold-for';
      itemDetails.appendChild(soldForElement);
    }
    soldForElement.textContent = `Sold for: ${soldFor.toFixed(2)} €`;
  } else if (soldForElement) {
    soldForElement.remove();
  }

  // Update button text and classes
  button.textContent = newStatus === 'Sold' ? 'Mark as Unsold' : 'Mark as Sold';
  button.classList.remove('mark-sold', 'mark-unsold', 'primary', 'secondary');
  button.classList.add(newStatus === 'Sold' ? 'mark-unsold' : 'mark-sold');
  button.classList.add(newStatus === 'Sold' ? 'secondary' : 'primary');

  // Ensure all buttons remain visible
  const allButtons = listItem.querySelectorAll('.item-actions button');
  allButtons.forEach(btn => btn.style.display = 'inline-block');

  // Update item data attribute
  listItem.dataset.status = newStatus;

  console.log(`Item UI updated. New status: ${newStatus}, Sold for: ${soldFor}`);
}

export function updateItemUIAfterEdit(itemElement, updatedItem) {
  console.log('Updating UI for item:', updatedItem);

  // Update name
  const nameElement = itemElement.querySelector('.item-name');
  if (nameElement) {
    nameElement.textContent = updatedItem.name;
  } else {
    console.warn('Name element not found');
  }

  // Update type
  const typeElement = itemElement.querySelector('.item-type');
  if (typeElement) {
    typeElement.textContent = updatedItem.type;
  } else {
    console.warn('Type element not found');
  }

  // Update platform
  const platformElement = itemElement.querySelector('.item-platform');
  if (platformElement) {
    platformElement.textContent = updatedItem.platform;
  } else {
    console.warn('Platform element not found');
  }

  // Hide edit form and show info
  const infoElement = itemElement.querySelector('.item-info');
  const editElement = itemElement.querySelector('.item-quick-edit');
  const editButton = itemElement.querySelector('.edit-item');

  if (infoElement) infoElement.style.display = 'block';
  if (editElement) editElement.style.display = 'none';
  if (editButton) editButton.style.display = 'inline-block';

  console.log('UI update complete');
}

function createQuickEditForm(listItem) {
  const editElement = document.createElement('div');
  editElement.className = 'item-quick-edit';
  editElement.innerHTML = `
    <input type="text" class="quick-edit-name" value="${listItem.querySelector('.item-name').textContent}">
    <input type="text" class="quick-edit-type" value="${listItem.querySelector('.item-type').textContent}">
    <input type="text" class="quick-edit-platform" value="${listItem.querySelector('.item-platform').textContent}">
    <button class="save-quick-edit">Save</button>
  `;
  return editElement;
}

function updatePurchaseItemCount(purchaseId, itemId) {
  const purchase = purchases.find(p => p.id === parseInt(purchaseId));
  if (purchase) {
    purchase.items = purchase.items.filter(item => item.id !== parseInt(itemId));
    const purchaseCard = document.querySelector(`.purchase-card[data-purchase-id="${purchaseId}"]`);
    if (purchaseCard) {
      const itemCountElement = purchaseCard.querySelector('.item-count');
      if (itemCountElement) {
        itemCountElement.textContent = `Items: ${purchase.items.length}`;
      }
    }
  }
}

export function updatePurchaseProfit(purchaseId) {
  const purchase = purchases.find(p => p.id === parseInt(purchaseId));
  if (purchase) {
    const profit = calculateProfit(purchase);
    
    // Update profit in the purchase card
    const profitElement = document.querySelector(`.purchase-card[data-purchase-id="${purchaseId}"] .purchase-profit`);
    if (profitElement) {
      profitElement.textContent = `Profit: ${profit.toFixed(2)} €`;
      profitElement.className = `purchase-profit ${profit >= 0 ? 'positive' : 'negative'}`;
    }
    
    // Update profit in the "Items in Purchase" modal
    const modalProfitElement = document.querySelector('#view-items-modal .modal-profit');
    if (modalProfitElement) {
      modalProfitElement.textContent = `Profit: ${profit.toFixed(2)} €`;
      modalProfitElement.className = `modal-profit ${profit >= 0 ? 'positive' : 'negative'}`;
    }
    
    // Update total profit
    updateTotalProfit();
  }
}

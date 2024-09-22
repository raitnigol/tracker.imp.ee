import { fetchWithAuth } from './auth.js';
import { purchases, getCurrentPurchase, setCurrentPurchase } from './purchases.js';
import { closeModal, displayPurchases } from './ui.js';
import { openViewItemsModal } from './uiModalHandling.js';
import { updatePurchaseProfit } from './uiEventListeners.js';
import { updateTotalProfit } from './uiPurchaseDisplay.js';
import { updatePurchaseCard } from './uiPurchaseDisplay.js';
import { updateViewItemsModalProfit } from './uiModalHandling.js';

export async function handleItemSubmit(e) {
  console.log('Handling item submit');
  e.preventDefault();

  const currentPurchase = getCurrentPurchase();
  if (!currentPurchase) {
    alert('Please select a purchase first.');
    return;
  }

  const itemType = document.getElementById('item-type').value;
  const itemPlatform = document.getElementById('item-platform').value;
  const itemName = document.getElementById('item-name').value;

  console.log('Submitting item:', { itemType, itemPlatform, itemName });

  try {
    const response = await fetchWithAuth(`/api/purchases/${currentPurchase.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: itemType,
        platform: itemPlatform,
        name: itemName,
        status: 'Unsold',
        soldFor: 0
      }),
    });

    console.log('Response received:', response);

    if (!response.ok) {
      throw new Error('Failed to add item');
    }

    const newItem = await response.json();
    console.log('New item added:', newItem);

    // Update the current purchase with the new item
    currentPurchase.items.push(newItem);
    
    // Update the purchases array
    const purchaseIndex = purchases.findIndex(p => p.id === currentPurchase.id);
    if (purchaseIndex !== -1) {
      purchases[purchaseIndex] = currentPurchase;
    }

    // Update the UI
    displayPurchases();
    closeModal('item-modal');
    document.getElementById('add-item-form').reset();
    
    // Show the updated items for the current purchase
    openViewItemsModal(currentPurchase);
    
    // Show a temporary "Add Another" button
    showAddAnotherButton();
  } catch (error) {
    console.error('Error adding item:', error);
    alert('Failed to add item: ' + error.message);
  }
}

function showAddAnotherButton() {
  const addAnotherBtn = document.createElement('button');
  addAnotherBtn.textContent = 'Add Another Item';
  addAnotherBtn.className = 'action-button secondary';
  addAnotherBtn.style.position = 'fixed';
  addAnotherBtn.style.bottom = '20px';
  addAnotherBtn.style.right = '20px';
  addAnotherBtn.addEventListener('click', () => {
    document.body.removeChild(addAnotherBtn);
    openModal('item-modal');
  });
  document.body.appendChild(addAnotherBtn);
  
  setTimeout(() => {
    if (document.body.contains(addAnotherBtn)) {
      document.body.removeChild(addAnotherBtn);
    }
  }, 5000);
}

export async function markAsSold(itemId, purchaseId, soldFor) {
  try {
    const response = await fetchWithAuth(`/api/purchases/${purchaseId}/items/${itemId}/mark-sold`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soldFor }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedItem = await response.json();
    
    // Update the item in the local purchases array
    const purchase = purchases.find(p => p.id === parseInt(purchaseId));
    if (purchase) {
      const item = purchase.items.find(i => i.id === parseInt(itemId));
      if (item) {
        item.status = 'Sold';
        item.soldFor = parseFloat(soldFor);
      }
    }

    // Update UI
    updateItemUIInModal(itemId, updatedItem);
    updatePurchaseCard(purchase);
    updateViewItemsModalProfit(purchase);
    updateTotalProfit();

    return updatedItem;
  } catch (error) {
    console.error('Error in markAsSold:', error);
    throw error;
  }
}

function updateItemUIInModal(itemId, updatedItem) {
  const itemElement = document.querySelector(`li[data-item-id="${itemId}"]`);
  if (itemElement) {
    const statusElement = itemElement.querySelector('.item-status');
    if (statusElement) {
      statusElement.innerHTML = `
        <i class="fas ${updatedItem.status === 'Sold' ? 'fa-check-circle' : 'fa-clock'}"></i>
        Status: ${updatedItem.status}
      `;
    }

    let soldForElement = itemElement.querySelector('.item-sold-for');
    if (updatedItem.status === 'Sold' && updatedItem.soldFor !== null) {
      if (!soldForElement) {
        soldForElement = document.createElement('span');
        soldForElement.className = 'item-sold-for';
        itemElement.querySelector('.item-details').appendChild(soldForElement);
      }
      soldForElement.textContent = `Sold for: ${updatedItem.soldFor.toFixed(2)} €`;
    } else if (soldForElement) {
      soldForElement.remove();
    }

    const actionButton = itemElement.querySelector('.action-button');
    if (actionButton) {
      if (updatedItem.status === 'Sold') {
        actionButton.textContent = 'Mark as Unsold';
        actionButton.className = 'action-button secondary mark-unsold';
      } else {
        actionButton.textContent = 'Mark as Sold';
        actionButton.className = 'action-button primary mark-sold';
      }
    }

    itemElement.dataset.status = updatedItem.status;
  }
}

export async function markAsUnsold(itemId, purchaseId) {
  try {
    const response = await fetchWithAuth(`/api/purchases/${purchaseId}/items/${itemId}/mark-unsold`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedItem = await response.json();
    
    // Update the item in the local purchases array
    const purchase = purchases.find(p => p.id === parseInt(purchaseId));
    if (purchase) {
      const item = purchase.items.find(i => i.id === parseInt(itemId));
      if (item) {
        item.status = 'Unsold';
        item.soldFor = null; // Ensure soldFor is set to null for unsold items
      }
    }

    // Update UI
    updateItemUIInModal(itemId, updatedItem);
    updatePurchaseCard(purchase);
    updateViewItemsModalProfit(purchase);
    updateTotalProfit();

    return updatedItem;
  } catch (error) {
    console.error('Error in markAsUnsold:', error);
    throw error;
  }
}

function updateItemUI(itemId, updatedItem) {
  const itemElement = document.querySelector(`li[data-item-id="${itemId}"]`);
  if (itemElement) {
    // Update status
    const statusElement = itemElement.querySelector('.item-status');
    if (statusElement) {
      statusElement.innerHTML = `
        <i class="fas ${updatedItem.status === 'Sold' ? 'fa-check-circle' : 'fa-clock'}"></i>
        Status: ${updatedItem.status}
      `;
    }

    // Update sold for information
    let soldForElement = itemElement.querySelector('.item-sold-for');
    if (updatedItem.status === 'Sold') {
      if (!soldForElement) {
        soldForElement = document.createElement('span');
        soldForElement.className = 'item-sold-for';
        itemElement.querySelector('.item-details').appendChild(soldForElement);
      }
      soldForElement.textContent = `Sold for: ${updatedItem.soldFor.toFixed(2)} €`;
    } else if (soldForElement) {
      soldForElement.remove();
    }

    // Update button
    const actionButton = itemElement.querySelector('.action-button');
    if (actionButton) {
      actionButton.textContent = updatedItem.status === 'Sold' ? 'Mark as Unsold' : 'Mark as Sold';
      actionButton.className = `action-button ${updatedItem.status === 'Sold' ? 'secondary mark-unsold' : 'primary mark-sold'}`;
    }
  }
}

export async function updateItem(purchaseId, itemId, updateData) {
  try {
    console.log(`Updating item: purchaseId=${purchaseId}, itemId=${itemId}`, updateData);
    const response = await fetchWithAuth(`/api/purchases/${purchaseId}/items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update item: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const updatedItem = await response.json();
    console.log('Item updated successfully:', updatedItem);
    return updatedItem;
  } catch (error) {
    console.error('Error in updateItem:', error);
    throw error;
  }
}

export async function deleteItem(purchaseId, itemId) {
  try {
    const response = await fetchWithAuth(`/api/purchases/${purchaseId}/items/${itemId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to delete item: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    // Remove the item from the local purchases array
    const purchase = purchases.find(p => p.id === parseInt(purchaseId));
    if (purchase) {
      purchase.items = purchase.items.filter(item => item.id !== parseInt(itemId));
    }

    return true;
  } catch (error) {
    console.error('Error in deleteItem:', error);
    throw error;
  }
}


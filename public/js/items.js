import { fetchWithAuth } from './auth.js';
import { fetchPurchases, getCurrentPurchase, setCurrentPurchase } from './purchases.js';
import { closeModal, displayPurchases } from './ui.js';
import { openViewItemsModal } from './uiModalHandling.js';  // Add this line

export async function handleItemSubmit(e) {
  e.preventDefault();

  const currentPurchase = getCurrentPurchase();
  if (!currentPurchase) {
    alert('Please select a purchase first.');
    return;
  }

  const itemType = document.getElementById('item-type').value;
  const itemPlatform = document.getElementById('item-platform').value;
  const itemName = document.getElementById('item-name').value;

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

  const newItem = await response.json();
  currentPurchase.items.push(newItem);
  await updatePurchaseAndDisplay();
  closeModal('item-modal');
  document.getElementById('item-form').reset();
  
  // Show a temporary "Add Another" button
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
  
  // Remove the "Add Another" button after 5 seconds
  setTimeout(() => {
    if (document.body.contains(addAnotherBtn)) {
      document.body.removeChild(addAnotherBtn);
    }
  }, 5000);
}

async function updatePurchaseAndDisplay() {
  await fetchPurchases();
  displayPurchases();
  const currentPurchase = getCurrentPurchase();
  if (currentPurchase) {
    openViewItemsModal(currentPurchase);
  }
}

export async function markAsSold(itemId) {
  const currentPurchase = getCurrentPurchase();
  const item = currentPurchase.items.find(item => item.id == itemId);
  
  if (!item) {
    console.error('Item not found');
    return;
  }

  const soldFor = prompt('Enter the selling price:', '0');
  if (soldFor === null) return; // User cancelled the prompt

  try {
    const response = await fetchWithAuth(`/api/purchases/${currentPurchase.id}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: item.name,
        type: item.type,
        platform: item.platform,
        status: 'Sold',
        soldFor: parseFloat(soldFor)
      }),
    });

    if (response.ok) {
      const updatedItem = await response.json();
      const itemIndex = currentPurchase.items.findIndex(item => item.id == itemId);
      if (itemIndex !== -1) {
        currentPurchase.items[itemIndex] = updatedItem;
      }
      await updatePurchaseAndDisplay();
      openViewItemsModal(currentPurchase);
    } else {
      console.error('Failed to update item');
    }
  } catch (error) {
    console.error('Error updating item:', error);
  }
}

export async function markAsUnsold(itemId) {
  const currentPurchase = getCurrentPurchase();
  try {
    const response = await fetchWithAuth(`/api/purchases/${currentPurchase.id}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Unsold', soldFor: 0 }),
    });
    if (response.ok) {
      const updatedItem = await response.json();
      const itemIndex = currentPurchase.items.findIndex(item => item.id == itemId);
      if (itemIndex !== -1) {
        currentPurchase.items[itemIndex] = updatedItem;
      }
      await updatePurchaseAndDisplay();
      openViewItemsModal(currentPurchase);
    } else {
      console.error('Failed to update item');
    }
  } catch (error) {
    console.error('Error updating item:', error);
  }
}

export async function deleteItem(itemId) {
  if (confirm("Are you sure you want to delete this item?")) {
    const currentPurchase = getCurrentPurchase();
    try {
      const response = await fetchWithAuth(`/api/purchases/${currentPurchase.id}/items/${itemId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        currentPurchase.items = currentPurchase.items.filter(item => item.id != itemId);
        await updatePurchaseAndDisplay();
        openViewItemsModal(currentPurchase);
      } else {
        console.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }
}

export async function updateItem(itemId, updates) {
  try {
    const currentPurchase = getCurrentPurchase();
    console.log('Sending update request:', updates);
    const response = await fetchWithAuth(`/api/purchases/${currentPurchase.id}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: updates.name,
        type: updates.type,
        platform: updates.platform,
        status: updates.status || 'Unsold',
        soldFor: updates.soldFor || 0
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update item: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const updatedItem = await response.json();
    console.log('Received updated item:', updatedItem);

    const itemIndex = currentPurchase.items.findIndex(item => item.id == itemId);
    if (itemIndex !== -1) {
      currentPurchase.items[itemIndex] = updatedItem;
    }
    await updatePurchaseAndDisplay();
    openViewItemsModal(currentPurchase);
  } catch (error) {
    console.error('Error updating item:', error);
    alert(`Failed to update item: ${error.message}`);
  }
}


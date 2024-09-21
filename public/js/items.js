import { fetchWithAuth } from './auth.js';
import { fetchPurchases, getCurrentPurchase, setCurrentPurchase } from './purchases.js';
import { closeModal, openViewItemsModal, displayPurchases } from './ui.js';

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
  closeModal();
  document.getElementById('item-form').reset();
}

async function updatePurchaseAndDisplay() {
  await fetchPurchases();
  displayPurchases();
}

export async function markAsSold(itemId) {
  const soldFor = prompt('Enter the selling price:');
  if (soldFor === null || soldFor === '') return;

  const currentPurchase = getCurrentPurchase();
  try {
    const response = await fetchWithAuth(`/api/purchases/${currentPurchase.id}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Sold', soldFor: parseFloat(soldFor) }),
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

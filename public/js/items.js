import { fetchWithAuth } from './auth.js';
import { purchases, getCurrentPurchase, setCurrentPurchase } from './purchases.js';
import { closeModal } from './uiModalHandling.js';
import { openViewItemsModal } from './uiItemsModal.js';
import { updateItem, deleteItem, markAsSold } from './itemOperations.js';
import { updatePurchaseProfit } from './uiPurchaseDisplay.js';

export async function addItem(purchaseId, itemData) {
  try {
    const response = await fetchWithAuth(`/api/purchases/${purchaseId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add item: ${response.status} ${response.statusText}`);
    }

    const newItem = await response.json();
    return newItem;
  } catch (error) {
    console.error('Error in addItem:', error);
    throw error;
  }
}

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
    const newItem = await addItem(currentPurchase.id, { 
      type: itemType, 
      platform: itemPlatform, 
      name: itemName,
      status: 'Unsold'  // Set a default status
    });
    console.log('New item added:', newItem);

    // Update the current purchase with the new item
    currentPurchase.items.push(newItem);
    setCurrentPurchase(currentPurchase);

    // Clear form fields
    document.getElementById('item-type').value = '';
    document.getElementById('item-platform').value = '';
    document.getElementById('item-name').value = '';

    closeModal('add-item-modal');
    openViewItemsModal(currentPurchase);
  } catch (error) {
    console.error('Error adding item:', error);
    alert('Failed to add item. Please try again.');
  }
}

export async function handleEditItem(e) {
  e.preventDefault();
  const itemId = document.getElementById('edit-item-id').value;
  const purchaseId = document.getElementById('edit-item-purchase-id').value;
  const itemName = document.getElementById('edit-item-name').value;
  const itemType = document.getElementById('edit-item-type').value;
  const itemPlatform = document.getElementById('edit-item-platform').value;

  try {
    const updatedItem = await updateItem(purchaseId, itemId, {
      name: itemName,
      type: itemType,
      platform: itemPlatform
    });

    console.log('Item updated:', updatedItem);
    closeModal('edit-item-modal');
    openViewItemsModal(purchases.find(p => p.id === parseInt(purchaseId)));
  } catch (error) {
    console.error('Error updating item:', error);
    alert('Failed to update item. Please try again.');
  }
}

export async function handleDeleteItem(purchaseId, itemId) {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await deleteItem(purchaseId, itemId);
      console.log('Item deleted successfully');
      openViewItemsModal(purchases.find(p => p.id === parseInt(purchaseId)));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  }
}

export async function handleMarkAsSold(e) {
  e.preventDefault();
  const itemId = document.getElementById('mark-as-sold-item-id').value;
  const purchaseId = document.getElementById('mark-as-sold-purchase-id').value;
  const soldForPrice = parseFloat(document.getElementById('sold-for-price').value);

  if (isNaN(soldForPrice) || soldForPrice <= 0) {
    alert('Please enter a valid price.');
    return;
  }

  try {
    const updatedItem = await markAsSold(purchaseId, itemId, soldForPrice);
    console.log('Item marked as sold:', updatedItem);
    closeModal('mark-as-sold-modal');
    openViewItemsModal(purchases.find(p => p.id === parseInt(purchaseId)));
  } catch (error) {
    console.error('Error marking item as sold:', error);
    alert('Failed to mark item as sold. Please try again.');
  }
}

import { fetchWithAuth } from './auth.js';
import { purchases, updatePurchase } from './purchases.js';
import { updatePurchaseCard, updateTotalProfit } from './uiPurchaseDisplay.js';

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
      const errorData = await response.json();
      throw new Error(`Failed to add item: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const newItem = await response.json();
    const purchase = purchases.find(p => p.id === parseInt(purchaseId));
    if (purchase) {
      purchase.items.push(newItem);
      updatePurchaseCard(purchase);
      updateTotalProfit();
      updateViewItemsModalProfit(purchase);
    }
    return newItem;
  } catch (error) {
    console.error('Error in addItem:', error);
    throw error;
  }
}

export async function updateItem(purchaseId, itemId, updatedData) {
    try {
      const response = await fetchWithAuth(`/api/purchases/${purchaseId}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update item: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
      }
  
      const updatedItem = await response.json();
      const purchase = purchases.find(p => p.id === parseInt(purchaseId));
      if (purchase) {
        const itemIndex = purchase.items.findIndex(item => item.id === parseInt(itemId));
        if (itemIndex !== -1) {
          purchase.items[itemIndex] = updatedItem;
          updatePurchaseCard(purchase);
          updateTotalProfit();
          updateViewItemsModalProfit(purchase);
        }
      }
      return updatedItem;
    } catch (error) {
      console.error('Error in updateItem:', error);
      throw error;
    }
  }

export async function deleteItem(purchaseId, itemId) {
  if (!purchaseId) {
    console.error('Purchase ID is undefined');
    throw new Error('Purchase ID is undefined');
  }
  try {
    const response = await fetchWithAuth(`/api/purchases/${purchaseId}/items/${itemId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to delete item: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    // Remove the item from the purchase
    const purchase = purchases.find(p => p.id === parseInt(purchaseId));
    if (purchase) {
      purchase.items = purchase.items.filter(item => item.id !== parseInt(itemId));
      updatePurchase(purchase);
      updatePurchaseCard(purchase);
      updateTotalProfit();
    }
  } catch (error) {
    console.error('Error in deleteItem:', error);
    throw error;
  }
}

export async function markAsSold(purchaseId, itemId, soldFor) {
  if (!purchaseId) {
    console.error('Purchase ID is undefined');
    throw new Error('Purchase ID is undefined');
  }
  try {
    const response = await fetchWithAuth(`/api/purchases/${purchaseId}/items/${itemId}/mark-sold`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ soldFor }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to mark item as sold: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const updatedItem = await response.json();
    updatePurchaseWithUpdatedItem(purchaseId, updatedItem);
    return updatedItem;
  } catch (error) {
    console.error('Error in markAsSold:', error);
    throw error;
  }
}

export async function markAsUnsold(purchaseId, itemId) {
  if (!purchaseId) {
    console.error('Purchase ID is undefined');
    throw new Error('Purchase ID is undefined');
  }
  try {
    const response = await fetchWithAuth(`/api/purchases/${purchaseId}/items/${itemId}/mark-unsold`, {
      method: 'PUT',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to mark item as unsold: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const updatedItem = await response.json();
    updatePurchaseWithUpdatedItem(purchaseId, updatedItem);

    // Update the button color, text, and status
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    if (itemElement) {
      const button = itemElement.querySelector('.mark-unsold');
      if (button) {
        button.textContent = 'Mark as Sold';
        button.classList.remove('secondary', 'mark-unsold');
        button.classList.add('primary', 'mark-sold');
      }
      const statusElement = itemElement.querySelector('.item-status');
      if (statusElement) {
        statusElement.textContent = 'Status: Unsold';
      }
      // Remove the "Sold for" text
      const soldForElement = itemElement.querySelector('.sold-for');
      if (soldForElement) {
        soldForElement.remove();
      }
    }

    return updatedItem;
  } catch (error) {
    console.error('Error in markItemAsUnsold:', error);
    throw error;
  }
}

function updatePurchaseWithUpdatedItem(purchaseId, updatedItem) {
  const purchase = purchases.find(p => p.id === parseInt(purchaseId));
  if (purchase) {
    const itemIndex = purchase.items.findIndex(item => item.id === updatedItem.id);
    if (itemIndex !== -1) {
      purchase.items[itemIndex] = updatedItem;
      updatePurchase(purchase);
      updatePurchaseCard(purchase);
      updateTotalProfit();
    }
  }
}

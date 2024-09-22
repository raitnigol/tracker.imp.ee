import { fetchWithAuth } from './auth.js';
import { displayPurchases, updateTotalProfit } from './uiPurchaseDisplay.js';
import { updatePaginationAfterDelete } from './pagination.js';
import { closeModal } from './uiModalHandling.js';

export let purchases = [];
let purchaseToDelete = null;
let currentPurchase = null;

export function setPurchaseToDelete(purchase) {
  purchaseToDelete = purchase;
}

export function getPurchaseToDelete() {
  return purchaseToDelete;
}

export function setCurrentPurchase(purchase) {
  currentPurchase = purchase;
}

export function getCurrentPurchase() {
  return currentPurchase;
}

export async function fetchPurchases() {
  try {
    const response = await fetchWithAuth('/api/purchases');
    if (!response.ok) {
      throw new Error('Failed to fetch purchases');
    }
    purchases = await response.json();
    displayPurchases();
    updateTotalProfit();
  } catch (error) {
    console.error('Error fetching purchases:', error);
  }
}

export async function addPurchase(purchaseData) {
  try {
    const response = await fetchWithAuth('/api/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchaseData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add purchase: ${response.status} ${response.statusText}`);
    }

    const newPurchase = await response.json();
    purchases.push(newPurchase);
    return newPurchase;
  } catch (error) {
    console.error('Error in addPurchase:', error);
    throw error;
  }
}

export async function updatePurchase(updatedPurchase) {
  try {
    const response = await fetchWithAuth(`/api/purchases/${updatedPurchase.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedPurchase),
    });

    if (!response.ok) {
      throw new Error('Failed to update purchase');
    }

    const index = purchases.findIndex(p => p.id === updatedPurchase.id);
    if (index !== -1) {
      purchases[index] = updatedPurchase;
      displayPurchases();
      updateTotalProfit();
    }
  } catch (error) {
    console.error('Error updating purchase:', error);
    throw error;
  }
}

export async function deletePurchase(purchaseId) {
  try {
    const response = await fetchWithAuth(`/api/purchases/${purchaseId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete purchase');
    }

    purchases = purchases.filter(p => p.id !== purchaseId);
    displayPurchases();
    updateTotalProfit();
    updatePaginationAfterDelete(purchases.length);
  } catch (error) {
    console.error('Error deleting purchase:', error);
    throw error;
  }
}

export async function handlePurchaseSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('purchase-name').value;
  const price = parseFloat(document.getElementById('purchase-price').value);

  if (!name || isNaN(price)) {
    alert('Please enter a valid name and price.');
    return;
  }

  try {
    await addPurchase({ name, price });
    document.getElementById('purchase-form').reset();
    closeModal('add-purchase-modal'); // Add this line
    displayPurchases(); // Add this line to refresh the purchases list
  } catch (error) {
    alert('Failed to add purchase. Please try again.');
  }
}



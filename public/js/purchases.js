import { fetchWithAuth } from './auth.js';
import { displayPurchases, closeModal } from './ui.js';
import { setCurrentPage, updatePaginationAfterDelete } from './pagination.js';
import { calculateProfit } from './utils.js';

export let purchases = [];
let currentPurchase = null;
let purchaseToDelete = null;

export function setCurrentPurchase(purchase) {
  currentPurchase = purchase;
}

export function getCurrentPurchase() {
  return currentPurchase;
}

export function setPurchaseToDelete(purchase) {
  purchaseToDelete = purchase;
  console.log('Set purchaseToDelete:', purchaseToDelete);
}

export function getPurchaseToDelete() {
  console.log('Get purchaseToDelete:', purchaseToDelete);
  return purchaseToDelete;
}

export async function fetchPurchases() {
  console.log('Fetching purchases...');
  try {
    const response = await fetchWithAuth('/api/purchases');
    console.log('Fetch response:', response);
    if (!response.ok) {
      throw new Error(`Failed to fetch purchases: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Fetched purchases data:', data);
    purchases = data;
    console.log('Updated purchases array:', purchases);
    displayPurchases();
  } catch (error) {
    console.error('Error fetching purchases:', error);
    alert('Failed to fetch purchases. Please try refreshing the page.');
  }
}

export async function handlePurchaseSubmit(e) {
  e.preventDefault();
  const purchaseName = document.getElementById('purchase-name').value;
  const purchasePrice = document.getElementById('purchase-price').value;

  console.log('Submitting new purchase:', { name: purchaseName, price: purchasePrice });

  try {
    const response = await fetchWithAuth('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: purchaseName, price: parseFloat(purchasePrice) }),
    });

    console.log('Purchase submission response:', response);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error data:', errorData);
      throw new Error(`Failed to add purchase: ${response.status} ${response.statusText}`);
    }

    const newPurchase = await response.json();
    console.log('New purchase added:', newPurchase);

    purchases.push(newPurchase);
    console.log('Updated purchases array:', purchases);

    displayPurchases();
    document.getElementById('purchase-form').reset();
    closeModal('add-purchase-modal');
  } catch (error) {
    console.error('Error adding purchase:', error);
    alert('Failed to add purchase: ' + error.message);
  }
}

export async function deletePurchase(purchaseId) {
  console.log('deletePurchase called with ID:', purchaseId);
  try {
    const response = await fetchWithAuth(`/api/purchases/${purchaseId}`, {
      method: 'DELETE',
    });

    console.log('Delete request sent, response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to delete purchase: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    // Remove the deleted purchase from the local array
    purchases = purchases.filter(purchase => purchase.id !== purchaseId);

    console.log('Purchase deleted successfully, remaining purchases:', purchases.length);
    return true;
  } catch (error) {
    console.error('Error in deletePurchase:', error);
    throw error;
  }
}


import { fetchWithAuth } from './auth.js';
import { displayPurchases, closeModal, updatePaginationAfterDelete, setCurrentPage } from './ui.js';

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
}

export function getPurchaseToDelete() {
  return purchaseToDelete;
}

export async function fetchPurchases() {
  try {
    const response = await fetchWithAuth('/api/purchases');
    if (!response.ok) {
      throw new Error('Failed to fetch purchases');
    }
    purchases = await response.json();
    console.log('Fetched purchases:', purchases);
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

  try {
    const response = await fetchWithAuth('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: purchaseName, price: parseFloat(purchasePrice) }),
    });

    if (!response.ok) {
      throw new Error('Failed to add purchase');
    }

    const newPurchase = await response.json();
    purchases.push(newPurchase);
    displayPurchases();
    document.getElementById('purchase-form').reset();
    closeModal('add-purchase-modal');
  } catch (error) {
    console.error('Error adding purchase:', error);
    alert('Failed to add purchase. Please try again.');
  }
}

export async function deletePurchase() {
  if (purchaseToDelete) {
    try {
      const response = await fetchWithAuth(`/api/purchases/${purchaseToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete purchase');
      }
      
      purchases = purchases.filter(purchase => purchase.id !== purchaseToDelete.id);
      const newCurrentPage = updatePaginationAfterDelete(purchases.length);
      setCurrentPage(newCurrentPage);
      displayPurchases();
      closeModal('delete-confirm-modal');
      purchaseToDelete = null;
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert(`Failed to delete purchase: ${error.message}`);
    }
  }
}

export function calculateProfit(purchase) {
  const totalCost = purchase.price;
  const totalRevenue = purchase.items.reduce((sum, item) => {
    return sum + (item.status === 'Sold' ? item.soldFor : 0);
  }, 0);
  const profit = totalRevenue - totalCost;
  console.log(`Calculating profit for ${purchase.name}: Revenue ${totalRevenue} - Cost ${totalCost} = Profit ${profit}`);
  return profit;
}

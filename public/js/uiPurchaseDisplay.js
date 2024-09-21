import { purchases, calculateProfit, setCurrentPurchase, setPurchaseToDelete } from './purchases.js';
import { updatePagination, itemsPerPage, getCurrentPage } from './pagination.js';
import { openModal, openViewItemsModal } from './uiModalHandling.js';  // Add openViewItemsModal here

export function displayPurchases() {
  const purchaseList = document.getElementById('purchase-list');
  purchaseList.innerHTML = '';

  const totalPages = Math.ceil(purchases.length / itemsPerPage);
  const startIndex = (getCurrentPage() - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const purchasesToDisplay = purchases.slice(startIndex, endIndex);

  if (purchases.length === 0) {
    purchaseList.innerHTML = '<p>No purchases found.</p>';
  } else {
    purchasesToDisplay.forEach(purchase => {
      const purchaseElement = createPurchaseCard(purchase, calculateProfit(purchase));
      purchaseList.appendChild(purchaseElement);
    });
  }

  updatePagination(getCurrentPage(), totalPages);
  updateTotalProfitDisplay(calculateTotalProfit());
}

function createPurchaseCard(purchase, profit) {
  const card = document.createElement('div');
  card.className = 'purchase-card';
  card.innerHTML = `
    <h3>${purchase.name}</h3>
    <p>Price: ${purchase.price.toFixed(2)} €</p>
    <p>Items: ${purchase.items.length}</p>
    <p>Profit: <span class="${profit >= 0 ? 'profit' : 'loss'}">${profit.toFixed(2)} €</span></p>
  `;

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';

  const viewItemsBtn = document.createElement('button');
  viewItemsBtn.textContent = 'View Items';
  viewItemsBtn.className = 'action-button';
  viewItemsBtn.addEventListener('click', () => {
    setCurrentPurchase(purchase);
    openViewItemsModal(purchase);
  });

  const addItemBtn = document.createElement('button');
  addItemBtn.textContent = 'Add New Item';
  addItemBtn.className = 'action-button';
  addItemBtn.addEventListener('click', () => {
    setCurrentPurchase(purchase);
    openModal('item-modal');
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'action-button delete-button';
  deleteBtn.addEventListener('click', () => openDeleteConfirmModal(purchase));

  buttonContainer.appendChild(viewItemsBtn);
  buttonContainer.appendChild(addItemBtn);
  buttonContainer.appendChild(deleteBtn);

  card.appendChild(buttonContainer);

  return card;
}

function calculateTotalProfit() {
  return purchases.reduce((total, purchase) => total + calculateProfit(purchase), 0);
}

function updateTotalProfitDisplay(totalProfit) {
  const totalProfitElement = document.getElementById('total-profit');
  const profitClass = totalProfit >= 0 ? 'profit' : 'loss';
  totalProfitElement.innerHTML = `Total Profit: <span class="${profitClass}">${totalProfit.toFixed(2)} €</span>`;
}

export function openDeleteConfirmModal(purchase) {
  setPurchaseToDelete(purchase);
  openModal('delete-confirm-modal');
}

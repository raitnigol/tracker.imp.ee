import { purchases, calculateProfit, setCurrentPurchase, setPurchaseToDelete } from './purchases.js';
import { updatePagination, itemsPerPage, getCurrentPage } from './pagination.js';
import { openModal, openViewItemsModal } from './uiModalHandling.js';  // Add openViewItemsModal here

export function displayPurchases() {
  const purchaseList = document.getElementById('purchase-list');
  purchaseList.innerHTML = '';

  const purchasesGrid = document.createElement('div');
  purchasesGrid.className = 'purchases-grid';

  const totalPages = Math.ceil(purchases.length / itemsPerPage);
  const startIndex = (getCurrentPage() - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const purchasesToDisplay = purchases.slice(startIndex, endIndex);

  // Always create 4 card slots
  for (let i = 0; i < 4; i++) {
    if (i < purchasesToDisplay.length) {
      const purchaseElement = createPurchaseCard(purchasesToDisplay[i], calculateProfit(purchasesToDisplay[i]));
      purchasesGrid.appendChild(purchaseElement);
    } else {
      const placeholderCard = createPlaceholderCard();
      purchasesGrid.appendChild(placeholderCard);
    }
  }

  purchaseList.appendChild(purchasesGrid);
  updatePagination(getCurrentPage(), totalPages);
  updateTotalProfitDisplay(calculateTotalProfit());
}

function createPurchaseCard(purchase, profit) {
  const card = document.createElement('div');
  card.className = 'purchase-card';

  const header = document.createElement('div');
  header.className = 'purchase-header';
  header.innerHTML = `<h3>${purchase.name}</h3>`;

  const info = document.createElement('div');
  info.className = 'purchase-info';
  info.innerHTML = `
    <p>Price: ${purchase.price.toFixed(2)} €</p>
    <p>Items: ${purchase.items.length}</p>
  `;

  const profitElement = document.createElement('div');
  profitElement.className = `purchase-profit ${profit >= 0 ? 'profit-positive' : 'profit-negative'}`;
  profitElement.textContent = `Profit: ${profit.toFixed(2)} €`;

  const actions = document.createElement('div');
  actions.className = 'purchase-actions';

  const viewItemsBtn = createButton('View Items', 'primary', () => {
    setCurrentPurchase(purchase);
    openViewItemsModal(purchase);
  });

  const addItemBtn = createButton('Add Item', 'secondary', () => {
    setCurrentPurchase(purchase);
    openModal('item-modal');
  });

  const deleteBtn = createButton('Delete', 'delete', () => openDeleteConfirmModal(purchase));

  actions.appendChild(viewItemsBtn);
  actions.appendChild(addItemBtn);
  actions.appendChild(deleteBtn);

  card.appendChild(header);
  card.appendChild(info);
  card.appendChild(profitElement);
  card.appendChild(actions);

  return card;
}

function createButton(text, className, onClick) {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = `action-button ${className}`;
  button.addEventListener('click', onClick);
  return button;
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

function createPlaceholderCard() {
  const card = document.createElement('div');
  card.className = 'purchase-card placeholder';
  card.textContent = 'No purchase';
  return card;
}

import { calculateProfit } from './utils.js';
import { purchases, setPurchaseToDelete, setCurrentPurchase } from './purchases.js';
import { openModal } from './uiModalHandling.js';
import { openViewItemsModal } from './uiItemsModal.js';
import { updatePagination, getCurrentPage, itemsPerPage } from './pagination.js';

export function displayPurchases() {
  console.log('Displaying purchases. Total purchases:', purchases.length);
  const purchaseList = document.getElementById('purchase-list');
  if (!purchaseList) {
    console.error('Purchase list element not found');
    return;
  }
  purchaseList.innerHTML = '';

  const purchasesGrid = document.createElement('div');
  purchasesGrid.className = 'purchases-grid';

  const totalPages = Math.ceil(purchases.length / itemsPerPage);
  const startIndex = (getCurrentPage() - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const purchasesToDisplay = purchases.slice(startIndex, endIndex);

  console.log('Purchases to display:', purchasesToDisplay);

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
  updateTotalProfit();
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
  profitElement.className = `purchase-profit ${profit >= 0 ? 'positive' : 'negative'}`;
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

  const deleteBtn = createButton('Delete', 'delete', () => openDeleteConfirmModal(purchase.id));

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

export function openDeleteConfirmModal(purchaseId) {
  setPurchaseToDelete(purchaseId);
  openModal('delete-confirm-modal');
}

function createPlaceholderCard() {
  const card = document.createElement('div');
  card.className = 'purchase-card placeholder';
  card.textContent = 'No purchase';
  return card;
}

export function createItemElement(item, purchaseId) {
  const itemElement = document.createElement('div');
  itemElement.className = 'item-card';
  itemElement.dataset.itemId = item.id;
  itemElement.dataset.purchaseId = purchaseId;  // Add this line

  itemElement.innerHTML = `
    <div class="item-info">
      <h4>${item.name}</h4>
      <p>Type: ${item.type}</p>
      <p>Platform: ${item.platform}</p>
      <p class="item-status">Status: ${item.status || 'Unsold'}</p>
      ${item.soldFor ? `<p>Sold for: ${item.soldFor} €</p>` : ''}
    </div>
    <div class="item-actions">
      <button class="action-button ${item.status === 'Sold' ? 'secondary mark-unsold' : 'primary mark-sold'}" data-item-id="${item.id}" data-purchase-id="${purchaseId}">
        ${item.status === 'Sold' ? 'Mark as Unsold' : 'Mark as Sold'}
      </button>
      <button class="action-button secondary edit-item" data-item-id="${item.id}" data-purchase-id="${purchaseId}">Edit</button>
      <button class="action-button delete delete-item-btn" data-item-id="${item.id}" data-purchase-id="${purchaseId}">Delete</button>
    </div>
  `;

  return itemElement;
}

export function updateTotalProfit() {
  const totalProfit = calculateTotalProfit();
  const totalProfitAmount = document.getElementById('total-profit-amount');
  if (totalProfitAmount) {
    totalProfitAmount.textContent = `${totalProfit.toFixed(2)} €`;
    
    // Remove all existing classes
    totalProfitAmount.className = '';
    
    // Add the appropriate class based on the profit value
    if (totalProfit > 0) {
      totalProfitAmount.classList.add('positive');
    } else if (totalProfit < 0) {
      totalProfitAmount.classList.add('negative');
    } else {
      totalProfitAmount.classList.add('neutral');
    }
  }
}

export function updatePurchaseCard(purchase) {
  const profit = calculateProfit(purchase);
  const card = document.querySelector(`.purchase-card[data-purchase-id="${purchase.id}"]`);
  if (card) {
    const profitElement = card.querySelector('.purchase-profit');
    if (profitElement) {
      profitElement.className = `purchase-profit ${profit >= 0 ? 'positive' : 'negative'}`;
      profitElement.textContent = `Profit: ${profit.toFixed(2)} €`;
    }
    const itemsCountElement = card.querySelector('.purchase-info p:nth-child(2)');
    if (itemsCountElement) {
      itemsCountElement.textContent = `Items: ${purchase.items.length}`;
    }
  }
}

export function updatePurchaseProfit(purchase) {
  const profit = calculateProfit(purchase);
  const purchaseCard = document.querySelector(`[data-purchase-id="${purchase.id}"]`);
  if (purchaseCard) {
    const profitElement = purchaseCard.querySelector('.purchase-profit');
    if (profitElement) {
      profitElement.textContent = `Profit: ${profit.toFixed(2)} €`;
      profitElement.className = `purchase-profit ${profit >= 0 ? 'positive' : 'negative'}`;
    }
  }
}



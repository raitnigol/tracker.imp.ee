import { purchases, setCurrentPurchase, setPurchaseToDelete } from './purchases.js';
import { calculateProfit } from './utils.js';
import { updatePagination, itemsPerPage, getCurrentPage } from './pagination.js';
import { openModal, openViewItemsModal } from './uiModalHandling.js';  // Add openViewItemsModal here

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
  updateTotalProfitDisplay(calculateTotalProfit());
}

function createPurchaseCard(purchase, profit) {
  const card = document.createElement('div');
  card.className = 'purchase-card'; // Remove profit-based class

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

  const deleteBtn = createButton('Delete', 'delete', () => openDeleteConfirmModal(purchase.id));  // Pass only the ID

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
  const profitElement = document.getElementById('profit-amount');
  profitElement.textContent = `${totalProfit.toFixed(2)} €`;
  profitElement.className = 'profit-amount ' + (totalProfit >= 0 ? 'positive' : 'negative');
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
  const itemElement = document.createElement('li');
  itemElement.dataset.itemId = item.id;
  itemElement.dataset.purchaseId = purchaseId;
  itemElement.dataset.status = item.status;  // Add this line

  const itemInfo = document.createElement('div');
  itemInfo.className = 'item-info';

  const itemDetails = document.createElement('div');
  itemDetails.className = 'item-details';
  itemDetails.innerHTML = `
    <span class="item-name">${item.name}</span>
    <span class="item-type">${item.type}</span>
    <span class="item-platform">${item.platform}</span>
    <span class="item-status">
      <i class="fas ${item.status === 'Sold' ? 'fa-check-circle' : 'fa-clock'}"></i>
      Status: ${item.status}
    </span>
  `;

  if (item.status === 'Sold') {
    const soldForElement = document.createElement('span');
    soldForElement.className = 'item-sold-for';
    soldForElement.textContent = `Sold for: ${item.soldFor.toFixed(2)} €`;
    itemDetails.appendChild(soldForElement);
  }

  itemInfo.appendChild(itemDetails);

  const itemActions = document.createElement('div');
  itemActions.className = 'item-actions';

  const actionButton = document.createElement('button');
  actionButton.textContent = item.status === 'Sold' ? 'Mark as Unsold' : 'Mark as Sold';
  actionButton.className = `action-button ${item.status === 'Sold' ? 'secondary mark-unsold' : 'primary mark-sold'}`;
  actionButton.dataset.itemId = item.id;

  const editItemBtn = document.createElement('button');
  editItemBtn.textContent = 'Edit';
  editItemBtn.className = 'action-button secondary edit-item';
  editItemBtn.dataset.itemId = item.id;

  const deleteItemBtn = document.createElement('button');
  deleteItemBtn.textContent = 'Delete';
  deleteItemBtn.className = 'action-button delete delete-item-btn';
  deleteItemBtn.dataset.itemId = item.id;

  itemActions.appendChild(actionButton);
  itemActions.appendChild(editItemBtn);
  itemActions.appendChild(deleteItemBtn);

  itemElement.appendChild(itemInfo);
  itemElement.appendChild(itemActions);

  return itemElement;
}


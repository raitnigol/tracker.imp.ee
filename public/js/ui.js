import { purchases, setCurrentPurchase, setPurchaseToDelete, handlePurchaseSubmit, deletePurchase, calculateProfit } from './purchases.js';
import { handleItemSubmit, markAsSold, markAsUnsold, deleteItem } from './items.js';

let currentPage = 1;
export const itemsPerPage = 3;

export function setupEventListeners() {
  document.getElementById('purchase-form').addEventListener('submit', handlePurchaseSubmit);
  document.getElementById('item-form').addEventListener('submit', handleItemSubmit);
  document.getElementById('confirm-delete').addEventListener('click', deletePurchase);
  document.getElementById('cancel-delete').addEventListener('click', () => closeModal('delete-confirm-modal'));

  window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
      closeModal(event.target.id);
    }
  };

  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => closeModal(closeBtn.closest('.modal').id));
  });

  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('mark-sold')) {
      markAsSold(e.target.getAttribute('data-item-id'));
    } else if (e.target.classList.contains('mark-unsold')) {
      markAsUnsold(e.target.getAttribute('data-item-id'));
    } else if (e.target.classList.contains('delete-item')) {
      deleteItem(e.target.getAttribute('data-item-id'));
    }
  });

  document.getElementById('add-purchase-btn').addEventListener('click', () => openModal('add-purchase-modal'));
  document.getElementById('cancel-add-purchase').addEventListener('click', () => closeModal('add-purchase-modal'));
  document.getElementById('purchase-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handlePurchaseSubmit(e);
    closeModal('add-purchase-modal');
  });
}

export function displayPurchases() {
  const purchaseList = document.getElementById('purchase-list');
  purchaseList.innerHTML = '';

  const totalPages = Math.ceil(purchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
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

  updatePagination(currentPage, totalPages);
  updateTotalProfitDisplay(calculateTotalProfit());
}

function calculateTotalProfit() {
  return purchases.reduce((total, purchase) => total + calculateProfit(purchase), 0);
}

function getPaginatedPurchases() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return purchases.slice(start, end);
}

function displayPurchaseCards(paginatedPurchases, purchaseList) {
  let totalProfit = 0;

  paginatedPurchases.forEach(purchase => {
    const profit = calculateProfit(purchase);
    totalProfit += profit;

    const purchaseCard = createPurchaseCard(purchase, profit);
    purchaseList.appendChild(purchaseCard);
  });

  return totalProfit;
}

function createPurchaseCard(purchase, profit) {
  const purchaseDiv = document.createElement('div');
  purchaseDiv.classList.add('purchase-card');

  purchaseDiv.innerHTML = `
    <h3>${purchase.name} - €${purchase.price.toFixed(2)}</h3>
    <p>${purchase.items ? purchase.items.length : 0} items in the purchase</p>
    <p class="${profit >= 0 ? 'profit' : 'loss'}">Profit: €${profit.toFixed(2)}</p>
  `;

  const buttonGroup = createButtonGroup(purchase);
  purchaseDiv.appendChild(buttonGroup);

  return purchaseDiv;
}

function createButtonGroup(purchase) {
  const buttonGroup = document.createElement('div');
  buttonGroup.classList.add('button-group');

  const addItemButton = createButton('Add New Item', () => openAddItemModal(purchase));
  const viewItemsButton = createButton('View Items', () => openViewItemsModal(purchase));
  const deleteButton = createButton('Delete', () => openDeleteConfirmModal(purchase), true);

  buttonGroup.appendChild(addItemButton);
  buttonGroup.appendChild(viewItemsButton);
  buttonGroup.appendChild(deleteButton);

  return buttonGroup;
}

function createButton(text, onClick, isDelete = false) {
  const button = document.createElement('button');
  button.textContent = text;
  button.addEventListener('click', onClick);
  if (isDelete) {
    button.classList.add('delete-button');
  }
  return button;
}

function updateTotalProfitDisplay(totalProfit) {
  let totalProfitElement = document.getElementById('total-profit');
  if (!totalProfitElement) {
    totalProfitElement = document.createElement('div');
    totalProfitElement.id = 'total-profit';
    document.querySelector('.app-container').insertBefore(totalProfitElement, document.getElementById('recent-purchases'));
  }
  totalProfitElement.textContent = `Total Profit: €${totalProfit.toFixed(2)}`;
  totalProfitElement.className = totalProfit >= 0 ? 'profit' : 'loss';
}

function updatePagination(currentPage, totalPages) {
  const paginationContainer = document.getElementById('pagination-controls');
  paginationContainer.innerHTML = '';

  if (totalPages <= 1) return;

  const createPageButton = (page, text, disabled = false) => {
    const button = document.createElement('button');
    button.textContent = text || page;
    button.classList.add('pagination-button');
    if (page === currentPage) button.classList.add('active');
    if (disabled) {
      button.disabled = true;
      button.classList.add('disabled');
    } else {
      button.addEventListener('click', () => changePage(page));
    }
    return button;
  };

  paginationContainer.appendChild(createPageButton(1, 'First', currentPage === 1));
  paginationContainer.appendChild(createPageButton(currentPage - 1, 'Prev', currentPage === 1));

  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.appendChild(createPageButton(i));
  }

  paginationContainer.appendChild(createPageButton(currentPage + 1, 'Next', currentPage === totalPages));
  paginationContainer.appendChild(createPageButton(totalPages, 'Last', currentPage === totalPages));
}

export function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

export function showAppContent() {
  document.getElementById('app-content').classList.remove('hidden');
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'block';
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

export function openAddItemModal(purchase) {
  setCurrentPurchase(purchase);
  openModal('item-modal');
}

export function openViewItemsModal(purchase) {
  setCurrentPurchase(purchase);
  const itemsList = document.getElementById('items-list');
  const purchaseSummary = document.getElementById('purchase-summary');

  updatePurchaseSummary(purchase, purchaseSummary);
  updateItemsList(purchase, itemsList);

  openModal('view-items-modal');
}

function updatePurchaseSummary(purchase, purchaseSummary) {
  const profit = calculateProfit(purchase);
  const profitClass = profit >= 0 ? 'profit' : 'loss';

  purchaseSummary.innerHTML = `
    <h3>${purchase.name}</h3>
    <p>Purchase price: ${purchase.price.toFixed(2)} €</p>
    <p>Total items: ${purchase.items.length}</p>
    <p>Profit: <span class="${profitClass}">${profit.toFixed(2)} €</span></p>
  `;
}

function updateItemsList(purchase, itemsList) {
  itemsList.innerHTML = '';

  if (purchase.items && purchase.items.length > 0) {
    purchase.items.forEach((item) => {
      const li = createItemListElement(item);
      itemsList.appendChild(li);
    });
  } else {
    itemsList.innerHTML = '<li>No items in this purchase</li>';
  }
}

function createItemListElement(item) {
  const li = document.createElement('li');
  li.innerHTML = `
    <div class="item-info">
      <p><strong>Platform:</strong> ${item.platform}</p>
      <p><strong>${item.type.charAt(0).toUpperCase() + item.type.slice(1)}:</strong> ${item.name}</p>
      <p>${item.status === 'Sold' 
        ? `The ${item.type} sold for ${item.soldFor.toFixed(2)} €` 
        : `The ${item.type} is currently unsold.`}</p>
    </div>
    <div class="item-actions">
      <button class="action-button mark-sold" data-item-id="${item.id}">${item.status === 'Sold' ? 'Update Sale' : 'Mark as Sold'}</button>
      <button class="action-button mark-unsold" data-item-id="${item.id}">Mark as Unsold</button>
      <button class="action-button delete-item" data-item-id="${item.id}">Delete</button>
    </div>
  `;
  return li;
}

export function openDeleteConfirmModal(purchase) {
  setPurchaseToDelete(purchase);
  openModal('delete-confirm-modal');
}

export function displayUsername() {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('username-display').textContent = payload.username;
  }
}

function changePage(page) {
  currentPage = page;
  displayPurchases();
}

export function updatePaginationAfterDelete(purchasesLength) {
  const totalPages = Math.ceil(purchasesLength / itemsPerPage);
  if (currentPage > totalPages) {
    setCurrentPage(Math.max(1, totalPages));
  }
  return currentPage;
}

export function getCurrentPage() {
  return currentPage;
}

export function setCurrentPage(page) {
  currentPage = page;
}


import { calculateProfit } from './utils.js';
import { createItemElement } from './uiPurchaseDisplay.js';
import { openModal } from './uiModalHandling.js';

export function openViewItemsModal(purchase) {
  const modal = document.getElementById('view-items-modal');
  const purchaseSummary = document.getElementById('purchase-summary');
  const itemsList = document.getElementById('items-list');

  updatePurchaseSummary(purchase, purchaseSummary);
  updateItemsList(purchase, itemsList);

  const profit = calculateProfit(purchase);
  const profitElement = modal.querySelector('.modal-profit');
  if (profitElement) {
    profitElement.textContent = `Profit: ${profit.toFixed(2)} €`;
    profitElement.className = `modal-profit ${profit >= 0 ? 'positive' : 'negative'}`;
  }

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
      const itemCard = createItemElement(item, purchase.id);
      itemsList.appendChild(itemCard);
    });
  } else {
    itemsList.innerHTML = '<div class="no-items">No items in this purchase</div>';
  }
  setupItemSearch();
}

function setupItemSearch() {
  const searchInput = document.getElementById('items-search-input');
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const items = document.querySelectorAll('#items-list .item-card');
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(searchTerm) ? '' : 'none';
    });
  });
}

export function updateViewItemsModalProfit(purchase) {
  const modal = document.getElementById('view-items-modal');
  const profit = calculateProfit(purchase);
  const profitElement = modal.querySelector('.modal-profit');
  if (profitElement) {
    profitElement.textContent = `Profit: ${profit.toFixed(2)} €`;
    profitElement.className = `modal-profit ${profit >= 0 ? 'positive' : 'negative'}`;
  }
  
  // Update the purchase summary
  const purchaseSummary = document.getElementById('purchase-summary');
  if (purchaseSummary) {
    updatePurchaseSummary(purchase, purchaseSummary);
  }
}

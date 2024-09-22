import { calculateProfit } from './utils.js';
import { createItemElement } from './uiPurchaseDisplay.js';

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);

    if (modalId === 'mark-as-sold-modal') {
      document.getElementById('sold-for-price').value = '';
    }
  }
  
  export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  }
  
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

    openModal('view-items-modal');  // This should now use the imported function
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
        const li = createItemElement(item, purchase.id);
        itemsList.appendChild(li);
      });
    } else {
      itemsList.innerHTML = '<li>No items in this purchase</li>';
    }
    setupItemSearch();
  }

  function setupItemSearch() {
    const searchInput = document.getElementById('items-search-input');
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const items = document.querySelectorAll('#items-list li');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? '' : 'none';
      });
    });
  }

  // Call this function after populating the items list
  setupItemSearch();

  export function updateViewItemsModalProfit(purchase) {
    const modalProfitElement = document.querySelector('#view-items-modal .modal-profit');
    if (modalProfitElement) {
      const profit = calculateProfit(purchase);
      modalProfitElement.textContent = `Profit: ${profit.toFixed(2)} €`;
      modalProfitElement.className = `modal-profit ${profit >= 0 ? 'positive' : 'negative'}`;
    }
  }


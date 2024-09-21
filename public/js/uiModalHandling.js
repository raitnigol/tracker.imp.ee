import { calculateProfit } from './purchases.js';

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }
  
  export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
  
  export function openViewItemsModal(purchase) {
    const modal = document.getElementById('view-items-modal');
    const purchaseSummary = document.getElementById('purchase-summary');
    const itemsList = document.getElementById('items-list');
  
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

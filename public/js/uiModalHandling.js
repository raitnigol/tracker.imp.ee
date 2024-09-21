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
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="item-info">
            <div class="item-name">${item.name}</div>
            <div class="item-details"><i class="fas fa-tag"></i> ${item.type}, <i class="fas fa-gamepad"></i> ${item.platform}</div>
            <div class="item-status">
              <div class="tooltip">
                <i class="fas ${item.status === 'Sold' ? 'fa-check-circle' : 'fa-clock'}"></i>
                <span class="tooltiptext">${item.status === 'Sold' ? 'Item sold' : 'Item not yet sold'}</span>
              </div>
              Status: ${item.status}
              ${item.status === 'Sold' ? `<br><i class="fas fa-euro-sign"></i> Sold for: ${item.soldFor.toFixed(2)} €` : ''}
            </div>
          </div>
          <div class="item-actions">
            ${item.status === 'Unsold' 
              ? `<button class="action-button primary mark-sold" data-item-id="${item.id}"><i class="fas fa-check"></i> Mark as Sold</button>`
              : `<button class="action-button secondary mark-unsold" data-item-id="${item.id}"><i class="fas fa-undo"></i> Mark as Unsold</button>`
            }
            <button class="action-button delete delete-item" data-item-id="${item.id}"><i class="fas fa-trash"></i> Delete</button>
          </div>
        `;
        li.innerHTML += `
          <div class="item-quick-edit" style="display: none;">
            <input type="text" class="quick-edit-name" value="${item.name}">
            <select class="quick-edit-type">
              <option value="game" ${item.type === 'game' ? 'selected' : ''}>Game</option>
              <option value="console" ${item.type === 'console' ? 'selected' : ''}>Console</option>
              <option value="accessory" ${item.type === 'accessory' ? 'selected' : ''}>Accessory</option>
            </select>
            <select class="quick-edit-platform">
              <option value="PlayStation 1" ${item.platform === 'PlayStation 1' ? 'selected' : ''}>PlayStation 1</option>
              <option value="PlayStation 2" ${item.platform === 'PlayStation 2' ? 'selected' : ''}>PlayStation 2</option>
              <option value="PlayStation 3" ${item.platform === 'PlayStation 3' ? 'selected' : ''}>PlayStation 3</option>
              <option value="XBOX 360" ${item.platform === 'XBOX 360' ? 'selected' : ''}>XBOX 360</option>
            </select>
            <button class="action-button primary save-quick-edit" data-item-id="${item.id}"><i class="fas fa-save"></i> Save</button>
          </div>
        `;
        const editButton = document.createElement('button');
        editButton.className = 'action-button secondary edit-item';
        editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editButton.addEventListener('click', () => {
          li.querySelector('.item-quick-edit').style.display = 'block';
          editButton.style.display = 'none';
        });
        li.querySelector('.item-actions').appendChild(editButton);
        itemsList.appendChild(li);
      });
    } else {
      itemsList.innerHTML = '<li>No items in this purchase</li>';
    }
    setupItemSearch();
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

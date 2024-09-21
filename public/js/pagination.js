import { displayPurchases } from './ui.js';

let currentPage = 1;
export const itemsPerPage = 3;

export function updatePagination(currentPage, totalPages) {
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

export function changePage(page) {
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

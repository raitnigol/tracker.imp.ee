export function openModal(modalId) {
  // Close any open modal first
  const openModals = document.querySelectorAll('.modal.show');
  openModals.forEach(modal => closeModal(modal.id));

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
  console.log(`Attempting to close modal: ${modalId}`);
  const modal = document.getElementById(modalId);
  if (modal) {
    console.log(`Modal found: ${modalId}`);
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
      console.log(`Modal ${modalId} hidden`);
    }, 300);
  } else {
    console.error(`Modal not found: ${modalId}`);
  }
}


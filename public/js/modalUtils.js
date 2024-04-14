// modalUtils.js
function showModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = 'flex';
}

function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

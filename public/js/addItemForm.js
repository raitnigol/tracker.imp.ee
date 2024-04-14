document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addItemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const item = document.getElementById('itemName').value;
        const boughtFor = document.getElementById('itemBoughtFor').value;
        const soldFor = document.getElementById('itemSoldFor').value || 0;
        addItem(item, parseFloat(boughtFor), parseFloat(soldFor));
    });

    document.getElementById('editItemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateItem();
    });

    fetchItems();
    closeModal('loginModal');
    closeModal('registerModal');
    closeModal('addItemModal');
    closeModal('editItemModal');
});

function showModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = 'flex';
}

function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

function showNotification(message) {
    var notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
        notification.style.display = 'none';
    }, 3000);
}

function addItem(item, boughtFor, soldFor) {
    fetch('/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ item: item, bought_for: boughtFor, sold_for: soldFor })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to add item. Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        showNotification('Item added successfully!');
        addRowToItemsTable(item, boughtFor, soldFor, data.id);
        closeModal('addItemModal');
        document.getElementById('itemName').value = '';
        document.getElementById('itemBoughtFor').value = '';
        document.getElementById('itemSoldFor').value = '';
    })
    .catch(error => {
        console.error('Error adding item:', error);
        showNotification(error.message);
    });
}

function addRowToItemsTable(item, boughtFor, soldFor, id) {
    const soldDisplay = soldFor == 0 ? "Item not sold" : `${soldFor} EUR`;
    const table = document.getElementById('itemsList').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>${item}</td>
        <td>${boughtFor} EUR</td>
        <td>${soldDisplay}</td>
        <td class="actions">
            <button onclick="editItem(${id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
            <button onclick="deleteItem(${id})" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
        </td>
    `;
}

function editItem(id) {
    fetch(`/items/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('editItemId').value = id;
        document.getElementById('editItemName').value = data.item;
        document.getElementById('editItemBoughtFor').value = data.bought_for;
        document.getElementById('editItemSoldFor').value = data.sold_for;
        showModal('editItemModal');
    })
    .catch(error => {
        console.error('Error fetching item details:', error);
    });
}

function updateItem() {
    const id = document.getElementById('editItemId').value;
    const item = document.getElementById('editItemName').value;
    const boughtFor = document.getElementById('editItemBoughtFor').value;
    const soldFor = document.getElementById('editItemSoldFor').value;

    fetch(`/items/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ item: item, bought_for: boughtFor, sold_for: soldFor })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to update item. Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        showNotification('Item updated successfully!');
        fetchItems(); // Refresh the list
        closeModal('editItemModal');
    })
    .catch(error => {
        console.error('Error updating item:', error);
        showNotification(error.message);
    });
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        fetch(`/items/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete the item.');
            }
            showNotification('Item deleted successfully!');
            fetchItems(); // Refresh the items list
        })
        .catch(error => {
            console.error('Error deleting item:', error);
            showNotification(error.message);
        });
    }
}

function fetchItems() {
    const token = localStorage.getItem('token');
    if (token) {
        fetch('/items', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(items => {
            const tbody = document.getElementById('itemsList').getElementsByTagName('tbody')[0];
            tbody.innerHTML = ''; // Clear the table first
            items.forEach(item => addRowToItemsTable(item.item, item.bought_for, item.sold_for, item.id));
        })
        .catch(error => console.error('Error fetching items:', error));
    }
}

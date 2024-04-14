document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addItemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const item = document.getElementById('itemName').value;
        const boughtFor = document.getElementById('itemBoughtFor').value;
        const soldFor = document.getElementById('itemSoldFor').value;
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

function addItem(item, boughtFor, soldFor) {
    fetch('/main_items', {
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
    const table = document.getElementById('itemsList').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    const soldDisplay = soldFor == 0 ? "Item Not Sold" : `${soldFor} EUR`; // Check if soldFor is 0
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
    fetch(`/main_items/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error fetching main item details. Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('editItemId').value = id;
        document.getElementById('editItemName').value = data.item;
        document.getElementById('editItemBoughtFor').value = data.bought_for;
        document.getElementById('editItemSoldFor').value = data.sold_for;
        showModal('editItemModal');
        fetchSubItemsForItem(id);  // Ensure this is called after the modal is shown
    })
    .catch(error => {
        console.error('Error fetching item details:', error);
    });
}

function fetchSubItemsForItem(mainItemId) {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("No token available.");
        return;
    }

    fetch(`/main_items/${mainItemId}/sub-items`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(subItems => {
        const container = document.getElementById('subItemsContainer');
        container.innerHTML = '';  // Clear previous sub-items
        if (Array.isArray(subItems) && subItems.length > 0) {
            subItems.forEach(subItem => {
                const subItemElement = document.createElement('div');
                subItemElement.className = 'sub-item';
                subItemElement.innerHTML = `
                    <p>Name: ${subItem.name}</p>
                    <p>Sold For: ${subItem.sold_for} EUR</p>
                `;
                container.appendChild(subItemElement);
            });
        } else {
            container.innerHTML = '<p>No sub-items found.</p>';
        }
    })
    .catch(error => {
        console.error('Error fetching sub-items:', error);
    });
}

function addSubItemToContainer(subItem, container) {
    const subItemDiv = document.createElement('div');
    subItemDiv.classList.add('sub-item');
    subItemDiv.innerHTML = `
        <div>Name: ${subItem.name}</div>
        <div>Bought For: ${subItem.bought_for} EUR</div>
        <div>Sold For: ${subItem.sold_for} EUR</div>
    `;
    container.appendChild(subItemDiv);
}
function updateItem() {
    const id = document.getElementById('editItemId').value;
    const item = document.getElementById('editItemName').value;
    const boughtFor = document.getElementById('editItemBoughtFor').value;
    const soldFor = document.getElementById('editItemSoldFor').value;

    fetch(`/main_items/${id}`, {
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
        fetch(`/main_items/${id}`, {
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
        fetch('/main_items', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(items => {
            const tbody = document.getElementById('itemsList').getElementsByTagName('tbody')[0];
            tbody.innerHTML = ''; // Clear the table first
            if (Array.isArray(items)) {
                items.forEach(item => {
                    addRowToItemsTable(item.item, item.bought_for, item.sold_for, item.id);
                });
            } else {
                console.error('Expected an array of items, received:', items);
            }
        })
        .catch(error => console.error('Error fetching items:', error));
    }
}

function addSubItemField() {
    const container = document.getElementById('subItemsContainer');
    const html = `
        <div class="sub-item">
            <input type="text" placeholder="Sub-item name" required>
            <input type="number" placeholder="Sold for (EUR)" value="0">
            <button onclick="removeSubItemField(this)" class="btn remove-btn">Remove</button>
            <button onclick="saveSubItem(this.parentElement)" class="btn save-btn">Save</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
}

function saveSubItem(subItemDiv) {
    const subItemName = subItemDiv.querySelector('input[type="text"]').value;
    const subItemSoldFor = subItemDiv.querySelector('input[type="number"]').value;
    const mainItemId = document.getElementById('editItemId').value;  // Ensure this ID is being correctly assigned elsewhere in your code

    if (!subItemName.trim()) {
        alert('Please enter a name for the sub-item.');
        return;
    }

    fetch('/sub-items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            main_item_id: mainItemId,
            sub_item: subItemName,
            bought_for: 0, // Modify if necessary
            sold_for: parseFloat(subItemSoldFor)
        })
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to save sub-item.');
        return response.json();
    })
    .then(data => {
        alert('Sub-item saved successfully!');
        // Optionally refresh the sub-item list or add to the display directly
    })
    .catch(error => {
        console.error('Error saving sub-item:', error);
        alert('Failed to save sub-item.');
    });
}

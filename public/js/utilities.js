document.addEventListener('DOMContentLoaded', function () {
    // Initialize event listeners for login and register buttons
    document.getElementById('loginBtn').addEventListener('click', function() {
        showModal('loginModal');
    });
    document.getElementById('registerBtn').addEventListener('click', function() {
        showModal('registerModal');
    });
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Add new item button (assuming this button is part of your HTML)
    document.getElementById('addItemBtn').addEventListener('click', function() {
        showModal('addItemModal');
    });

    // Ensure modals do not display unless called
    closeModal('loginModal');
    closeModal('registerModal');
    closeModal('addItemModal'); // Assuming you have an add item modal
    closeModal('editItemModal');
    // Authentication check
    if (localStorage.getItem('token')) {
        validateToken();
    } else {
        updateLoginStatus();
    }
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    updateLoginStatus();
}

function validateToken() {
    const token = localStorage.getItem('token');
    if (token) {
        fetch('/api/validateToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (!data.isValid) {
                console.error('Token validation failed, logging out.');
                logout();
            } else {
                updateLoginStatus();
                fetchItems();
            }
        })
        .catch(error => {
            console.error('Error validating token:', error);
            logout();
        });
    } else {
        updateLoginStatus();
    }
}

function updateLoginStatus() {
    if (localStorage.getItem('token')) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
        document.getElementById('itemManagement').style.display = 'block';
        document.getElementById('userStatus').innerHTML = `Logged in as ${localStorage.getItem('username')}`;
    } else {
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('registerBtn').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('itemManagement').style.display = 'none';
        document.getElementById('userStatus').innerHTML = '';
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
            tbody.innerHTML = '';
            items.forEach(item => {
                addRowToItemsTable(item.item, item.bought_for, item.sold_for, item.id);
            });
        })
        .catch(error => console.error('Error fetching items:', error));
    }
}

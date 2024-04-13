document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    login(username, password);
});

function login(username, password) {
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);  // Assuming the server also sends back the username
            updateLoginStatus();  // Update UI function
            fetchItems();         // Fetch and display user data
            closeModal('loginModal');
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error logging in:', error));
}

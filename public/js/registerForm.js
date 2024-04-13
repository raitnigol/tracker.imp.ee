document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    register(username, password);
});

function register(username, password) {
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username, password
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.message === "User created successfully.") {
            closeModal('registerModal');
        }
    })
    .catch(error => console.error('Error registering:', error));
}

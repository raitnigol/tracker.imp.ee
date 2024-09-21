function updateDebugInfo(message) {
  const debugInfo = document.getElementById('debug-info');
  debugInfo.innerHTML += `<p>${message}</p>`;
}

function checkAuth() {
  updateDebugInfo('Checking authentication...');
  const token = localStorage.getItem('token');
  if (token) {
    updateDebugInfo('Token found, verifying...');
    fetch('/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.ok) {
        updateDebugInfo('Token valid, redirecting...');
        window.location.href = '/';
      } else {
        updateDebugInfo('Token invalid, showing login form...');
        localStorage.removeItem('token');
        document.querySelector('.login-container').style.display = 'block';
      }
    })
    .catch(error => {
      updateDebugInfo(`Error verifying token: ${error.message}`);
      document.querySelector('.login-container').style.display = 'block';
    });
  } else {
    updateDebugInfo('No token found, showing login form...');
    document.querySelector('.login-container').style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('token', token);
        window.location.href = '/';  // Redirect to the main page
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  });
});

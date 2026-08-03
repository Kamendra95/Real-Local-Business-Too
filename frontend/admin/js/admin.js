const API_URL = 'http://localhost:5000';

function getToken() {
    return localStorage.getItem('adminToken');
}

function checkAuth() {
    if (!getToken()) {
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'login.html';
}

async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
            ...options.headers
        }
    });
    return response.json();
}
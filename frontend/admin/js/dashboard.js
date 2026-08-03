// Dashboard JavaScript - Complete Admin Dashboard Functionality

const API_URL = 'http://localhost:5000';

// ============ HELPER FUNCTIONS ============

function getToken() {
    return localStorage.getItem('adminToken');
}

function getUser() {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getBusinessIcon(businessType) {
    const icons = {
        'restaurant': '🍽️',
        'gym': '💪',
        'salon': '💇',
        'default': '📅'
    };
    return icons[businessType] || icons.default;
}

function getBusinessName(businessType) {
    const names = {
        'restaurant': 'Restaurant',
        'gym': 'Gym & Fitness',
        'salon': 'Salon & Spa',
        'default': 'Business'
    };
    return names[businessType] || names.default;
}

// ============ API CALLS ============

async function fetchDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/api/admin/stats`, {
            headers: { 'Authorization': getToken() }
        });
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            console.error('Failed to fetch stats:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
}

async function fetchAllBookings() {
    try {
        const response = await fetch(`${API_URL}/api/admin/bookings`, {
            headers: { 'Authorization': getToken() }
        });
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            console.error('Failed to fetch bookings:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
}

async function fetchAllContacts() {
    try {
        const response = await fetch(`${API_URL}/api/admin/contacts`, {
            headers: { 'Authorization': getToken() }
        });
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            console.error('Failed to fetch contacts:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return [];
    }
}

async function deleteBooking(bookingId) {
    try {
        const response = await fetch(`${API_URL}/api/admin/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: { 'Authorization': getToken() }
        });
        const data = await response.json();
        
        if (data.success) {
            showToast('Booking deleted successfully!', 'success');
            return true;
        } else {
            showToast('Failed to delete booking: ' + data.message, 'error');
            return false;
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        showToast('Error deleting booking', 'error');
        return false;
    }
}

async function deleteContact(contactId) {
    try {
        const response = await fetch(`${API_URL}/api/admin/contacts/${contactId}`, {
            method: 'DELETE',
            headers: { 'Authorization': getToken() }
        });
        const data = await response.json();
        
        if (data.success) {
            showToast('Contact message deleted successfully!', 'success');
            return true;
        } else {
            showToast('Failed to delete contact: ' + data.message, 'error');
            return false;
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
        showToast('Error deleting contact', 'error');
        return false;
    }
}

// ============ CHART FUNCTIONS ============

function createBookingChart(bookings) {
    const ctx = document.getElementById('bookingChart');
    if (!ctx) return;
    
    // Count bookings per day (last 7 days)
    const last7Days = [];
    const bookingCounts = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        last7Days.push(dateStr);
        
        const count = bookings.filter(booking => {
            const bookingDate = new Date(booking.createdAt);
            return bookingDate.toDateString() === date.toDateString();
        }).length;
        bookingCounts.push(count);
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Bookings',
                data: bookingCounts,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Last 7 Days Bookings'
                }
            }
        }
    });
}

function createBusinessChart(bookings) {
    const ctx = document.getElementById('businessChart');
    if (!ctx) return;
    
    const restaurantCount = bookings.filter(b => b.businessType === 'restaurant').length;
    const gymCount = bookings.filter(b => b.businessType === 'gym').length;
    const salonCount = bookings.filter(b => b.businessType === 'salon').length;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Restaurant', 'Gym', 'Salon'],
            datasets: [{
                data: [restaurantCount, gymCount, salonCount],
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Bookings by Business Type'
                }
            }
        }
    });
}

// ============ RENDER FUNCTIONS ============

function renderStats(stats) {
    if (!stats) return;
    
    const totalBookingsEl = document.getElementById('totalBookings');
    const todayBookingsEl = document.getElementById('todayBookings');
    const totalContactsEl = document.getElementById('totalContacts');
    const pendingBookingsEl = document.getElementById('pendingBookings');
    
    if (totalBookingsEl) totalBookingsEl.textContent = stats.totalBookings || 0;
    if (todayBookingsEl) todayBookingsEl.textContent = stats.todayBookings || 0;
    if (totalContactsEl) totalContactsEl.textContent = stats.totalContacts || 0;
    
    // Calculate pending (you can add status field to bookings)
    if (pendingBookingsEl) pendingBookingsEl.textContent = stats.recentBookings?.length || 0;
}

function renderRecentBookings(bookings) {
    const tbody = document.getElementById('recentBookings');
    if (!tbody) return;
    
    if (!bookings || bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No recent bookings found</td></tr>';
        return;
    }
    
    const recent = bookings.slice(0, 5);
    tbody.innerHTML = '';
    
    recent.forEach(booking => {
        const row = tbody.insertRow();
        row.insertCell(0).innerHTML = `${getBusinessIcon(booking.businessType)} ${getBusinessName(booking.businessType)}`;
        row.insertCell(1).textContent = booking.name;
        row.insertCell(2).textContent = booking.date;
        row.insertCell(3).textContent = booking.time;
        row.insertCell(4).innerHTML = '<span class="status-badge status-pending">Pending</span>';
        
        // Add click to view details
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => showBookingDetails(booking));
    });
}

function showBookingDetails(booking) {
    const modal = document.getElementById('bookingModal');
    const modalContent = document.getElementById('bookingModalContent');
    
    if (!modal || !modalContent) return;
    
    modalContent.innerHTML = `
        <h3>Booking Details</h3>
        <div class="detail-row">
            <strong>Business:</strong> ${getBusinessIcon(booking.businessType)} ${getBusinessName(booking.businessType)}
        </div>
        <div class="detail-row">
            <strong>Customer Name:</strong> ${booking.name}
        </div>
        <div class="detail-row">
            <strong>Email:</strong> ${booking.email}
        </div>
        <div class="detail-row">
            <strong>Phone:</strong> ${booking.phone}
        </div>
        <div class="detail-row">
            <strong>Date:</strong> ${booking.date}
        </div>
        <div class="detail-row">
            <strong>Time:</strong> ${booking.time}
        </div>
        ${booking.guests ? `<div class="detail-row"><strong>Guests:</strong> ${booking.guests}</div>` : ''}
        ${booking.service ? `<div class="detail-row"><strong>Service:</strong> ${booking.service}</div>` : ''}
        ${booking.occasion ? `<div class="detail-row"><strong>Occasion:</strong> ${booking.occasion}</div>` : ''}
        ${booking.specialRequests ? `<div class="detail-row"><strong>Special Requests:</strong> ${booking.specialRequests}</div>` : ''}
        <div class="detail-row">
            <strong>Booked On:</strong> ${formatDateTime(booking.createdAt)}
        </div>
        <div class="modal-buttons">
            <button onclick="closeModal()" class="btn-secondary">Close</button>
            <button onclick="deleteBookingFromModal('${booking._id}')" class="btn-delete">Delete Booking</button>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) modal.style.display = 'none';
}

async function deleteBookingFromModal(bookingId) {
    if (confirm('Are you sure you want to delete this booking?')) {
        const success = await deleteBooking(bookingId);
        if (success) {
            closeModal();
            refreshDashboard();
        }
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ REFRESH FUNCTION ============

async function refreshDashboard() {
    showLoader();
    
    try {
        const stats = await fetchDashboardStats();
        const bookings = await fetchAllBookings();
        
        renderStats(stats);
        renderRecentBookings(bookings);
        
        // Create charts if canvas elements exist
        if (document.getElementById('bookingChart')) {
            createBookingChart(bookings);
        }
        if (document.getElementById('businessChart')) {
            createBusinessChart(bookings);
        }
        
        // Update welcome message
        const user = getUser();
        const welcomeEl = document.getElementById('welcomeMessage');
        if (welcomeEl && user) {
            const hour = new Date().getHours();
            let greeting = 'Good Morning';
            if (hour >= 12) greeting = 'Good Afternoon';
            if (hour >= 17) greeting = 'Good Evening';
            welcomeEl.textContent = `${greeting}, ${user.name}!`;
        }
        
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
        showToast('Error loading dashboard data', 'error');
    } finally {
        hideLoader();
    }
}

// ============ LOADER FUNCTIONS ============

function showLoader() {
    let loader = document.getElementById('dashboardLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'dashboardLoader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        loader.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 10px; text-align: center;">
                <div class="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        `;
        document.body.appendChild(loader);
        
        if (!document.querySelector('#spinner-style')) {
            const style = document.createElement('style');
            style.id = 'spinner-style';
            style.textContent = `
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.getElementById('dashboardLoader');
    if (loader) loader.style.display = 'none';
}

// ============ EXPORT FUNCTIONS (Global) ============

window.getToken = getToken;
window.getUser = getUser;
window.checkAuth = checkAuth;
window.logout = logout;
window.refreshDashboard = refreshDashboard;
window.deleteBooking = deleteBooking;
window.deleteContact = deleteContact;
window.showToast = showToast;
window.closeModal = closeModal;
window.deleteBookingFromModal = deleteBookingFromModal;

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Setup refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshDashboard();
        });
    }
    
    // Setup modal close on click outside
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Load dashboard data
    await refreshDashboard();
    
    // Auto refresh every 30 seconds
    setInterval(refreshDashboard, 30000);
    
    console.log('Dashboard initialized');
});
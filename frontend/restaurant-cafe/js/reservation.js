document.addEventListener('DOMContentLoaded', () => {
    const reservationForm = document.getElementById('reservationForm');
    
    if (reservationForm) {
        const dateInput = document.getElementById('date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        
        reservationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                businessType: 'restaurant',
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                guests: document.getElementById('guests').value,
                occasion: document.getElementById('occasion').value,
                specialRequests: document.getElementById('specialRequests').value
            };
            
            if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time) {
                showAlert('Please fill in all required fields', 'error');
                return;
            }
            
            if (!isValidEmail(formData.email)) {
                showAlert('Please enter a valid email address', 'error');
                return;
            }
            
            if (!isValidPhone(formData.phone)) {
                showAlert('Please enter a valid 10-digit phone number', 'error');
                return;
            }
            
            const selectedDate = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showAlert('Please select a future date', 'error');
                return;
            }
            
            showLoader();
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert('Reservation made successfully! Check your email for confirmation.', 'success');
                    reservationForm.reset();
                } else {
                    showAlert(data.message || 'Failed to make reservation', 'error');
                }
            } catch (error) {
                showAlert('Network error. Please try again.', 'error');
            } finally {
                hideLoader();
            }
        });
    }
});
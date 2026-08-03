document.addEventListener('DOMContentLoaded', () => {
    const appointmentForm = document.getElementById('appointmentForm');
    
    if (appointmentForm) {
        // Set minimum date to today
        const dateInput = document.getElementById('date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        
        appointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                businessType: 'salon',
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                service: document.getElementById('service').value,
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                stylist: document.getElementById('stylist').value,
                specialRequests: document.getElementById('notes').value
            };
            
            // Validate form
            if (!formData.name || !formData.email || !formData.phone || !formData.service || !formData.date || !formData.time) {
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
                    showAlert('Appointment booked successfully! Check your email for confirmation.', 'success');
                    appointmentForm.reset();
                } else {
                    showAlert(data.message || 'Failed to book appointment. Please try again.', 'error');
                }
            } catch (error) {
                showAlert('Network error. Please check your connection and try again.', 'error');
            } finally {
                hideLoader();
            }
        });
    }
});
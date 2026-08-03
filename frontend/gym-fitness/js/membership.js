document.addEventListener('DOMContentLoaded', () => {
    const membershipForm = document.getElementById('membershipForm');
    
    if (membershipForm) {
        membershipForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                plan: document.getElementById('plan').value,
                startDate: document.getElementById('startDate').value,
                paymentMethod: document.getElementById('paymentMethod').value
            };
            
            if (!formData.name || !formData.email || !formData.phone || !formData.plan) {
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
            
            showLoader();
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/membership', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert(`Successfully signed up for ${formData.plan} plan!`, 'success');
                    membershipForm.reset();
                } else {
                    showAlert(data.message || 'Failed to sign up. Please try again.', 'error');
                }
            } catch (error) {
                showAlert('Network error. Please try again.', 'error');
            } finally {
                hideLoader();
            }
        });
    }
});
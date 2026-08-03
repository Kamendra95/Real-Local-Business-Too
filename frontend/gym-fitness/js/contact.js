document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: contactForm.querySelector('input[name="name"]').value,
                email: contactForm.querySelector('input[name="email"]').value,
                phone: contactForm.querySelector('input[name="phone"]').value,
                subject: contactForm.querySelector('select[name="subject"]').value,
                message: contactForm.querySelector('textarea[name="message"]').value,
                businessType: 'gym'
            };
            
            if (!formData.name || !formData.email || !formData.message) {
                showAlert('Please fill in all required fields', 'error');
                return;
            }
            
            if (!isValidEmail(formData.email)) {
                showAlert('Please enter a valid email address', 'error');
                return;
            }
            
            showLoader();
            
            try {
                const response = await fetch('http://localhost:5000/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
                    contactForm.reset();
                } else {
                    showAlert(data.message || 'Failed to send message. Please try again.', 'error');
                }
            } catch (error) {
                showAlert('Network error. Please check your connection and try again.', 'error');
            } finally {
                hideLoader();
            }
        });
    }
});
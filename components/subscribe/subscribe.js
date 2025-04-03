document.addEventListener('DOMContentLoaded', function() {
  // Parallax effect for subscribe section
  const subscribeSection = document.getElementById('subscribeSection');
  
  if (subscribeSection) {
    // Check if we're on a device that supports parallax well
    const supportsParallax = window.innerWidth > 768 && 
      !(/iPad|iPhone|iPod/.test(navigator.userAgent));
    
    if (supportsParallax) {
      window.addEventListener('scroll', function() {
        const scrollPosition = window.pageYOffset;
        const speed = 0.2; // Adjust for faster/slower effect
        const section = subscribeSection.getBoundingClientRect();
        
        // Only apply parallax when section is in viewport
        if (section.top < window.innerHeight && section.bottom > 0) {
          // Apply transform to create horizontal parallax effect
          subscribeSection.querySelector('::before').style.transform = 
            `translateX(${scrollPosition * speed}px)`;
        }
      });
    }
  }
  
  // Form submission handling
  const subscribeForm = document.getElementById('subscribeForm');
  
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const emailInput = document.getElementById('subscribeEmail');
      const newsletterCheckbox = document.getElementById('newsletter');
      
      // Validate email
      if (!emailInput.value.trim()) {
        showToast('Please enter your email address', 'error');
        return;
      }
      
      // Validate checkbox
      if (!newsletterCheckbox.checked) {
        showToast('Please agree to subscribe to our newsletter', 'error');
        return;
      }
      
      // If validation passes, show success toast
      showToast('Thank you for subscribing! Your 20% discount will be applied to your next order.', 'success');
      
      // Reset form
      subscribeForm.reset();
    });
  }
  
  // Toast notification function (using the same toast from cart.js)
  function showToast(message, type = 'success') {
    // Check if toast container exists, if not create it
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }
});

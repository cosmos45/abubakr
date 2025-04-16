// Only run on desktop
if (window.innerWidth > 991) {
    document.querySelectorAll('.category-dropdown-item').forEach(item => {
      item.addEventListener('mouseenter', function () {
        const subDropdown = this.querySelector('.category-subdropdown');
        if (!subDropdown) return;
  
        // Reset to default position
        subDropdown.style.left = '100%';
        subDropdown.style.right = 'auto';
        subDropdown.style.top = '0';
        subDropdown.style.maxHeight = '';
        subDropdown.style.overflowY = '';
  
        // Wait for rendering
        setTimeout(() => {
          const rect = subDropdown.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
  
          // If overflows right, open to the left
          if (rect.right > viewportWidth) {
            subDropdown.style.left = 'auto';
            subDropdown.style.right = '100%';
          }
  
          // If overflows bottom, shift up
          if (rect.bottom > viewportHeight) {
            // Calculate how much to shift up
            const overflow = rect.bottom - viewportHeight + 10; // 10px padding
            subDropdown.style.top = `-${overflow}px`;
  
            // If still too tall, limit height and scroll
            if (rect.height > viewportHeight - 40) {
              subDropdown.style.maxHeight = (viewportHeight - 40) + 'px';
              subDropdown.style.overflowY = 'auto';
            }
          }
        }, 0);
      });
    });
  }
  
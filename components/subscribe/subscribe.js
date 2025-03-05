document.addEventListener('DOMContentLoaded', function() {
    const parallaxBanner = document.querySelector('.organic-parallax-banner');
    const parallaxBg = document.querySelector('.parallax-backgrounds');
    
    if (!parallaxBanner || !parallaxBg) return;
    
    // Check if we're on a device that supports parallax well
    const supportsParallax = window.innerWidth > 768 && 
      !(/iPad|iPhone|iPod/.test(navigator.userAgent));
    
    if (supportsParallax) {
      window.addEventListener('scroll', function() {
        const scrollPosition = window.pageYOffset;
        const speed = 0.5; // Adjust for faster/slower effect
        
        // Apply transform to create smooth parallax effect
        parallaxBg.style.transform = `translateY(${scrollPosition * speed}px)`;
      });
    }
  });
  
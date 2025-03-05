class BrandBanner {
    constructor() {
      this.initialized = false;
      this.parallaxBanner = null;
    }
  
    async init() {
      if (this.initialized) return;
      
      this.parallaxBanner = document.querySelector('.brand-parallax-banner');
      
      if (!this.parallaxBanner) {
        console.warn("Parallax banner not found");
        return;
      }
      
      // Enhance parallax effect on scroll
      this.enhanceParallax();
      
      // Add button hover effect
      this.addButtonEffect();
      
      this.initialized = true;
      console.log('Brand banner parallax initialized');
    }
    
    enhanceParallax() {
      window.addEventListener('scroll', () => {
        if (!this.parallaxBanner) return;
        
        const scrollPosition = window.pageYOffset;
        const bannerPosition = this.parallaxBanner.offsetTop;
        const bannerHeight = this.parallaxBanner.offsetHeight;
        
        // Only apply effect when banner is in viewport
        if (scrollPosition + window.innerHeight > bannerPosition && 
            scrollPosition < bannerPosition + bannerHeight) {
          
          // Calculate parallax offset
          const yOffset = (scrollPosition - bannerPosition) * 0.4;
          
          // Apply subtle movement to background
          this.parallaxBanner.style.backgroundPositionY = `calc(50% + ${yOffset}px)`;
        }
      });
    }
    
    addButtonEffect() {
      const btn = document.querySelector('.btn-brand');
      if (!btn) return;
      
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-5px)';
        btn.style.boxShadow = '0 0 25px rgba(173, 216, 46, 0.8)';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.boxShadow = '';
      });
    }
  }
  
  export default BrandBanner;
  
// components/carousel/carousel.js
export function initCarousel() {
    // Header scroll behavior
    let lastScroll = 0;
    const header = document.querySelector('.header-container');
    
    // window.addEventListener('scroll', () => {
    //     const currentScroll = window.pageYOffset;
        
    //     if (currentScroll > lastScroll && currentScroll > 200) {
    //         // Scrolling down & past carousel
    //         header.classList.add('header-hidden');
    //     } else {
    //         // Scrolling up
    //         header.classList.remove('header-hidden');
    //     }
        
    //     lastScroll = currentScroll;
    // });

    // Carousel functionality
    const slides = document.querySelectorAll('.carousel-slide');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    let currentSlide = 0; // Define the currentSlide variable
    let slideInterval;
    const intervalTime = 5000; // 5 seconds between slides
    
    // Create indicators
    if (slides.length > 0 && indicatorsContainer) {
        slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (index === 0) indicator.classList.add('active');
            
            indicator.addEventListener('click', () => {
                goToSlide(index);
                resetInterval();
            });
            
            indicatorsContainer.appendChild(indicator);
        });
    }
    
    // Function to change slides
    function nextSlide() {
        if (!slides.length) return; // Safety check
        
        slides[currentSlide].classList.remove('active');
        const indicators = document.querySelectorAll('.indicator');
        if (indicators.length > currentSlide) {
            indicators[currentSlide].classList.remove('active');
        }
        
        currentSlide = (currentSlide + 1) % slides.length;
        
        slides[currentSlide].classList.add('active');
        if (indicators.length > currentSlide) {
            indicators[currentSlide].classList.add('active');
        }
    }
    
    // Function to go to a specific slide
    function goToSlide(index) {
        if (!slides.length) return; // Safety check
        
        slides[currentSlide].classList.remove('active');
        const indicators = document.querySelectorAll('.indicator');
        if (indicators.length > currentSlide) {
            indicators[currentSlide].classList.remove('active');
        }
        
        currentSlide = index;
        
        slides[currentSlide].classList.add('active');
        if (indicators.length > currentSlide) {
            indicators[currentSlide].classList.add('active');
        }
    }
    
    // Reset interval when manually changing slides
    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, intervalTime);
    }
    
    // Start the carousel
    if (slides.length > 1) {
        // Make sure first slide is active
        slides[0].classList.add('active');
        slideInterval = setInterval(nextSlide, intervalTime);
    }
    
    // Add navigation buttons for better UX
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer && slides.length > 1) {
        // Create prev button
        const prevButton = document.createElement('button');
        prevButton.className = 'carousel-control prev';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.addEventListener('click', () => {
            let prevSlide = currentSlide - 1;
            if (prevSlide < 0) prevSlide = slides.length - 1;
            goToSlide(prevSlide);
            resetInterval();
        });
        
        // Create next button
        const nextButton = document.createElement('button');
        nextButton.className = 'carousel-control next';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.addEventListener('click', () => {
            let nextSlideIndex = (currentSlide + 1) % slides.length;
            goToSlide(nextSlideIndex);
            resetInterval();
        });
        
        carouselContainer.appendChild(prevButton);
        carouselContainer.appendChild(nextButton);
    }
    
    // Handle window resize for responsive behavior
    window.addEventListener('resize', function() {
        // This ensures slides maintain proper aspect ratio on resize
        const activeSlide = document.querySelector('.carousel-slide.active');
        if (activeSlide) {
            // Force a repaint to ensure proper scaling
            activeSlide.style.display = 'none';
            setTimeout(() => {
                activeSlide.style.display = '';
            }, 10);
        }
    });
}

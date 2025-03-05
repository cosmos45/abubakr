// components/carousel/carousel.js
export function initCarousel() {
    // Header scroll behavior
    let lastScroll = 0;
    const header = document.querySelector('.header-container');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 200) {
            // Scrolling down & past carousel
            header.classList.add('header-hidden');
        } else {
            // Scrolling up
            header.classList.remove('header-hidden');
        }
        
        lastScroll = currentScroll;
    });

    // Carousel functionality
    const slides = document.querySelectorAll('.carousel-slide');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    let currentSlide = 0;
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
        slides[currentSlide].classList.remove('active');
        document.querySelectorAll('.indicator')[currentSlide].classList.remove('active');
        
        currentSlide = (currentSlide + 1) % slides.length;
        
        slides[currentSlide].classList.add('active');
        document.querySelectorAll('.indicator')[currentSlide].classList.add('active');
    }
    
    // Function to go to a specific slide
    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        document.querySelectorAll('.indicator')[currentSlide].classList.remove('active');
        
        currentSlide = index;
        
        slides[currentSlide].classList.add('active');
        document.querySelectorAll('.indicator')[currentSlide].classList.add('active');
    }
    
    // Reset interval when manually changing slides
    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, intervalTime);
    }
    
    // Start the carousel
    if (slides.length > 1) {
        slideInterval = setInterval(nextSlide, intervalTime);
    }
}

// components/carousel/carousel.js
export function initCarousel() {
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
}

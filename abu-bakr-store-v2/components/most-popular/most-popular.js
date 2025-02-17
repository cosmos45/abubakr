// components/most-popular/most-popular.js
export function initMostPopularSlider() {
    const slider = document.querySelector('#most-popular-slider');
    const prevBtn = document.querySelector('.most-popular-section .prev-btn');
    const nextBtn = document.querySelector('.most-popular-section .next-btn');
    
    if (!slider || !prevBtn || !nextBtn) return;
    
    let currentIndex = 0;
    const cardWidth = 280;
    const cardGap = 24;
    const totalWidth = cardWidth + cardGap;
    
    function updateSliderPosition() {
        if (window.innerWidth <= 768) {
            slider.style.transform = '';
            return;
        }

        const containerWidth = slider.parentElement.offsetWidth - 120;
        const visibleCards = Math.floor(containerWidth / totalWidth);
        const maxIndex = Math.max(0, slider.children.length - visibleCards);
        
        currentIndex = Math.min(currentIndex, maxIndex);
        const offset = currentIndex * totalWidth;
        
        slider.style.transform = `translateX(-${offset}px)`;
        
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;
    }
    
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSliderPosition();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        const containerWidth = slider.parentElement.offsetWidth - 120;
        const visibleCards = Math.floor(containerWidth / totalWidth);
        const maxIndex = Math.max(0, slider.children.length - visibleCards);
        
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSliderPosition();
        }
    });
    
    updateSliderPosition();
    window.addEventListener('resize', () => {
        currentIndex = 0;
        updateSliderPosition();
    });
}

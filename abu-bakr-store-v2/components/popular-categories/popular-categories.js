function initPopularCategories() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.2
    });

    // Observe all category cards
    document.querySelectorAll('.category-card').forEach(card => {
        observer.observe(card);
    });
}

export { initPopularCategories };

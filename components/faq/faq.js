export function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-question');
    const tabBtns = document.querySelectorAll('.tab-btn');

    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.nextElementSibling;
            const isActive = item.classList.contains('active');

            // Close all other answers
            document.querySelectorAll('.faq-question.active').forEach(activeItem => {
                if (activeItem !== item) {
                    activeItem.classList.remove('active');
                    activeItem.nextElementSibling.classList.remove('active');
                }
            });

            // Toggle current answer
            item.classList.toggle('active');
            answer.classList.toggle('active');
        });
    });

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, {
    threshold: 0.1
});

// Observe all feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
    card.classList.add('animate-on-scroll');
});

// Floating elements animation
const floatingElements = document.querySelectorAll('.floating-elements i');
floatingElements.forEach(element => {
    element.style.animationDuration = `${6 + Math.random() * 4}s`;
    element.style.animationDelay = `-${Math.random() * 5}s`;
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

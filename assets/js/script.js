document.addEventListener("DOMContentLoaded", function () {
    // Smooth scroll for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (event) {
            event.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    // Menu toggle for mobile
    window.toggleMenu = function () {
        const menu = document.querySelector('.menu');
        menu.classList.toggle('show');
    };

    // Lazy load images (improves page speed)
    const images = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                obs.unobserve(img);
            }
        });
    });
    images.forEach(img => observer.observe(img));

    // Back-to-top button (appears after scrolling)
    const backToTop = document.createElement('button');
    backToTop.textContent = '↑ Top';
    backToTop.className = 'back-to-top';
    document.body.appendChild(backToTop);
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
        backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
});

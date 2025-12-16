/*
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('contactOverlay');
    const openBtn = document.getElementById('openContact');
    const closeBtn = document.getElementById('closeContact');
    const form = document.getElementById('contactForm');

    openBtn.addEventListener('click', () => {
        overlay.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        form.reset();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            form.reset();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast("Message sent successfully!", "success");
        overlay.classList.remove('active');
        form.reset();
    });
});

*/
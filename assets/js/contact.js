// CONTACT.JS

emailjs.init("OhUilmHKZjlDViGXq");

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');

    if (!contactForm) return;

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        showToast("Sending your message...", "info");

        const templateParams = {
            name: document.getElementById('w3lName').value.trim(),
            email: document.getElementById('w3lSender').value.trim(),
            subject: document.getElementById('w3lSubject').value.trim(),
            message: document.getElementById('w3lMessage').value.trim()
        };

        emailjs.send('service_jkfz31k', 'template_blv0pao', templateParams)
            .then(() => {
                showToast("Message sent successfully!", "success");
                contactForm.reset();
            })
            .catch((error) => {
                console.error('EmailJS error:', error);
                showToast("Failed to send message. Try again.", "error");
            });
    });
});
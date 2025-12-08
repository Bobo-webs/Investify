// kyc-full.js — FINAL MERGED: Validation + Submission + Toasts + Spinner + Fit-content

import { auth, db } from "/assets/js/firebase-init.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const steps = ['stepPersonal', 'stepAddress', 'stepDocuments', 'stepReview'];
    const stepEls = steps.map(id => document.getElementById(id));
    const stepCircles = [
        document.getElementById('kycStep1'),
        document.getElementById('kycStep2'),
        document.getElementById('kycStep3'),
        document.getElementById('kycStep4')
    ];

    let current = 0;

    // TOAST — RED (error) / GREEN (success) / ORANGE + SPINNER (info)
    function showToast(message, type = 'error') {
        let color, icon, hasSpinner = false;

        if (type === 'success') {
            color = '#16a34a';
            icon = '<circle cx="12" cy="12" r="10"></circle><polyline points="20 6 9 17 4 12"></polyline>';
        } else if (type === 'info') {
            color = '#f97316'; // Caution Orange
            icon = '<circle cx="12" cy="12" r="10"></circle><path d="M12 8h.01M12 12h.01M12 16h.01"/>';
            hasSpinner = true;
        } else {
            color = '#dc2626';
            icon = '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>';
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed;top:20px;left:50%;transform:translateX(-50%);
            z-index:99999;pointer-events:none;font-family:Poppins,sans-serif;
        `;

        const inner = document.createElement('div');
        inner.style.cssText = `
            background:${color};color:white;padding:16px 24px;border-radius:16px;
            font-weight:600;font-size:15px;box-shadow:0 12px 32px rgba(0,0,0,0.3);
            display:flex;align-items:center;gap:14px;width:fit-content;max-width:90vw;
            min-width:260px;opacity:0;transform:translateY(-30px);transition:all 0.5s ease;
        `;

        inner.innerHTML = `
            ${hasSpinner ? `
                <div style="width:22px;height:22px;border:3px solid #ffffff40;border-top:3px solid white;border-radius:50%;animation:spin 1s linear infinite;"></div>
            ` : `
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    ${icon}
                </svg>
            `}
            <span>${message}</span>
        `;

        toast.appendChild(inner);
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            inner.style.opacity = '1';
            inner.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            inner.style.opacity = '0';
            inner.style.transform = 'translateY(-30px)';
            setTimeout(() => toast.remove(), 600);
        }, 3500);
    }

    // Spinner animation
    if (!document.getElementById('toast-spinner-style')) {
        const style = document.createElement('style');
        style.id = 'toast-spinner-style';
        style.textContent = `
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    }

    // VALIDATE CURRENT STEP
    function validateCurrentStep() {
        const inputs = stepEls[current].querySelectorAll('input[required], select[required]');
        let valid = true;
        inputs.forEach(input => {
            if (input.type === 'file') {
                if (!input.files || input.files.length === 0) { valid = false; input.style.borderColor = '#ef4444'; }
                else input.style.borderColor = '';
            } else {
                if (!input.value.trim()) { valid = false; input.style.borderColor = '#ef4444'; }
                else input.style.borderColor = '';
            }
        });
        return valid;
    }

    function updateStepCircles() {
        stepCircles.forEach((c, i) => c.classList.toggle('active', i <= current));
    }

    function goToStep(n) {
        if (n > current && !validateCurrentStep()) {
            showToast("Please fill all required fields", "error");
            return;
        }
        stepEls.forEach((el, i) => el.classList.toggle('active', i === n));
        current = n;
        updateStepCircles();
    }

    // NAVIGATION
    const nav = { 'toAddress': 1, 'backToPersonal': 0, 'toDocuments': 2, 'backToAddress': 1, 'toReview': 3, 'backToDocs': 2 };
    Object.keys(nav).forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.onclick = () => goToStep(nav[id]);
    });

    // FINAL SUBMIT
    document.getElementById('kycSubmitBtn').onclick = async (e) => {
        e.preventDefault();

        let allValid = true;
        stepEls.forEach((step, i) => {
            if (i < 3) {
                const inputs = step.querySelectorAll('input[required], select[required]');
                inputs.forEach(input => {
                    if ((input.type === 'file' && input.files.length === 0) || (input.type !== 'file' && !input.value.trim())) {
                        allValid = false;
                    }
                });
            }
        });

        if (!allValid) {
            showToast("Please complete all required fields", "error");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            showToast("Please log in", "error");
            return;
        }

        try {
            const fileToBase64 = (file) => new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });

            showToast("Submitting KYC...", "info"); // Orange + Spinner

            const frontFile = document.getElementById('kycFront').files[0];
            const backFile = document.getElementById('kycBack').files[0];

            const kycData = {
                uid: user.uid,
                fullName: document.getElementById('kycName').value.trim(),
                dateOfBirth: document.getElementById('kycDOB').value,
                phone: document.getElementById('kycPhone').value.trim(),
                street: document.getElementById('kycStreet').value.trim(),
                city: document.getElementById('kycCity').value.trim(),
                state: document.getElementById('kycState').value.trim(),
                postalCode: document.getElementById('kycPostal').value.trim(),
                country: document.getElementById('kycCountry').value,
                documentType: document.getElementById('kycDocType').value,
                idFront: await fileToBase64(frontFile),
                idBack: backFile ? await fileToBase64(backFile) : null,
                status: "pending",
                timestamp: Date.now(),
                submittedAt: new Date().toISOString()
            };

            await set(ref(db, `kycSubmissions/${user.uid}`), kycData);

            showToast("KYC Submitted Successfully!", "success");

            document.getElementById('kycForm').reset();
            document.querySelectorAll('input[type="file"]').forEach(f => f.value = '');
            document.querySelectorAll('input, select').forEach(el => el.style.borderColor = '');
            goToStep(0);

        } catch (error) {
            console.error("KYC FAILED:", error);
            showToast("Submission failed. Try again.", "error");
        }
    };

    goToStep(0);
});
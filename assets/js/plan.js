// PLAN.JS

import { auth, db } from "/assets/js/firebase-init.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { onValue } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const switchInput = document.getElementById('billingSwitch');
    const modalOverlay = document.getElementById('subModalOverlay');
    const selectedPlanName = document.getElementById('selectedPlanName');
    const selectedRate = document.getElementById('selectedRate');
    const selectedPrice = document.getElementById('selectedPrice');
    const userBalanceEl = document.getElementById('userBalance');
    const confirmBtn = document.getElementById('confirmSubscription');

    let selectedPlan = null;
    let isYearly = false;

    // TOGGLE MONTHLY/YEARLY
    if (switchInput) {
        switchInput.addEventListener('change', () => {
            isYearly = switchInput.checked;

            document.querySelectorAll('.price-amount').forEach(el => {
                el.textContent = isYearly ? el.dataset.yearly : el.dataset.monthly;
            });

            document.querySelectorAll('.price-period').forEach(el => {
                if (el.closest('.plan-card').dataset.plan === 'free') {
                    el.textContent = "/ forever";
                } else {
                    el.textContent = isYearly ? "/ year" : "/ month";
                }
            });
        });
    }

    // OPEN MODAL ON SUBSCRIBE CLICK
    document.querySelectorAll('.plan-subscribe').forEach(btn => {
        btn.addEventListener('click', async () => {
            const card = btn.closest('.plan-card');
            selectedPlan = card.dataset.plan;

            const planName = card.querySelector('.plan-header h4').textContent;
            const rate = card.querySelector('.plan-rate').textContent;
            const priceAmount = card.querySelector('.price-amount').textContent;
            const period = card.querySelector('.price-period').textContent;

            selectedPlanName.textContent = planName;
            selectedRate.textContent = rate;
            selectedPrice.textContent = priceAmount + period;

            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const balanceSnap = await get(ref(db, `users/${user.uid}/balance`));
                    const balance = parseFloat(balanceSnap.val()) || 0;
                    userBalanceEl.textContent = `$${balance.toFixed(2)} USD`;
                }
            });

            modalOverlay.classList.add('active');
        });
    });

    // CLOSE MODAL
    document.getElementById('closeSubModal')?.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });

    // CONFIRM SUBSCRIPTION
    confirmBtn?.addEventListener('click', async () => {
        onAuthStateChanged(auth, async (user) => {
            if (!user || !selectedPlan) return;

            const card = document.querySelector(`.plan-card[data-plan="${selectedPlan}"]`);
            const priceStr = isYearly ? card.dataset.yearly : card.dataset.monthly;
            const price = Number(priceStr);

            try {
                const balanceSnap = await get(ref(db, `users/${user.uid}/balance`));
                const balance = parseFloat(balanceSnap.val()) || 0;

                if (balance < price) {
                    showToast("Insufficient balance", "error");
                    modalOverlay.classList.remove('active');
                    return;
                }

                await set(ref(db, `users/${user.uid}/balance`), (balance - price).toFixed(2));

                const days = isYearly ? 365 : 30;
                const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);

                await set(ref(db, `users/${user.uid}/subscription`), {
                    plan: selectedPlan,
                    billing: isYearly ? "yearly" : "monthly",
                    startDate: Date.now(),
                    expiryDate: expiry,
                    boostPercent: selectedPlan === "free" ? 0 : selectedPlan === "couples" ? 40 : 50
                });

                showToast("Subscription successful!", "success");
                modalOverlay.classList.remove('active');

                updatePlanUI(selectedPlan);

            } catch (error) {
                console.error("Subscription failed:", error);
                showToast("Subscription failed", "error");
            }
        });
    });

    // UPDATE UI BASED ON CURRENT PLAN
    function updatePlanUI(currentPlan) {
        document.querySelectorAll('.plan-card').forEach(card => {
            const btn = card.querySelector('.plan-subscribe');
            card.classList.remove('active');

            if (card.dataset.plan === currentPlan) {
                card.classList.add('active');
                btn.textContent = "Current Plan";
                btn.disabled = true;
            } else {
                if (currentPlan === "free") {
                    // Free active → others have "Subscribe Now"
                    btn.textContent = "Subscribe Now";
                    btn.disabled = false;
                } else {
                    // Paid active → remove buttons from others
                    btn.style.display = "none";
                }
            }
        });
    }

    // LOAD CURRENT PLAN ON PAGE LOAD
    onAuthStateChanged(auth, (user) => {
        if (!user) return;

        onValue(ref(db, `users/${user.uid}/subscription`), (snap) => {
            const sub = snap.val();
            const currentPlan = sub?.plan || "free";
            updatePlanUI(currentPlan);
        });
    });
});
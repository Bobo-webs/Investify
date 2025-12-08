// DASHBOARD.JS
import { auth, db } from "/assets/js/firebase-init.js";

import {
    ref as dbRef,
    get,
    update,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";


// -------------------------------------
// DOM ELEMENTS
// -------------------------------------
const logoutButtons = document.querySelectorAll(".logoutBtn");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const confirmationPopup = document.getElementById("confirmationPopup");
const loadingScreen = document.getElementById("loading-overlay");

// popup overlay might be named differently across pages; try both IDs
const popupOverlay = document.getElementById("popupOverlay") || document.getElementById("popup-overlay");

// -------------------------------------
// LOADING HELPERS
// -------------------------------------
function showLoading() {
    if (loadingScreen) loadingScreen.style.display = "flex";
}

function hideLoading() {
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.display = "none";
        }, 300);
    }
}

// -------------------------------------
// AUTH CHECK
// -------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    showLoading();

    onAuthStateChanged(auth, async (user) => {
        if (user) {

            // 🔥 IMPORTANT — Refresh auth user info first
            await user.reload();

            // 🔥 AUTHENTICATED FIREBASE EMAIL (after verification)
            const authEmail = user.email;

            // 🔥 SYNC EMAIL WITH DATABASE IF DIFFERENT
            const userRef = dbRef(db, `users/${user.uid}/email`);

            onValue(userRef, async (snapshot) => {
                const dbEmail = snapshot.val();

                if (dbEmail !== authEmail) {
                    // Update DB only AFTER verification
                    await update(dbRef(db, `users/${user.uid}`), {
                        email: authEmail
                    });

                    console.log(
                        "%cEmail synced with database after verification: " + authEmail,
                        "color:#22c55e;font-weight:bold;"
                    );
                }
            });

            // Load user data afterward
            displayUserData(user.uid).finally(() => {
                hideLoading();
            });

        } else {
            // Not logged in — redirect to login page
            window.location.href = "login.html";
        }
    });
});


// -------------------------------------
// DISPLAY USER DATA — SAFE, MODULAR, NEVER BREAKS
// -------------------------------------
async function displayUserData(uid) {
    try {
        const snapshot = await get(dbRef(db, `users/${uid}`));
        if (!snapshot.exists()) {
            console.warn("No user data found for UID:", uid);
            return;
        }

        const data = snapshot.val();

        // Extract values safely
        const firstname = (data.firstname || "User").toString().trim();
        const balance = Number(data.balance || 0);
        const deposits = Number(data.deposits || 0);
        const withdrawals = Number(data.withdrawals || 0);

        // Helper to format currency
        const fmt = (num) => `$${num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

        // === UPDATE ONLY IF ELEMENT EXISTS ON CURRENT PAGE ===
        const heroTitle = document.getElementById("userTitle");
        if (heroTitle) heroTitle.innerHTML = `Hello, ${firstname}`;

        const profileUsername = document.querySelector(".profile-trigger .username");
        if (profileUsername) profileUsername.textContent = firstname;

        const availableBalance = document.querySelector(".tx-available span");
        if (availableBalance) availableBalance.textContent = fmt(balance);

        // TOTAL BALANCE (visible version)
        const totalBalance = document.getElementById("totalBalance");
        if (totalBalance) totalBalance.textContent = fmt(balance);

        // TOTAL DEPOSITS
        const totalDeposits = document.getElementById("totalDeposits");
        if (totalDeposits) totalDeposits.textContent = fmt(deposits);

        // TOTAL WITHDRAWALS
        const totalWithdrawals = document.getElementById("totalWithdrawals");
        if (totalWithdrawals) totalWithdrawals.textContent = fmt(withdrawals);

        console.log("User data displayed successfully");

    } catch (error) {
        console.error("Failed to load user data:", error);
    }
}



// -------------------------------------
// POPUP CONTROL
// -------------------------------------

function showPopup() {
    confirmationPopup?.classList.add("show");
    popupOverlay?.classList.add("show");
}

function hidePopup() {
    confirmationPopup?.classList.remove("show");
    popupOverlay?.classList.remove("show");
}

logoutButtons.forEach(btn => {
    btn.addEventListener("click", showPopup);
});

// YES → Logout user
confirmYes?.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            hidePopup();
            window.location.href = "login.html"; // redirect
        })
        .catch((err) => {
            console.error("Error signing out:", err);
            hidePopup();
        });
});

// NO → Close popup
confirmNo?.addEventListener("click", hidePopup);

popupOverlay?.addEventListener("click", hidePopup);



// -------------------------------------
// THEME TOGGLER
// -------------------------------------
/*
const themeToggle = document.querySelector('.theme-toggle');

        // Load saved theme
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
        }

        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();

            document.documentElement.classList.toggle('dark');

            // Save preference
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
*/
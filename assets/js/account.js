/* ════ ACCOUNT.JS  ════ */

import { auth, db } from "/assets/js/firebase-init.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const EMAIL_RE = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const USER_RE = /^[a-zA-Z][a-zA-Z0-9._]{1,15}$/;

const isValidEmail = v => EMAIL_RE.test(String(v).toLowerCase());
const isValidUsername = v => USER_RE.test(v);

// ─────────────────────────────────────────────
// DOM REFERENCES
// ─────────────────────────────────────────────
const dom = {
    // Theme
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('theme-icon'),

    // Tabs
    tabSignin: document.getElementById('tab-signin'),
    tabSignup: document.getElementById('tab-signup'),
    panelSignin: document.getElementById('panel-signin'),
    panelSignup: document.getElementById('panel-signup'),

    // Loading overlay
    loadingOverlay: document.getElementById('loading-overlay'),
    loadingMsg: document.getElementById('loading-msg'),

    // Sign in fields
    siEmail: document.getElementById('si-email'),
    siPassword: document.getElementById('si-password'),
    siEmailField: document.getElementById('si-email-field'),
    siPassField: document.getElementById('si-pass-field'),
    siEmailMsg: document.getElementById('si-email-msg'),
    siPassMsg: document.getElementById('si-pass-msg'),
    siEye: document.getElementById('si-eye'),
    signinBtn: document.getElementById('signin-btn'),

    // Sign up fields
    firstname: document.getElementById('firstname'),
    lastname: document.getElementById('lastname'),
    suEmail: document.getElementById('su-email'),
    suPassword: document.getElementById('su-password'),
    suPassword2: document.getElementById('su-password2'),
    suUserField: document.getElementById('su-user-field'),
    suNameField: document.getElementById('su-name-field'),
    suEmailField: document.getElementById('su-email-field'),
    suPassField: document.getElementById('su-pass-field'),
    suPass2Field: document.getElementById('su-pass2-field'),
    suUserMsg: document.getElementById('su-user-msg'),
    suNameMsg: document.getElementById('su-name-msg'),
    suEmailMsg: document.getElementById('su-email-msg'),
    suPassMsg: document.getElementById('su-pass-msg'),
    suPass2Msg: document.getElementById('su-pass2-msg'),
    suEye: document.getElementById('su-eye'),
    suEye2: document.getElementById('su-eye2'),
    signupBtn: document.getElementById('signup-btn'),

    // Strength bar segments
    strengthSegs: [
        document.getElementById('seg1'),
        document.getElementById('seg2'),
        document.getElementById('seg3'),
        document.getElementById('seg4'),
    ],

    // Chart elements
    tradingCanvas: document.getElementById('tradingChart'),
    btcPrice: document.getElementById('btc-price'),
    btcChange: document.getElementById('btc-change'),
    traderCount: document.getElementById('trader-count'),
};

// ─────────────────────────────────────────────
// LOADING OVERLAY
// ─────────────────────────────────────────────
function showLoading(msg = 'Please wait...') {
    dom.loadingMsg.textContent = msg;
    dom.loadingOverlay.classList.add('show');
}

function hideLoading() {
    dom.loadingOverlay.classList.remove('show');
}

// ─────────────────────────────────────────────
// FIELD STATE HELPERS
// ─────────────────────────────────────────────
function fieldError(fieldEl, msgEl, msg) {
    fieldEl.classList.add('is-error');
    fieldEl.classList.remove('is-success');
    msgEl.textContent = msg;
}

function fieldSuccess(fieldEl, msgEl) {
    fieldEl.classList.remove('is-error');
    fieldEl.classList.add('is-success');
    if (msgEl) msgEl.textContent = '';
}

function fieldReset(fieldEl, msgEl) {
    fieldEl.classList.remove('is-error', 'is-success');
    if (msgEl) msgEl.textContent = '';
}

// ─────────────────────────────────────────────
// BUTTON STATE HELPERS
// ─────────────────────────────────────────────
function btnLoading(btn) {
    btn.classList.add('loading');
    btn.disabled = true;
}

function btnReset(btn) {
    btn.classList.remove('loading');
    btn.disabled = false;
}

// ─────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    dom.themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('investify_theme', theme);
}

function initTheme() {
    const saved = localStorage.getItem('investify_theme');
    applyTheme(saved === 'light' ? 'light' : 'dark');

    dom.themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });
}

// ─────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────
function activateTab(tab) {
    const isSignIn = tab === 'signin';

    dom.tabSignin.classList.toggle('active', isSignIn);
    dom.tabSignup.classList.toggle('active', !isSignIn);
    dom.tabSignin.setAttribute('aria-selected', String(isSignIn));
    dom.tabSignup.setAttribute('aria-selected', String(!isSignIn));
    dom.panelSignin.classList.toggle('active', isSignIn);
    dom.panelSignup.classList.toggle('active', !isSignIn);

    sessionStorage.setItem('investify_auth_tab', tab);
}

function initTabs() {
    const saved = sessionStorage.getItem('investify_auth_tab');
    if (saved === 'signup') activateTab('signup');

    dom.tabSignin.addEventListener('click', () => activateTab('signin'));
    dom.tabSignup.addEventListener('click', () => activateTab('signup'));
}

// ─────────────────────────────────────────────
// EYE TOGGLES
// ─────────────────────────────────────────────
function bindEye(eyeEl, inputEl) {
    eyeEl.addEventListener('click', () => {
        const isHidden = inputEl.type === 'password';
        inputEl.type = isHidden ? 'text' : 'password';
        eyeEl.innerHTML = isHidden
            ? '<i class="fa-solid fa-eye"></i>'
            : '<i class="fa-solid fa-eye-slash"></i>';
    });
}

function initEyeToggles() {
    bindEye(dom.siEye, dom.siPassword);
    bindEye(dom.suEye, dom.suPassword);
    bindEye(dom.suEye2, dom.suPassword2);
}

// ─────────────────────────────────────────────
// PASSWORD STRENGTH
// ─────────────────────────────────────────────
const STRENGTH_COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80'];

function updateStrength(val) {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    dom.strengthSegs.forEach((seg, i) => {
        seg.style.background = i < score ? STRENGTH_COLORS[score - 1] : '';
    });
}

function initStrengthBar() {
    dom.suPassword.addEventListener('input', e => updateStrength(e.target.value));
}

function initTradingChart() {
    const canvas = dom.tradingCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.parentElement.clientWidth - 48;
    canvas.width = W;
    canvas.height = 160;

    const N = 80;
    const data = [];
    let base = 67420;

    for (let i = 0; i < N; i++) {
        base += (Math.random() - 0.48) * 220;
        data.push(base);
    }

    // ── Draw ──
    function drawFrame() {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        ctx.clearRect(0, 0, W, 160);

        const min = Math.min(...data) - 200;
        const max = Math.max(...data) + 200;
        const range = max - min;
        const toY = v => 10 + ((max - v) / range) * 140;
        const toX = i => (i / (N - 1)) * W;

        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        for (let g = 0; g < 5; g++) {
            const y = 10 + g * 35;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        const grad = ctx.createLinearGradient(0, 0, 0, 160);
        grad.addColorStop(0, 'rgba(255,120,0,0.2)');
        grad.addColorStop(1, 'rgba(255,120,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(toX(0), toY(data[0]));
        for (let i = 1; i < N; i++) {
            const px = toX(i - 1), py = toY(data[i - 1]);
            const cx = toX(i), cy = toY(data[i]);
            ctx.bezierCurveTo(px + (cx - px) * 0.5, py, px + (cx - px) * 0.5, cy, cx, cy);
        }
        ctx.lineTo(W, 160); ctx.lineTo(0, 160); ctx.closePath(); ctx.fill();

        ctx.strokeStyle = 'rgba(255,120,0,0.85)';
        ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(toX(0), toY(data[0]));
        for (let i = 1; i < N; i++) {
            const px = toX(i - 1), py = toY(data[i - 1]);
            const cx = toX(i), cy = toY(data[i]);
            ctx.bezierCurveTo(px + (cx - px) * 0.5, py, px + (cx - px) * 0.5, cy, cx, cy);
        }
        ctx.stroke();

        const ex = toX(N - 1), ey = toY(data[N - 1]);
        ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ff7800'; ctx.fill();
        const dotAlpha = 0.3 + 0.3 * Math.sin(Date.now() / 400);
        ctx.beginPath(); ctx.arc(ex, ey, 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,120,0,${dotAlpha})`; ctx.fill();
    }

    // ── Animate chart line ──
    let tick = 0;
    function animate() {
        tick++;
        if (tick % 12 === 0) {
            data.shift();
            const last = data[data.length - 1];
            data.push(last + (Math.random() - 0.48) * 180);

            const price = data[data.length - 1];
            const pct = ((price - data[0]) / data[0] * 100).toFixed(2);
            const isUp = parseFloat(pct) >= 0;
            if (dom.btcPrice) dom.btcPrice.textContent = '$' + price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            if (dom.btcChange) {
                dom.btcChange.textContent = (isUp ? '+' : '') + pct + '%';
                dom.btcChange.className = 'chart-change ' + (isUp ? 'up' : 'down');
            }
        }
        drawFrame();
        requestAnimationFrame(animate);
    }

    animate();

    // ── Seed BTC chart from real price ──
    function seedBtcChart(realPrice) {
        data.length = 0;
        let seed = realPrice * 0.985;
        for (let i = 0; i < N; i++) {
            seed += (Math.random() - 0.47) * (realPrice * 0.0008);
            data.push(seed);
        }
        data[N - 1] = realPrice;
    }

    // ── CoinGecko: BTC live price ──
    async function fetchCrypto() {
        try {
            const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
            if (!res.ok) return;
            const json = await res.json();

            if (json.bitcoin) {
                const btcPrice = json.bitcoin.usd;
                const btcChg = json.bitcoin.usd_24h_change ?? 0;
                const isUp = btcChg >= 0;
                seedBtcChart(btcPrice);
                if (dom.btcPrice) dom.btcPrice.textContent = '$' + btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                if (dom.btcChange) {
                    dom.btcChange.textContent = (isUp ? '+' : '') + btcChg.toFixed(2) + '%';
                    dom.btcChange.className = 'chart-change ' + (isUp ? 'up' : 'down');
                }
            }
        } catch (_) {
            // silently fail — animation keeps running from last known price
        }
    }

    // ── Trader count pulse ──
    let tc = 12480;
    setInterval(() => {
        tc += Math.floor(Math.random() * 7) - 2;
        if (dom.traderCount) dom.traderCount.textContent = tc.toLocaleString();
    }, 3000);

    // ── Boot ──
    fetchCrypto();
    setInterval(fetchCrypto, 60000);
}

// ─────────────────────────────────────────────
// SIGN IN
// ─────────────────────────────────────────────
function initSignIn() {
    const { signinBtn, siEmail, siPassword, siEmailField, siPassField, siEmailMsg, siPassMsg } = dom;

    async function handleSignIn(e) {
        e.preventDefault();

        fieldReset(siEmailField, siEmailMsg);
        fieldReset(siPassField, siPassMsg);

        const emailVal = siEmail.value.trim();
        const passVal = siPassword.value.trim();
        let valid = true;

        if (!emailVal) {
            fieldError(siEmailField, siEmailMsg, 'Email is required');
            valid = false;
        } else if (!isValidEmail(emailVal)) {
            fieldError(siEmailField, siEmailMsg, 'Enter a valid email address');
            valid = false;
        } else {
            fieldSuccess(siEmailField, siEmailMsg);
        }

        if (!passVal) {
            fieldError(siPassField, siPassMsg, 'Password is required');
            valid = false;
        } else {
            fieldSuccess(siPassField, siPassMsg);
        }

        if (!valid) return;

        btnLoading(signinBtn);
        showLoading('Authenticating...');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, emailVal, passVal);
            const user = userCredential.user;

            const snapshot = await get(ref(db, `users/${user.uid}`));
            if (!snapshot.exists()) {
                showToast('Account error — contact support', 'error');
                hideLoading();
                btnReset(signinBtn);
                return;
            }

            const role = snapshot.val().role || 'user';
            hideLoading();
            showToast('Welcome back! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = role === 'admin' ? 'admin.html' : 'dashboard-crypto.html';
            }, 1500);

        } catch (err) {
            hideLoading();
            btnReset(signinBtn);

            const { code } = err;
            if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
                showToast('Invalid email or password', 'error');
                fieldError(siEmailField, siEmailMsg, ' ');
                fieldError(siPassField, siPassMsg, 'Invalid credentials');
            } else if (code === 'auth/network-request-failed') {
                showToast('Network error — check your connection', 'error');
            } else if (code === 'auth/too-many-requests') {
                showToast('Too many attempts — try again later', 'error');
            } else {
                showToast('Sign in failed — try again', 'error');
            }
        }
    }

    signinBtn.addEventListener('click', handleSignIn);

    // Enter key support on sign-in fields
    [siEmail, siPassword].forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') signinBtn.click(); });
    });
}

// ─────────────────────────────────────────────
// SIGN UP
// ─────────────────────────────────────────────
function initSignUp() {
    const {
        signupBtn, firstname, lastname,
        suEmail, suPassword, suPassword2,
        suUserField, suNameField, suEmailField, suPassField, suPass2Field,
        suUserMsg, suNameMsg, suEmailMsg, suPassMsg, suPass2Msg,
    } = dom;

    function validateSignUp() {
        // Reset all fields first
        [
            [suUserField, suUserMsg],
            [suNameField, suNameMsg],
            [suEmailField, suEmailMsg],
            [suPassField, suPassMsg],
            [suPass2Field, suPass2Msg],
        ].forEach(([f, m]) => fieldReset(f, m));

        let isValid = true;

        const uVal = firstname.value.trim();
        if (!uVal) {
            fieldError(suUserField, suUserMsg, 'Username is required');
            isValid = false;
        } else if (!isValidUsername(uVal)) {
            fieldError(suUserField, suUserMsg, '2–16 chars, start with a letter. Letters, numbers, _ and . only');
            isValid = false;
        } else {
            fieldSuccess(suUserField, suUserMsg);
        }

        const nVal = lastname.value.trim();
        if (!nVal) {
            fieldError(suNameField, suNameMsg, 'Full name is required');
            isValid = false;
        } else {
            fieldSuccess(suNameField, suNameMsg);
        }

        const eVal = suEmail.value.trim();
        if (!eVal) {
            fieldError(suEmailField, suEmailMsg, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(eVal)) {
            fieldError(suEmailField, suEmailMsg, 'Enter a valid email address');
            isValid = false;
        } else {
            fieldSuccess(suEmailField, suEmailMsg);
        }

        const pVal = suPassword.value.trim();
        if (!pVal) {
            fieldError(suPassField, suPassMsg, 'Password is required');
            isValid = false;
        } else if (pVal.length < 8) {
            fieldError(suPassField, suPassMsg, 'Minimum 8 characters');
            isValid = false;
        } else {
            fieldSuccess(suPassField, suPassMsg);
        }

        const p2Val = suPassword2.value.trim();
        if (!p2Val) {
            fieldError(suPass2Field, suPass2Msg, 'Please confirm your password');
            isValid = false;
        } else if (p2Val !== pVal) {
            fieldError(suPass2Field, suPass2Msg, 'Passwords do not match');
            isValid = false;
        } else {
            fieldSuccess(suPass2Field, suPass2Msg);
        }

        return { isValid, uVal, nVal, eVal, pVal };
    }

    async function handleSignUp(e) {
        e.preventDefault();

        const { isValid, uVal, nVal, eVal, pVal } = validateSignUp();
        if (!isValid) return;

        btnLoading(signupBtn);
        showLoading('Creating your account...');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, eVal, pVal);
            const user = userCredential.user;

            await set(ref(db, 'users/' + user.uid), {
                firstname: uVal,
                lastname: nVal,
                email: eVal,
                balance: 0,
                deposits: 0,
                withdrawals: 0,
                cryptoSignal: '',
                forexSignal: '',
                indexSignal: '',
                stockSignal: '',
                referrals: 0,
                role: 'user',
            });

            hideLoading();
            showToast('Account created! Please sign in.', 'success');

            // Switch to sign-in tab and pre-fill email for a smooth handoff
            setTimeout(() => {
                btnReset(signupBtn);
                activateTab('signin');
                dom.siEmail.value = eVal;
                dom.siEmail.focus();
            }, 1600);

        } catch (err) {
            hideLoading();
            btnReset(signupBtn);

            const { code } = err;
            if (code === 'auth/email-already-in-use') {
                fieldError(suEmailField, suEmailMsg, 'This email is already registered');
                showToast('Email already in use', 'error');
            } else if (code === 'auth/network-request-failed') {
                showToast('Network error — check your connection', 'error');
            } else if (code === 'auth/weak-password') {
                fieldError(suPassField, suPassMsg, 'Password is too weak');
                showToast('Choose a stronger password', 'error');
            } else {
                showToast(err.message || 'Registration failed — try again', 'error');
            }
        }
    }

    signupBtn.addEventListener('click', handleSignUp);

    // Enter key on last field
    suPassword2.addEventListener('keydown', e => { if (e.key === 'Enter') signupBtn.click(); });
}

// ─────────────────────────────────────────────
// BOOT — runs after DOM is ready
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTabs();
    initEyeToggles();
    initStrengthBar();
    initTradingChart();
    initSignIn();
    initSignUp();
});

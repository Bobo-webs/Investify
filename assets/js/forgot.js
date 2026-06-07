import { auth } from "/assets/js/firebase-init.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

// ── Form logic ──
const btn = document.getElementById('submit');
const emailEl = document.getElementById('email');
const fieldEl = document.getElementById('email-field');
const msgEl = document.getElementById('email-msg');

const EMAIL_RE = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function setError(msg) {
  fieldEl.classList.add('is-error');
  msgEl.textContent = msg;
}

function clearError() {
  fieldEl.classList.remove('is-error');
  msgEl.textContent = '';
}

emailEl.addEventListener('input', clearError);

emailEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') btn.click();
});

// Sent State
function showSentState() {
  const card = document.querySelector('.forgot-card');

  card.querySelector('.field').style.display = 'none';
  card.querySelector('.btn-submit').style.display = 'none';
  card.querySelector('.back-link').style.display = 'none';

  card.querySelector('.card-title').textContent = 'Check your inbox';
  card.querySelector('.card-sub').textContent = "We've sent a password reset link to your email. If it doesn't show up in a minute or two, check your spam folder.";

  const badge = card.querySelector('.icon-badge');
  badge.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
  badge.style.background = 'rgba(74, 222, 128, 0.12)';
  badge.style.borderColor = 'rgba(74, 222, 128, 0.25)';
  badge.style.color = '#4ade80';

  const backLink = card.querySelector('.back-link');
  backLink.style.display = 'flex';
}

btn.addEventListener('click', async (e) => {
  e.preventDefault();
  clearError();

  const email = emailEl.value.trim();

  if (!email) {
    setError('Email address is required');
    return;
  }

  if (!EMAIL_RE.test(email.toLowerCase())) {
    setError('Enter a valid email address');
    return;
  }

  btn.classList.add('loading');
  btn.disabled = true;

  try {
    await sendPasswordResetEmail(auth, email);
    showToast("Reset link sent!", "success");
    emailEl.value = '';
    showSentState();

  } catch (err) {
    const { code } = err;
    if (code === 'auth/network-request-failed') {
      showToast('Network error — check your connection', 'error');
    } else if (code === 'auth/too-many-requests') {
      showToast('Too many attempts — try again later', 'error');
    } else {
      showToast("Reset link sent!", "success");
    }
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
});
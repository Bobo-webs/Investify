// REGISTER.JS

import { auth, db } from "/assets/js/firebase-init.js";
import {
    createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

import {
  ref,
  set
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

console.log("%cREGISTER MODULE LOADED", "color:#8b5cf6;font-weight:bold;font-size:16px;background:#000;padding:8px 16px;border-radius:8px;");

// DOM Elements
const firstname = document.getElementById("firstname");
const lastname = document.getElementById("lastname");
const email = document.getElementById("email");
const password = document.getElementById("password");
const password2 = document.getElementById("password2");
const submit = document.getElementById("submit");
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popup-message");

// Loading Overlay functions
const showLoading = () => {
  document.getElementById("loading-overlay").classList.add("show");
};

const hideLoading = () => {
  document.getElementById("loading-overlay").classList.remove("show");
};

// Form validation
const setError = (element, message) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");
  errorDisplay.innerText = message;
  inputControl.classList.add("error");
  inputControl.classList.remove("success");
};

const setSuccess = (element) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");
  errorDisplay.innerText = "";
  inputControl.classList.add("success");
  inputControl.classList.remove("error");
};

const isValidEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const isValidUsername = (username) => {
  const re = /^[a-zA-Z][a-zA-Z0-9._]{1,15}$/;
  return re.test(username);
};

const validateInputs = async () => {
  const firstnameValue = firstname.value.trim();
  const lastnameValue = lastname.value.trim();
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();
  const password2Value = password2.value.trim();

  let isValid = true;

  if (firstnameValue === "") {
    setError(firstname, "Username is required");
    isValid = false;
  } else if (!isValidUsername(firstnameValue)) {
    setError(
      firstname,
      "3-16 chars, begin with a letter. Contain: letters, numbers, underscores, and periods."
    );
    isValid = false;
  } else {
    setSuccess(firstname);
  }

  if (lastnameValue === "") {
    setError(lastname, "Full name is required");
    isValid = false;
  } else {
    setSuccess(lastname);
  }

  if (emailValue === "") {
    setError(email, "Email is required");
    isValid = false;
  } else if (!isValidEmail(emailValue)) {
    setError(email, "Provide a valid email address");
    isValid = false;
  } else {
    setSuccess(email);
  }

  if (passwordValue === "") {
    setError(password, "Password is required");
    isValid = false;
  } else if (passwordValue.length < 8) {
    setError(password, "Password must be at least 8 characters.");
    isValid = false;
  } else {
    setSuccess(password);
  }

  if (password2Value === "") {
    setError(password2, "Please confirm your password");
    isValid = false;
  } else if (password2Value !== passwordValue) {
    setError(password2, "Passwords don't match");
    isValid = false;
  } else {
    setSuccess(password2);
  }

  return isValid;
};

// Popup functions
const showPopup = (message) => {
  popupMessage.textContent = message;
  popup.classList.add("show");
};

// Main Submit Logic with Loading Integration
submit.addEventListener("click", async (event) => {
  event.preventDefault();

  if (await validateInputs()) {
    const emailValue = email.value.trim();
    const firstnameValue = firstname.value.trim();
    const lastnameValue = lastname.value.trim();
    const passwordValue = password.value.trim();

    showLoading(); // Show loading before Firebase call

    createUserWithEmailAndPassword(auth, emailValue, passwordValue)
      .then((userCredential) => {
        const user = userCredential.user;

        // Store user data in Realtime Database
        set(ref(db, "users/" + user.uid), {
          firstname: firstnameValue,
          lastname: lastnameValue,
          email: emailValue,
          balance: 0,
          deposits: 0,
          withdrawals: 0,
          cryptoSignal: "",
          forexSignal: "",
          indexSignal: "",
          stockSignal: "",
          referrals: 0,
          role: "user",
        })
          .then(() => {
            hideLoading(); // Hide loading after success
            showPopup("Account Created Successfully.");
            setTimeout(() => {
              window.location.href = "login.html";
            }, 5000);
          })
          .catch((error) => {
            hideLoading();
            console.error("Error writing user data:", error);
            showToast("Error writing user data.", "error");
          });
      })
      .catch((error) => {
        hideLoading();
        if (error.code === "auth/email-already-in-use") {
          showToast("Email already in use.", "error");
        } else {
          console.error("Error creating user:", error);
          showDangerPopup("" + error.message);
          showToast("" + error.message, "error");
        }
      });
  }
});
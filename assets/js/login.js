// LOGIN.JS

import { auth, db } from "/assets/js/firebase-init.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
  console.log("%cLOGIN MODULE LOADED", "color:#8b5cf6;font-weight:bold;");

  const submitBtn = document.getElementById("submit");
  const popup = document.getElementById("popup-success");
  const popupMessage = document.getElementById("popup-message");

  // Loading Overlay functions
  const showLoading = () => {
    document.getElementById("loading-overlay").classList.add("show");
  };

  const hideLoading = () => {
    document.getElementById("loading-overlay").classList.remove("show");
  };

  const showPopupSuccess = (message = "Welcome back!") => {
    popupMessage.textContent = message;
    popup.style.display = "flex";
  };

  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      console.log("Please fill in all fields");
      return;
    }

    showLoading();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("%cUSER SIGNED IN — UID: " + user.uid, "color:#00ff9d;font-weight:bold;");

      const snapshot = await get(ref(db, `users/${user.uid}`));
      if (!snapshot.exists()) {
        showToast("Account error — contact support", "error");
        return;
      }

      const role = snapshot.val().role || "user";
      hideLoading();
      showPopupSuccess("Login Successful!");

      setTimeout(() => {
        popup.style.display = "none";
        window.location.href = role === "admin" ? "admin.html" : "dashboard-crypto.html";
      }, 2000);

    } catch (error) {
      console.error("LOGIN FAILED:", error);
      hideLoading();

      // THIS IS WHAT YOU WANTED
      if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        showToast("Invalid credentials", "error");
      } else if (error.code === "auth/network-request-failed") {
        console.log("No internet connection");
      } else {
        showToast("Invalid credentials — try again", "error");
      }
    }
  });
});
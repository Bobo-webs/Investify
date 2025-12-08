import { auth } from "/assets/js/firebase-init.js";

import {
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

// Add event listener to the form
document
  .getElementById("loginDiv")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (!email) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    showToast("Sending password reset link", "info");

    sendPasswordResetEmail(auth, email)
      .then(() => {
        showToast(`If the email is valid, you'll receive a reset link shortly.`, "success");
      })
      .catch((error) => {
        const errorMessage = error.message;
        showToast(`Error: ${errorMessage}`, "error");
      });
  });

document
  .getElementById("close-sent")
  .addEventListener("click", function () {
    document.getElementById("sent-email").style.display = "none";
  });
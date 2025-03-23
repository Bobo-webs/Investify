// ============== Logout Fx ================ //
logoutButton.addEventListener("click", () => {
  localStorage.clear(); // Clear the storage
  confirmationPopup.classList.add("show");
  document.getElementById("popup-overlay").classList.add("show"); // Show overlay
});

confirmYes.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      showPopup("Logged out successfully!");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 5000);
    })
    .catch((error) => {
      console.error("Error logging out:", error);
      showPopup("Error logging out: " + error.message);
    });

  confirmationPopup.classList.remove("show");
  document.getElementById("popup-overlay").classList.remove("show"); // Hide overlay
});

confirmNo.addEventListener("click", () => {
  confirmationPopup.classList.remove("show");
  document.getElementById("popup-overlay").classList.remove("show"); // Hide overlay
});

const showPopup = (message) => {
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popup-message");
  popupMessage.textContent = message;
  popup.classList.add("show");
  document.getElementById("popup-overlay").classList.add("show"); // Show overlay
};

const closePopup = () => {
  const popup = document.getElementById("popup");
  popup.classList.remove("show");
  document.getElementById("popup-overlay").classList.remove("show"); // Hide overlay
};

document.querySelector(".close").addEventListener("click", closePopup);

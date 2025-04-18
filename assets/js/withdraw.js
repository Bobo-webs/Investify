import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  child,
  set,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDosNrhPrcRC2UpOu9Wu3N2p3jaUwbJyDI",
  authDomain: "login-example-c7c78.firebaseapp.com",
  projectId: "login-example-c7c78",
  storageBucket: "login-example-c7c78.appspot.com",
  messagingSenderId: "298272317823",
  appId: "1:298272317823:web:07b88844cd084699197a4a",
  databaseURL: "https://login-example-c7c78-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const logoutButton = document.getElementById("logoutButton");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const confirmationPopup = document.getElementById("confirmationPopup");

document.addEventListener("DOMContentLoaded", function () {
  const withdrawalForm = document.getElementById("withdrawalForm");
  const numberElement = document.querySelectorAll("#number-element");

  onAuthStateChanged(auth, (user) => {
    const loadingScreen = document.getElementById("loading-screen");
    const dashboardContent = document.getElementById("dashboard-content");
    const withdrawal = document.getElementById("withdraw");

    if (user) {
      loadingScreen.style.display = "none";
      dashboardContent.style.display = "block";
      withdrawal.style.display = "block";

      const userId = user.uid;
      displayUserData(userId);
    } else {
      window.location.href = "login.html";
    }
  });

  withdrawalForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const withdrawAmount = parseFloat(
      document.getElementById("withdraw-amount").value.trim()
    );
    const user = auth.currentUser;

    if (user) {
      const userRef = ref(database, "users/" + user.uid + "/balance");

      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const balance = snapshot.val();
            if (withdrawAmount > balance) {
              alert("Insufficient balance.");
            } else {
              console.log("Sufficient balance, sending email..."); // Debugging
              const customPopup = document.getElementById("customPopup");
              customPopup.classList.remove("hidden-pay");
              sendMail();
            }
          } else {
            alert("No balance information found.");
          }
        })
        .catch((error) => {
          console.error("Error retrieving balance:", error);
        });
    } else {
      alert("No user is signed in. Please sign in first.");
    }
  });

  if (numberElement) {
    const number = parseFloat(numberElement.textContent.trim());
    if (!isNaN(number)) {
      numberElement.textContent = number.toLocaleString("en-US");
    }
  }
});

// ============== Display user data from Realtime Db ============== //
function displayUserData(uid) {
  const dbRef = ref(database);
  get(child(dbRef, `users/${uid}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const lastname = userData.lastname || "-";
        const firstname = userData.firstname || "user";
        const email = userData.email || "-";

        // Set the lastname in the fullname input field and disable it
        const fullnameInput = document.getElementById("name");
        if (fullnameInput) {
          fullnameInput.value = lastname;
          fullnameInput.disabled = true;
        }

        // Update email and disable input
        const emailInput = document.getElementById("email");
        if (emailInput) {
          emailInput.value = email;
          emailInput.disabled = true;
        }
        document.getElementById(
          "welcomeMessage"
        ).textContent = `Welcome, ${firstname}!`;
        const userDataDiv = document.querySelector(".user-info");
        userDataDiv.innerHTML = `
          <h3>👋Hello, ${firstname}!</h3>
        `;
        updateFundAmount(uid); // Update the displayed fund amount when user data is displayed
      }
    })
    .catch((error) => {
      console.error("Error retrieving user data: ", error);
    });
}

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

// ---------- Withdrawal popup --------- //
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("confirmPaymentButton")) {
    const customPopup = document.getElementById("customPopup");
    customPopup.classList.remove("hidden-pay");
  }
});

// ============== Send Email Function ============== //
function sendMail() {
  var params = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    wallet_address: document.getElementById("wallet-address").value,
    withdraw_amount: document.getElementById("withdraw-amount").value,
    crypto_type: document.getElementById("crypto").value,
  };

  console.log("Email Params:", params);

  const serviceID = "service_o8fin53";
  const templateID = "template_vmbmklb";

  emailjs
    .send(serviceID, templateID, params)
    .then((res) => {
      console.log("Email sent successfully", res);
    })
    .catch((err) => console.log("Error sending email:", err));
}

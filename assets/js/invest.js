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
const progressBar = document.getElementById("progress-bar");

function updateProgressBar(progress) {
  progressBar.style.width = `${progress}%`;
  if (progress === 0 || progress === 100) {
    document.getElementById("progress-bar-container").style.display = "none";
  } else {
    document.getElementById("progress-bar-container").style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  onAuthStateChanged(auth, (user) => {
    const loadingScreen = document.getElementById("loading-screen");
    const dashboardContent = document.getElementById("dashboard-content");
    const invest = document.getElementById("invest");

    if (user) {
      loadingScreen.style.display = "none";
      dashboardContent.style.display = "block";
      invest.style.display = "block";

      const userId = user.uid;
      updateProgressBar(20);
      displayUserData(userId);
    } else {
      window.location.href = "login.html";
    }
  });
});

// ============== Display user data from Realtime Db ============== //
function displayUserData(uid) {
  const dbRef = ref(database);
  get(child(dbRef, `users/${uid}`))
    .then((snapshot) => {
      updateProgressBar(70);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const firstname = userData.firstname || " User ";

        document.getElementById(
          "welcomeMessage"
        ).textContent = `Welcome, ${firstname}!`;
        const userDataDiv = document.querySelector(".user-info");
        userDataDiv.innerHTML = `
          <h3>👋Hello, ${firstname}!</h3>
        `;
      }
      updateProgressBar(100);
      setTimeout(() => {
        updateProgressBar(0);
      }, 500); // Hide progress bar
    })
    .catch((error) => {
      console.error("Error retrieving user data: ", error);
      updateProgressBar(0); // Reset progress bar on error
    });
}

// ============== Logout Fx ================ //
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
// ============== Form Submission Check ============== //
document
  .getElementById("investmentForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get selected package
    const selectedPackage = document.querySelector(
      'input[name="package"]:checked'
    );
    if (!selectedPackage) {
      showPopup("Please select a package.");
      return;
    }

    const packageElement = selectedPackage.closest(".packages");
    const packageValue = parseFloat(
      packageElement.querySelector(".text2").textContent.replace(/[^\d.]/g, "")
    );

    // Fetch user balance from Firebase
    const user = auth.currentUser;
    if (user) {
      updateProgressBar(20);
      const userId = user.uid;
      get(child(ref(database), `users/${userId}/balance`))
        .then((snapshot) => {
          updateProgressBar(70);
          if (snapshot.exists()) {
            const balance = snapshot.val();

            if (balance < packageValue) {
              showPopup(
                "Insufficient balance❌, kindly top up balance for this package."
              );
            } else {
              showPopup("Investment Plan activated✅");
              // Add additional logic here if needed (e.g., process the investment)
            }
          } else {
            showPopup("Balance information not found.");
          }
          updateProgressBar(100);
          setTimeout(() => {
            updateProgressBar(0);
          }, 500); // Hide progress bar
        })
        .catch((error) => {
          console.error("Error fetching user balance:", error);
          showPopup("An error occurred. Please try again later.");
          updateProgressBar(0); // Reset progress bar on error
        });
    } else {
      showPopup("User not authenticated.");
    }
  });

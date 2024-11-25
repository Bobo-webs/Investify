// Initialize Firebase (make sure this is done before using Firebase)
// Replace the config object with your Firebase project's config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  child,
  onChildAdded
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

  onAuthStateChanged(auth, (user) => {
    const loadingScreen = document.getElementById("loading-screen");
    const dashboardContent = document.getElementById("dashboard-content");

    if (user) {
      loadingScreen.style.display = "none";
      dashboardContent.style.display = "block";

      const userId = user.uid;
      displayUserData(userId);
      listenForNewTransactions(userId); // Listen for new transactions
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
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const firstname = userData.firstname || " User ";
        const balance = userData.balance || " 0 ";
        const investments = userData.investments || " 0 ";
        const deposits = userData.deposits || " 0 ";
        const referrals = userData.referrals || " 0 ";

        const balanceElement = document.getElementById("balance");
        balanceElement.innerHTML = `
          <div id="balance">
            <div class="numbers">$${balance}.00</div>
            <div class="cardName">Balance</div>
          </div>
        `;



        const investmentsElement = document.getElementById("investments");
        investmentsElement.innerHTML = `
        <div id="investments">
            <div class="numbers">$${investments}.00</div>
            <div class="cardName">Investments</div>
          </div>
        `;

        const depositsElement = document.getElementById("deposits");
        depositsElement.innerHTML = `
          <div id="balance">
            <div class="numbers">$${deposits}.00</div>
            <div class="cardName">Deposits</div>
          </div>
        `;

        const referralsElement = document.getElementById("referrals");
        referralsElement.innerHTML = `
          <div id="balance">
            <div class="numbers">${referrals}</div>
            <div class="cardName">Referrals</div>
          </div>
        `;

        const userDataDiv = document.querySelector(".user-info");
        userDataDiv.innerHTML = `
          <h3>👋Hello, ${firstname}!</h3>
        `;
      }
    })
    .catch((error) => {
      console.error("Error retrieving user data: ", error);
    });
}



// =================== Transaction Fx ======================= //
// Function to format date
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}<br>${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

// Function to add a new transaction to the table
function addTransactionToTable(transaction) {
  const tableBody = document.querySelector("table tbody");
  const row = document.createElement("tr");

  row.innerHTML = `
      <td>${transaction.type}</td>
      <td>$${transaction.amount}</td>
      <td>${formatDate(transaction.date)}</td>
      <td><span class="status ${transaction.status.toLowerCase()}">${transaction.status}</span></td>
  `;

  tableBody.appendChild(row);
}

// Function to listen for new transactions
function listenForNewTransactions(userId) {
  const transactionsRef = ref(database, `users/${userId}/transactions`);

  onChildAdded(transactionsRef, (snapshot) => {
    const newTransaction = snapshot.val();
    addTransactionToTable(newTransaction);
  });
}

// Example usage: Replace 'userId' with the actual user ID
const userId = "USER_ID"; // Replace with the actual user ID
listenForNewTransactions(userId);




// ============== Logout Fx ================ //
logoutButton.addEventListener('click', () => {
  localStorage.clear(); // Clear the storage
  confirmationPopup.classList.add("show");
});

confirmYes.addEventListener('click', () => {
  signOut(auth).then(() => {
    showPopup("Logged out successfully!");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 5000);
  }).catch((error) => {
    console.error("Error logging out:", error);
    showPopup("Error logging out: " + error.message);
  });
  confirmationPopup.classList.remove("show");
});

confirmNo.addEventListener('click', () => {
  confirmationPopup.classList.remove("show");
});

const showPopup = (message) => {
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popup-message");
  popupMessage.textContent = message;
  popup.classList.add("show");
};

const closePopup = () => {
  const popup = document.getElementById("popup");
  popup.classList.remove("show");
};

document.querySelector(".close").addEventListener("click", closePopup);
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  child,
  onValue,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-functions.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging.js";

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
const messaging = getMessaging(app);
const functions = getFunctions(app);

// DOM elements
const logoutButton = document.getElementById("logoutButton");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const confirmationPopup = document.getElementById("confirmationPopup");
const loadingScreen = document.getElementById("loading-screen");
const dashboardContent = document.getElementById("dashboard-content");

// Event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      showLoadingScreen();
      checkUserRole(user.uid);
    } else {
      redirectToLogin();
    }
  });
});

// Show loading screen and hide dashboard content
function showLoadingScreen() {
  loadingScreen.style.display = "block";
  dashboardContent.style.display = "none";
}

// Hide loading screen and show dashboard content
function hideLoadingScreen() {
  loadingScreen.style.display = "none";
  dashboardContent.style.display = "block";
}

// Redirect to login page
function redirectToLogin() {
  window.location.href = "login.html";
}

// Check user's role
function checkUserRole(uid) {
  const dbRef = ref(database);
  get(child(dbRef, `users/${uid}/role`))
    .then((snapshot) => {
      if (snapshot.exists() && snapshot.val().includes("admin")) {
        hideLoadingScreen();
        fetchUsers(uid); // Fetch and display users
      } else {
        console.warn("User is not an admin. Redirecting to login.");
        redirectToLogin();
      }
    })
    .catch((error) => {
      console.error("Error retrieving user role:", error);
      redirectToLogin();
    });
}

// Fetch and display users, excluding admins and users with owner: dwayne
function fetchUsers(currentAdminUid) {
  const usersList = document.getElementById("users-list");
  const usersRef = ref(database, "users");
  onValue(usersRef, (snapshot) => {
    usersList.innerHTML = ""; // Clear the list before adding new users
    snapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val();
      const uid = childSnapshot.key;

      // Check if the user is an admin or has owner: dwayne
      if (
        (user.role && user.role.includes("admin") && uid === currentAdminUid) ||
        (user.owner && user.owner === "dwayne")
      ) {
        return; // Skip adding current admin and users with owner: dwayne to the dashboard
      }

      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${user.lastname}</td>
                <td>${user.email}</td>
                <td>
                    $${user.balance}<br>
                    <button class="edit-balance" data-uid="${uid}">Edit</button>
                </td>
                <td>
                    ${user.investments}<br>
                    <button class="edit-investments" data-uid="${uid}">Edit</button>
                </td>
                <td>
                    ${user.deposits}<br>
                    <button class="edit-deposits" data-uid="${uid}">Edit</button>
                </td>
                <td>
                    ${user.referrals}<br>
                    <button class="edit-referrals" data-uid="${uid}">Edit</button>
                </td>
                <td>
                    <button class="delete-button" data-uid="${uid}">Delete</button>
                </td>
            `;
      usersList.appendChild(row);
    });

    // Add event listeners for edit buttons
    document.querySelectorAll(".edit-balance").forEach((button) => {
      button.addEventListener("click", () => {
        const uid = button.getAttribute("data-uid");
        editField(uid, "balance");
      });
    });

    document.querySelectorAll(".edit-investments").forEach((button) => {
      button.addEventListener("click", () => {
        const uid = button.getAttribute("data-uid");
        editField(uid, "investments");
      });
    });

    document.querySelectorAll(".edit-deposits").forEach((button) => {
      button.addEventListener("click", () => {
        const uid = button.getAttribute("data-uid");
        editField(uid, "deposits");
      });
    });

    document.querySelectorAll(".edit-referrals").forEach((button) => {
      button.addEventListener("click", () => {
        const uid = button.getAttribute("data-uid");
        editField(uid, "referrals");
      });
    });

    document.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", () => {
        const uid = button.getAttribute("data-uid");
        deleteUserDataAndAccount(uid);
      });
    });
  });

  // Add event listener for search input
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.toLowerCase();
    const rows = usersList.getElementsByTagName("tr");
    Array.from(rows).forEach((row) => {
      const name = row.getElementsByTagName("td")[0].textContent.toLowerCase();
      if (name.includes(searchText)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
}

// Edit specific user field
function editField(uid, field) {
  const newValue = prompt(`Enter new ${field}:`);

  if (newValue) {
    const userRef = ref(database, "users/" + uid);
    const updates = {};
    updates[field] = newValue;
    update(userRef, updates).catch((error) => {
      console.error(`Error updating ${field}:`, error);
    });
  }
}

// Delete user data and account
function deleteUserDataAndAccount(uid) {
  if (confirm("Are you sure you want to delete this user?")) {
    // Remove user data from the database
    const userRef = ref(database, "users/" + uid);
    remove(userRef)
      .then(() => {
        console.log("User data successfully deleted from database.");

        // Call the cloud function to delete user account
        const deleteUserFunction = httpsCallable(functions, "deleteUser");
        deleteUserFunction({ uid: uid })
          .then(() => {
            console.log("User account successfully deleted.");
          })
          .catch((error) => {
            console.error("Error deleting user account:", error);
          });
      })
      .catch((error) => {
        console.error("Error deleting user data from database:", error);
      });
  }
}

// ================ Handle logout button click ===================== //
logoutButton.addEventListener("click", () => {
  confirmationPopup.classList.add("show");
  document.getElementById("popup-overlay").classList.add("show"); // Show overlay
});

confirmYes.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      confirmationPopup.classList.remove("show");
      document.getElementById("popup-overlay").classList.remove("show"); // Hide overlay
      redirectToLogin();
    })
    .catch((error) => {
      console.error("Sign out error:", error);
    });
});

confirmNo.addEventListener("click", () => {
  confirmationPopup.classList.remove("show");
  document.getElementById("popup-overlay").classList.remove("show"); // Hide overlay
});


// Display user data
function displayUserData(uid) {
  const dbRef = ref(database);
  get(child(dbRef, `users/${uid}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const firstname = userData.firstname || " User ";

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

//================ Push notification =======================//
database.ref("users").on("child_added", (snapshot) => {
  const newUser = snapshot.val();
  const isAdmin = newUser.role === "admin"; // Assuming you have a role property for users
  if (isAdmin) {
    sendNotificationToAdmin(newUser);
  }
});

// Function to send notification to admin
function sendNotificationToAdmin(user) {
  // Get the FCM token of the admin (you'll need to store this somewhere)
  const adminFCMToken =
    "BBsjezC9ZvJ1tCPIN3TbsLJZvarHiIfP991i5giZJo4u89x3kim-z1-FTgT2oVdMoXuHpg4KtxmqqNFoPq4nvgo";

  // Send a notification using the Firebase Cloud Messaging API
  messaging
    .send({
      token: adminFCMToken,
      notification: {
        title: "New User Signed Up",
        body: `${user.name} (${user.email}) signed up.`,
      },
    })
    .then(() => {
      console.log("Notification sent successfully");
    })
    .catch((error) => {
      console.error("Error sending notification:", error);
    });
}

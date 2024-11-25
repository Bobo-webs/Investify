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
  update,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-storage.js";

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
const storage = getStorage(app);

document.addEventListener("DOMContentLoaded", function () {
  onAuthStateChanged(auth, (user) => {
    const loadingScreen = document.getElementById("loading-screen");
    const dashboardContent = document.getElementById("dashboard-content");
    const settings = document.getElementById("settings");

    if (user) {
      loadingScreen.style.display = "none";
      dashboardContent.style.display = "block";
      settings.style.display = "block";

      const userId = user.uid;
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
        updateProfileName(uid);
      }
    })
    .catch((error) => {
      console.error("Error retrieving user data: ", error);
    });
}

// ====================== Retrieving username data =======================//
function updateProfileName(uid) {
  const dbRef = ref(database);
  get(child(dbRef, `users/${uid}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const profileData = snapshot.val();
        const lastname = profileData.lastname || "-";
        const email = profileData.email || "-";

        // Select the input element and set its value
        document.querySelectorAll("#fullname").forEach((element) => {
          element.value = lastname;
          element.disabled = true; // Disable the input element
        });

        // Update email
        document.querySelectorAll("#profile-email").forEach((element) => {
          element.value = email;
          element.disabled = true;
        });
      }
    })
    .catch((error) => {
      console.error("Error retrieving data: ", error);
    });
}

// ============ Profile settings update ============ //
const form = document.getElementById("profile-form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;

  if (!user) {
    alert("No user is currently signed in.");
    return;
  }

  const countryValue = document.getElementById("country").value.trim();
  const fullAddressValue = document.getElementById("full-address").value.trim();
  const stateValue = document.getElementById("state").value.trim();
  const cityValue = document.getElementById("city").value.trim();
  const postalCodeValue = document.getElementById("postal-code").value.trim();
  const phoneValue = document.getElementById("phone").value.trim();

  const file = document.getElementById("fileInput").files[0];
  if (file) {
    const storageReference = storageRef(
      storage,
      `verificationDoc/${user.uid}/${file.name}`
    );
    const uploadTask = uploadBytesResumable(storageReference, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Error uploading file:", error);
        alert("Error uploading file: " + error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          update(ref(database, "users/" + user.uid), {
            country: countryValue,
            full_address: fullAddressValue,
            state: stateValue,
            city: cityValue,
            postal_code: postalCodeValue,
            phone: phoneValue,
            verification_doc_url: downloadURL,
          })
            .then(() => {
              alert("Profile data updated successfully.");
              console.log("Profile data updated successfully.");
              setTimeout(() => {
                window.location.href = "settings.html";
              }, 3000);
            })
            .catch((error) => {
              console.error("Error writing user data:", error);
              alert("Error writing user data: " + error.message);
            });
        });
      }
    );
  } else {
    update(ref(database, "users/" + user.uid), {
      country: countryValue,
      full_address: fullAddressValue,
      state: stateValue,
      city: cityValue,
      postal_code: postalCodeValue,
      phone: phoneValue,
    })
      .then(() => {
        alert("Profile data updated successfully.");
        console.log("Profile data updated successfully.");
        setTimeout(() => {
          window.location.href = "settings.html";
        }, 3000);
      })
      .catch((error) => {
        console.error("Error writing user data:", error);
        alert("Error writing user data: " + error.message);
      });
  }
});

// ============== Logout Fx ================ //
logoutButton.addEventListener("click", () => {
  localStorage.clear(); // Clear the storage
  confirmationPopup.classList.add("show");
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
});

confirmNo.addEventListener("click", () => {
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

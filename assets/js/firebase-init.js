// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

import {
    getDatabase
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyB7UOOdjUgbYfNyZbNgdOCjkYRhxfJf_14",
    authDomain: "investify-traders-net.firebaseapp.com",
    databaseURL: "https://investify-traders-net-default-rtdb.firebaseio.com",
    projectId: "investify-traders-net",
    storageBucket: "investify-traders-net.firebasestorage.app",
    messagingSenderId: "769846151420",
    appId: "1:769846151420:web:a85156de7f33127b08af79",
    measurementId: "G-E6KSCFYTB6"
};

// Initialize ONCE
export const app = initializeApp(firebaseConfig);

// Export shared instances
export const auth = getAuth(app);
export const db = getDatabase(app);

window.firebaseDatabase = getDatabase(app);   // ← exposes the db instance globally
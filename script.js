import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue, remove } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJkSlH4IRuIOldjQyyEWINr2sGFylQ8co",
  authDomain: "germarkdigitalportal.firebaseapp.com",
  databaseURL: "https://genmarkdigitalportal-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "germarkdigitalportal",
  storageBucket: "germarkdigitalportal.firebasestorage.app",
  messagingSenderId: "511878818738",
  appId: "1:511878818738:web:a6c48f91f655ab30f352ab",
  measurementId: "G-4PY8F5WC60"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = null;

// [All your functions remain unchanged — login, tabs, passport, profile, admin, apartment, news]

// ✅ Expose functions to global scope for HTML onclick compatibility
window.login = login;
window.showTab = showTab;
window.createPassport = createPassport;
window.unlockPassport = unlockPassport;
window.saveProfileImage = saveProfileImage;
window.loadProfileImage = loadProfileImage;
window.unlockAdmin = unlockAdmin;
window.addCitizen = addCitizen;
window.removeCitizen = removeCitizen;
window.assignApartment = assignApartment;
window.addNews = addNews;
window.removeLastNews = removeLastNews;

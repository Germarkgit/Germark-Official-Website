// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, get, set, push, remove } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJkSlH4IRuIOldjQyyEWINr2sGFylQ8co",
  authDomain: "germarkdigitalportal.firebaseapp.com",
  databaseURL: "https://germarkdigitalportal-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "germarkdigitalportal",
  storageBucket: "germarkdigitalportal.firebasestorage.app",
  messagingSenderId: "511878818738",
  appId: "1:511878818738:web:a6c48f91f655ab30f352ab",
  measurementId: "G-4PY8F5WC60"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = null;

// Animate icons and flag on load
window.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".icon")?.classList.add("animate");
  document.querySelector(".flag-banner img")?.classList.add("animate");

  const loginBtn = document.getElementById("login-button");
  if (loginBtn) {
    loginBtn.addEventListener("click", login);
  }
});

// Tab switching
function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.classList.remove("active");
    tab.style.display = "none";
  });

  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.style.display = "block";
    setTimeout(() => activeTab.classList.add("active"), 10);
  }

  if (tabId === "news") displayNews();
  if (tabId === "passport") loadPassportTab();
}

window.showTab = showTab;

// Login flow
async function login() {
  const chipId = document.getElementById("chip-id")?.value.trim();
  const name = document.getElementById("name")?.value.trim();

  if (!chipId || !name) {
    alert("Please enter both Chip ID and Name.");
    return;
  }

  try {
    const snapshot = await get(ref(db, "citizens/" + chipId));
    const citizen = snapshot.val();

    if (citizen && citizen.name.toLowerCase() === name.toLowerCase()) {
      currentUser = citizen.name;
      document.getElementById("login-error").style.display = "none";
      document.getElementById("about").style.display = "none";
      document.getElementById("login").style.display = "none";
      document.getElementById("home-screen").style.display = "block";
      document.getElementById("profile-name").textContent = currentUser;
      loadApartment();
      loadProfileImage();
      showTab("passport");
    } else {
      document.getElementById("login-error").style.display = "block";
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong. Check Firebase rules and connection.");
  }
}

window.login = login;

// Passport
function createPassport() {
  const password = document.getElementById("passport-create")?.value;
  if (!password || !currentUser) return;

  set(ref(db, "passports/" + currentUser), { password })
    .then(() => {
      document.getElementById("passport-setup").style.display = "none";
      document.getElementById("passport-login").style.display = "block";
    })
    .catch(error => console.error("Passport creation error:", error));
}

function unlockPassport() {
  const entered = document.getElementById("passport-password")?.value;
  if (!entered || !currentUser) return;

  get(ref(db, "passports/" + currentUser))
    .then(snapshot => {
      if (snapshot.exists() && snapshot.val().password === entered) {
        document.getElementById("passport-login").style.display = "none";
        document.getElementById("passport-content").style.display = "block";
      } else {
        alert("Incorrect password.");
      }
    })
    .catch(error => console.error("Passport unlock error:", error));
}

function loadPassportTab() {
  if (!currentUser) return;
  get(ref(db, "passports/" + currentUser))
    .then(snapshot => {
      if (snapshot.exists()) {
        document.getElementById("passport-setup").style.display = "none";
        document.getElementById("passport-login").style.display = "block";
      }
    })
    .catch(error => console.error("Passport load error:", error));
}

window.createPassport = createPassport;
window.unlockPassport = unlockPassport;

// Profile
function saveProfileImage() {
  const files = document.getElementById("profile-image")?.files;
  const gallery = document.getElementById("profile-gallery");
  if (!files || !gallery) return;

  gallery.innerHTML = "";

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement("img");
      img.src = reader.result;
      gallery.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

function loadProfileImage() {
  const gallery = document.getElementById("profile-gallery");
  if (gallery) gallery.innerHTML = "";
}

window.saveProfileImage = saveProfileImage;

// Apartment
function loadApartment() {
  if (!currentUser) return;
  get(ref(db, "apartments/" + currentUser))
    .then(snapshot => {
      const info = snapshot.exists() ? snapshot.val().info : "No apartment assigned.";
      document.getElementById("apartment-info").textContent = info;
    })
    .catch(error => console.error("Apartment load error:", error));
}

// News
function addNews() {
  const title = document.getElementById("news-title")?.value;
  const body = document.getElementById("news-body")?.value;
  const image = document.getElementById("news-image")?.files[0];

  if (!title || !body) return;

  const newsRef = push(ref(db, "news"));
  const newsData = { title, body };

  if (image) {
    const reader = new FileReader();
    reader.onload = () => {
      newsData.image = reader.result;
      set(newsRef, newsData).then(displayNews);
    };
    reader.readAsDataURL(image);
  } else {
    set(newsRef, newsData).then(displayNews);
  }
}

function removeLastNews() {
  get(ref(db, "news"))
    .then(snapshot => {
      if (snapshot.exists()) {
        const keys = Object.keys(snapshot.val());
        const lastKey = keys[keys.length - 1];
        remove(ref(db, "news/" + lastKey)).then(displayNews);
      }
    })
    .catch(error => console.error("Remove news error:", error));
}

function displayNews() {
  get(ref(db, "news"))
    .then(snapshot => {
      const container = document.getElementById("news-articles");
      if (!container) return;
      container.innerHTML = "";

      if (snapshot.exists()) {
        Object.values(snapshot.val()).forEach(article => {
          const div = document.createElement("div");
          div.innerHTML = `<h4>${article.title}</h4><p>${article.body}</p>`;
          if (article.image) {
            const img = document.createElement("img");
            img.src = article.image;
            img.className = "news-image";
            div.appendChild(img);
          }
          container.appendChild(div);
        });
      }
    })
    .catch(error => console.error("Display news error:", error));
}

window.addNews = addNews;
window.removeLastNews = removeLastNews;

// Admin
function unlockAdmin() {
  const password = document.getElementById("admin-password")?.value;
  if (password === "admin123") {
    document.getElementById("admin-panel").style.display = "block";
    loadCitizens();
  } else {
    alert("Incorrect admin password.");
  }
}

function addCitizen() {
  const chipId = document.getElementById("new-chip-id")?.value;
  const name = document.getElementById("new-citizen-name")?.value;
  if (!chipId || !name) return;

  set(ref(db, "citizens/" + chipId), { name })
    .then(loadCitizens)
    .catch(error => console.error("Add citizen error:", error));
}

function loadCitizens() {
  get(ref(db, "citizens"))
    .then(snapshot => {
      const list = document.getElementById("citizen-list");
      const count = document.getElementById("citizen-count");
      if (!list || !count) return;

      list.innerHTML = "";

      if (snapshot.exists()) {
        const citizens =

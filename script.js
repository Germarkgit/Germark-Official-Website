import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue, remove } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJkSlH4IRuIOldjQyyEWINr2sGFylQ8co",
  authDomain: "germarkdigitalportal.firebaseapp.com",
  databaseURL: "https://germarkdigitalportal-default-rtdb.firebaseio.com",
  projectId: "germarkdigitalportal",
  storageBucket: "germarkdigitalportal.firebasestorage.app",
  messagingSenderId: "511878818738",
  appId: "1:511878818738:web:a6c48f91f655ab30f352ab",
  measurementId: "G-4PY8F5WC60"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = null;

// Login
async function login() {
  const chipId = document.getElementById("chip-id").value.trim();
  const name = document.getElementById("name").value.trim();

  if (!chipId || !name) {
    alert("Please enter both Chip ID and Name.");
    return;
  }

  try {
    const snapshot = await get(ref(db, "citizens/" + chipId));
    const citizen = snapshot.val();

    if (citizen && citizen.name.toLowerCase() === name.toLowerCase()) {
      currentUser = citizen.name;
      document.getElementById("login-screen").style.display = "none";
      document.getElementById("home-screen").style.display = "block";
      document.getElementById("profile-name").textContent = currentUser;
      document.getElementById("login-error").style.display = "none";
      loadApartment();
      showTab("about");
    } else {
      document.getElementById("login-error").style.display = "block";
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong. Check your Firebase setup.");
  }
}

// Tabs
function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.classList.remove("active");
    tab.style.display = "none";
  });

  const activeTab = document.getElementById(tabId);
  activeTab.style.display = "block";
  activeTab.classList.add("active");

  if (tabId === "news") displayNews();
  if (tabId === "passport") loadPassportTab();
}

// Passport (local only)
function createPassport() {
  const password = document.getElementById("passport-create").value.trim();
  if (!password || !currentUser) return;

  localStorage.setItem(`passport_${currentUser}`, password);
  document.getElementById("passport-setup").style.display = "none";
  document.getElementById("passport-login").style.display = "block";
  document.getElementById("passport-create").value = "";
}

function unlockPassport() {
  const input = document.getElementById("passport-password").value.trim();
  const saved = localStorage.getItem(`passport_${currentUser}`);

  if (input === saved) {
    document.getElementById("passport-login").style.display = "none";
    document.getElementById("passport-content").style.display = "block";
    document.getElementById("passport-password").value = "";
  } else {
    alert("Incorrect password.");
  }
}

function loadPassportTab() {
  const saved = localStorage.getItem(`passport_${currentUser}`);
  document.getElementById("passport-setup").style.display = saved ? "none" : "block";
  document.getElementById("passport-login").style.display = saved ? "block" : "none";
  document.getElementById("passport-content").style.display = "none";
}

// Profile Images (local only)
function saveProfileImage() {
  const files = document.getElementById("profile-image").files;
  const gallery = document.getElementById("profile-gallery");
  gallery.innerHTML = "";

  const images = [];

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function () {
      images.push(reader.result);
      localStorage.setItem(`profile_${currentUser}`, JSON.stringify(images));
      displayProfileImages(images);
    };
    reader.readAsDataURL(file);
  });
}

function loadProfileImage() {
  const images = JSON.parse(localStorage.getItem(`profile_${currentUser}`) || "[]");
  displayProfileImages(images);
}

function displayProfileImages(images) {
  const gallery = document.getElementById("profile-gallery");
  gallery.innerHTML = "";
  images.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    gallery.appendChild(img);
  });
}

// Admin Panel
function unlockAdmin() {
  const password = document.getElementById("admin-password").value;
  if (password === "Germark2025") {
    document.getElementById("admin-panel").style.display = "block";
    updateCitizenList();
  } else {
    alert("Access Denied");
  }
}

function addCitizen() {
  const chipId = document.getElementById("new-chip-id").value.trim();
  const name = document.getElementById("new-citizen-name").value.trim();
  if (!chipId || !name) return alert("Please enter both Chip ID and Name.");

  set(ref(db, "citizens/" + chipId), { chipId, name });
  updateCitizenList();
}

function removeCitizen(chipId) {
  remove(ref(db, "citizens/" + chipId));
  updateCitizenList();
}

function updateCitizenList() {
  const list = document.getElementById("citizen-list");
  list.innerHTML = "";

  onValue(ref(db, "citizens"), (snapshot) => {
    const data = snapshot.val();
    const entries = Object.entries(data || {});
    document.getElementById("citizen-count").textContent = `Total Citizens: ${entries.length}`;
    entries.forEach(([chip, citizen]) => {
      const li = document.createElement("li");
      li.textContent = `${chip} → ${citizen.name}`;
      list.appendChild(li);
    });
  });
}

// Apartment
function assignApartment(name, apartment) {
  if (!name || !apartment) return;
  set(ref(db, "apartments/" + name), { apartment });
  updateApartmentDisplay(name);
}

function loadApartment() {
  updateApartmentDisplay(currentUser);
}

function updateApartmentDisplay(name) {
  onValue(ref(db, "apartments/" + name), (snapshot) => {
    const data = snapshot.val();
    document.getElementById("apartment-info").textContent = data ? `Apartment: ${data.apartment}` : "No apartment assigned.";
  });
}

// News
function addNews() {
  const title = document.getElementById("news-title").value.trim();
  const body = document.getElementById("news-body").value.trim();
  const imageInput = document.getElementById("news-image");
  const file = imageInput.files[0];

  if (!title || !body) return alert("Please enter both title and content.");

  const reader = new FileReader();
  reader.onload = function () {
    const newsItem = { title, body, image: reader.result };
    const key = Date.now().toString();
    set(ref(db, "news/" + key), newsItem);
    displayNews();
  };

  if (file) reader.readAsDataURL(file);
  else {
    const key = Date.now().toString();
    set(ref(db, "news/" + key), { title, body, image: null });
    displayNews();
  }

  document.getElementById("news-title").value = "";
  document.getElementById("news-body").value = "";
  imageInput.value = "";
}

function removeLastNews() {
  get(ref(db, "news")).then(snapshot => {
    const data = snapshot.val();
    if (!data) return;
    const keys = Object.keys(data);
    const lastKey = keys[keys.length - 1];
    remove(ref(db, "news/" + lastKey));
    displayNews();
  });
}

function displayNews() {
  const container = document.getElementById("news-articles");
  container.innerHTML = "";

  onValue(ref(db, "news"), (snapshot) => {
    const newsList = snapshot.val();
    if (!newsList) return;

    Object.values(newsList).forEach(item => {
      const article = document.createElement("article");
      article.innerHTML = `
        <h5>${item.title}</h5>
        <p>${item.body}</p>
        ${item.image ? `<img src="${item.image}" class="news-image" />` : ""}
      `;
      container.appendChild(article);
    });
  });
}

// ✅ Expose functions to global scope for HTML onclick compatibility
window.login = login;
window.showTab = showTab;
window.createPassport = createPassport;
window.unlockPassport = unlockPassport;
window.saveProfileImage = saveProfileImage;
window.loadProfileImage = loadProfileImage;
window

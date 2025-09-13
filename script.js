// Initialize citizens if not already stored
let citizens = JSON.parse(localStorage.getItem("germarkCitizens"));
if (!citizens) {
  citizens = {
    "001": "Mouhammad",
    "002": "Björn",
    "003": "Ludvig c",
    "004": "Andre",
    "005": "Lucas",
    "006": "Johan",
    "007": "Abdul",
    "008": "Astrid",
    "009": "Sander",
    "010": "Frederik"
  };
  localStorage.setItem("germarkCitizens", JSON.stringify(citizens));
}

let currentUser = null;

// Login
function login() {
  const chipId = document.getElementById("chip-id").value.trim();
  const name = document.getElementById("name").value.trim();

  if (citizens[chipId] && citizens[chipId].toLowerCase() === name.toLowerCase()) {
    currentUser = citizens[chipId];
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("home-screen").style.display = "block";
    document.getElementById("profile-name").textContent = currentUser;
    document.getElementById("login-error").style.display = "none";
    loadProfileImage();
    loadApartment();
    showTab("about");
  } else {
    document.getElementById("login-error").style.display = "block";
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

// Passport
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
  if (saved) {
    document.getElementById("passport-setup").style.display = "none";
    document.getElementById("passport-login").style.display = "block";
  } else {
    document.getElementById("passport-setup").style.display = "block";
    document.getElementById("passport-login").style.display = "none";
  }
  document.getElementById("passport-content").style.display = "none";
}

// Profile Images
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

  if (!chipId || !name) {
    alert("Please enter both Chip ID and Name.");
    return;
  }

  citizens[chipId] = name;
  localStorage.setItem("germarkCitizens", JSON.stringify(citizens));
  updateCitizenList();
  document.getElementById("new-chip-id").value = "";
  document.getElementById("new-citizen-name").value = "";
}

function removeCitizen(chipId) {
  if (citizens[chipId]) {
    delete citizens[chipId];
    localStorage.setItem("germarkCitizens", JSON.stringify(citizens));
    updateCitizenList();
  }
}

function updateCitizenList() {
  const list = document.getElementById("citizen-list");
  list.innerHTML = "";
  const entries = Object.entries(citizens);
  document.getElementById("citizen-count").textContent = `Total Citizens: ${entries.length}`;

  entries.forEach(([chip, name]) => {
    const li = document.createElement("li");
    li.textContent = `${chip} → ${name}`;
    list.appendChild(li);
  });
}

// Apartment
function assignApartment(name, apartment) {
  if (!name || !apartment) return;
  localStorage.setItem(`apartment_${name}`, apartment);
  updateApartmentDisplay(name);
}

function loadApartment() {
  updateApartmentDisplay(currentUser);
}

function updateApartmentDisplay(name) {
  const apt = localStorage.getItem(`apartment_${name}`);
  document.getElementById("apartment-info").textContent = apt ? `Apartment: ${apt}` : "No apartment assigned.";
}

// News
function addNews() {
  const title = document.getElementById("news-title").value.trim();
  const body = document.getElementById("news-body").value.trim();
  const imageInput = document.getElementById("news-image");
  const file = imageInput.files[0];

  if (!title || !body) {
    alert("Please enter both title and content.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const newsItem = {
      title,
      body,
      image: reader.result
    };

    const existingNews = JSON.parse(localStorage.getItem("germarkNews") || "[]");
    existingNews.push(newsItem);
    localStorage.setItem("germarkNews", JSON.stringify(existingNews));
    displayNews();
    document.getElementById("news-title").value = "";
    document.getElementById("news-body").value = "";
    imageInput.value = "";
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    const newsItem = { title, body, image: null };
    const existingNews = JSON.parse(localStorage.getItem("germarkNews") || "[]");
    existingNews.push(newsItem);
    localStorage.setItem("germarkNews", JSON.stringify(existingNews));
    displayNews();
    document.getElementById("news-title").value = "";
    document.getElementById("news-body").value = "";
  }
}

function removeLastNews() {
  const existingNews = JSON.parse(localStorage.getItem("germarkNews") || "[]");
  existingNews.pop();
  localStorage.setItem("germarkNews", JSON.stringify(existingNews));
  displayNews();
}

function displayNews() {
  const container = document.getElementById("news-articles");
  container.innerHTML = "";
  const newsList = JSON.parse(localStorage.getItem("germarkNews") || "[]");

  newsList.forEach(item => {
    const article = document.createElement("article");
    article.innerHTML = `
      <h5>${item.title}</h5>
      <p>${item.body}</p>
      ${item.image ? `<img src="${item.image}" class="news-image" />` : ""}
    `;
    container.appendChild(article);
  });
}
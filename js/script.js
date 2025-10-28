// Use this URL to fetch NASA APOD JSON data (static dataset for demo)
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// DOM elements
const gallery = document.getElementById("gallery");
const fetchBtn = document.getElementById("fetchBtn");
const startDateInput = document.getElementById("startDate");
const loadingMsg = document.getElementById("loadingMsg");

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalDesc = document.getElementById("modalDesc");
const closeModal = document.querySelector(".close");

// 🌠 Fun Space Facts
const spaceFacts = [
  "A day on Venus is longer than a year on Venus.",
  "There are more stars in the universe than grains of sand on all Earth's beaches.",
  "Neutron stars can spin up to 600 times per second.",
  "One million Earths could fit inside the Sun.",
  "A year on Mercury lasts only 88 Earth days.",
  "There’s a planet made entirely of diamonds — 55 Cancri e.",
  "Space smells like seared steak and hot metal, according to astronauts.",
  "The footprints on the Moon could last for millions of years.",
  "Saturn could float on water because it's mostly made of gas.",
  "Jupiter’s Great Red Spot is a storm larger than Earth that’s lasted over 300 years."
];

// Auto-set start date to 9 days ago
window.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  const nineDaysAgo = new Date();
  nineDaysAgo.setDate(today.getDate() - 8);
  startDateInput.value = nineDaysAgo.toISOString().split("T")[0];
});

// Fetch button
fetchBtn.addEventListener("click", fetchAPODData);

async function fetchAPODData() {
  // Show random space fact while loading
  const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  loadingMsg.textContent = `🚀 Loading images... Did you know? ${randomFact}`;
  loadingMsg.style.display = "block";
  gallery.innerHTML = "";

  try {
    const res = await fetch(apodData);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const allData = await res.json();
    if (!Array.isArray(allData)) throw new Error("Unexpected data format.");

    // Filter and sort most recent images
    const imagesOnly = allData.filter(item => item.media_type === "image");
    const sorted = imagesOnly.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Select 9 most recent images
    const latestNine = sorted.slice(0, 9);

    displayGallery(latestNine);

  } catch (err) {
    console.error(err);
    gallery.innerHTML = `<p class='error'>Error loading data. Please try again later.</p>`;
  } finally {
    // Let the loading fact stay visible for a bit before hiding
    setTimeout(() => {
      loadingMsg.style.display = "none";
    }, 1000);
  }
}

// Display images in the gallery
function displayGallery(images) {
  gallery.innerHTML = "";
  images.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.url}" alt="${item.title}" />
      <div class="card-info">
        <h3>${item.title}</h3>
        <p>${item.date}</p>
      </div>
    `;
    card.addEventListener("click", () => openModal(item));
    gallery.appendChild(card);
  });
}

// Modal functions
function openModal(item) {
  modalImg.src = item.hdurl || item.url;
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalDesc.textContent = item.explanation;
  modal.style.display = "flex";
}

closeModal.addEventListener("click", () => (modal.style.display = "none"));

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

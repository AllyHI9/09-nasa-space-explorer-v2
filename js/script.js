const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

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

// Auto-set start date to 9 days ago
window.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  const nineDaysAgo = new Date();
  nineDaysAgo.setDate(today.getDate() - 8);
  startDateInput.value = nineDaysAgo.toISOString().split("T")[0];
});

fetchBtn.addEventListener("click", fetchAPODData);

async function fetchAPODData() {
  loadingMsg.style.display = "block";
  gallery.innerHTML = "";

  try {
    const res = await fetch(apodData);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const allData = await res.json();
    if (!Array.isArray(allData)) throw new Error("Unexpected data format.");

    // Sort newest to oldest and take first 9 images only
    const imagesOnly = allData.filter(item => item.media_type === "image");
    const latestNine = imagesOnly
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 9);

    if (latestNine.length === 0) {
      gallery.innerHTML = `<p class='error'>No images found.</p>`;
      return;
    }

    displayGallery(latestNine);
  } catch (err) {
    console.error(err);
    gallery.innerHTML = `<p class='error'>Error loading data. Please try again later.</p>`;
  } finally {
    loadingMsg.style.display = "none";
  }
}

// Create and display gallery cards
function displayGallery(images) {
  gallery.innerHTML = ""; // Clear existing cards
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

// Modal open/close logic
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

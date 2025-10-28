// ...existing code...
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

// Helper: try to build a YouTube thumbnail if the video is a YouTube link
function youtubeThumbnailFromUrl(url) {
  try {
    // common youtube patterns
    const ytRegex = /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;
    const m = url.match(ytRegex);
    if (m && m[1]) {
      return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
    }
  } catch (e) {
    // ignore errors and return null
  }
  return null;
}

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

    // Include both images and videos
    const mediaItems = allData.filter(item =>
      item.media_type === "image" || item.media_type === "video"
    );

    // Sort newest first, take the 9 most recent, then reverse to show oldest -> newest
    const newestNineDesc = mediaItems
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 9);
    const displayItems = newestNineDesc.reverse(); // now oldest -> newest

    displayGallery(displayItems);

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

// Display images and video thumbnails in the gallery (kept to 9 slots)
// We keep the existing .card markup so the site's look remains the same.
// For videos we show a thumbnail and a small play badge.
function displayGallery(images) {
  gallery.innerHTML = "";

  images.forEach(item => {
    // Create card element (keeps current site look)
    const card = document.createElement("div");
    card.className = "card";
    card.style.position = "relative"; // allow badge overlay for videos

    // Decide thumbnail: image uses item.url, video tries thumbnail_url or YouTube thumb
    let thumb = "";
    if (item.media_type === "image") {
      thumb = item.url;
    } else {
      // video
      thumb = item.thumbnail_url || youtubeThumbnailFromUrl(item.url) || "https://via.placeholder.com/640x360?text=Video";
    }

    // Insert the card content (same structure as before)
    card.innerHTML = `
      <img src="${thumb}" alt="${item.title}" />
      <div class="card-info">
        <h3>${item.title}</h3>
        <p>${item.date}</p>
      </div>
    `;

    // If it's a video, add a small play badge so users know it's a video
    if (item.media_type === "video") {
      const badge = document.createElement("div");
      badge.textContent = "▶";
      // simple inline styles to avoid changing CSS files and keep page look
      badge.style.position = "absolute";
      badge.style.left = "10px";
      badge.style.top = "10px";
      badge.style.background = "rgba(0,0,0,0.6)";
      badge.style.color = "#fff";
      badge.style.padding = "6px 8px";
      badge.style.borderRadius = "6px";
      badge.style.fontWeight = "700";
      badge.style.fontSize = "14px";
      card.appendChild(badge);
    }

    // Open modal; modal handler will show iframe for videos and image for images
    card.addEventListener("click", () => openModal(item));
    gallery.appendChild(card);
  });
}

// Modal functions: support both images and videos.
// For videos we inject an iframe with id 'modalIframe' so we can clean it up later.
function openModal(item) {
  // Remove any previous iframe
  const existingIframe = document.getElementById("modalIframe");
  if (existingIframe) existingIframe.remove();

  // Set title/date/description (same for both media types)
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalDesc.textContent = item.explanation;

  if (item.media_type === "image") {
    // Show the image element and hide any iframe
    modalImg.style.display = "block";
    modalImg.src = item.hdurl || item.url;
  } else {
    // Video: hide the img element and create an iframe
    modalImg.style.display = "none";
    const iframe = document.createElement("iframe");
    iframe.id = "modalIframe";
    iframe.src = item.url; // APOD provides embed-friendly URLs in many cases
    iframe.width = "100%";
    iframe.height = "480";
    iframe.frameBorder = "0";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;

    // Insert iframe into modal-content before the .modal-info block
    const modalContent = modal.querySelector(".modal-content");
    const modalInfo = modal.querySelector(".modal-info");
    modalContent.insertBefore(iframe, modalInfo);
  }

  modal.style.display = "flex";
}

// Helper to close and cleanup modal (removes iframe and resets image)
function closeModalCleanup() {
  modal.style.display = "none";
  const iframe = document.getElementById("modalIframe");
  if (iframe) iframe.remove();
  modalImg.style.display = "block";
  modalImg.src = "";
  modalTitle.textContent = "";
  modalDate.textContent = "";
  modalDesc.textContent = "";
}

closeModal.addEventListener("click", () => closeModalCleanup());

window.addEventListener("click", (e) => {
  if (e.target === modal) closeModalCleanup();
});
// ...existing code...
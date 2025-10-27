// ...existing code...
// Use this URL to fetch NASA APOD JSON data.


// IMPORTANT: Do NOT commit real API keys or secrets. Replace the value below with your
// own NASA API key locally before running, or load it from a secure place.
// For example, set the key in an environment variable and inject it at build time.
//const API_KEY = "REPLACE_WITH_YOUR_NASA_API_KEY"; // <-- replace locally
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


// ...existing code...
async function fetchAPODData() {
  // Get the date range from the UI
  const startDate = startDateInput.value;
  if (!startDate) {
    alert("Please select a start date.");
    return;
  }

  loadingMsg.style.display = "block";
  gallery.innerHTML = "";

  try {
    // Build start and end Date objects for the 9-day range
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 8); // 9 days total

    // Convert dates to YYYY-MM-DD strings (not strictly needed for local filtering,
    // but useful for debugging/logging)
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    // Fetch the full dataset from the provided apodData endpoint.
    // We are NOT calling the NASA API here; instead we use the provided JSON file.
    // Then we filter the returned array for entries within the selected date range.
    const res = await fetch(apodData);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const allData = await res.json();
    if (!Array.isArray(allData)) throw new Error("Unexpected data format.");

    // Filter entries to the requested date range (inclusive).
    const filtered = allData.filter((item) => {
      // Parse the item's date and check it falls inside the range
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });

    // If no entries found, show a friendly message.
    if (filtered.length === 0) {
      gallery.innerHTML = `<p class='error'>No images found for ${startStr} to ${endStr}.</p>`;
      return;
    }

    // Display the filtered images
    displayGallery(filtered);
  } catch (err) {
    console.error(err);
    gallery.innerHTML = `<p class='error'>Error loading data. Please try again later.</p>`;
  } finally {
    loadingMsg.style.display = "none";
  }
}
// ...existing code...


function displayGallery(images) {
  images.forEach((item) => {
    if (item.media_type !== "image") return; // skip videos


    const card = document.createElement("div");
    card.className = "card";


    card.innerHTML = `
      <img src='${item.url}' alt='${item.title}' />
      <div class='card-info'>
        <h3>${item.title}</h3>
        <p>${item.date}</p>
      </div>
    `;


    card.addEventListener("click", () => openModal(item));
    gallery.appendChild(card);
  });
}


function openModal(item) {
  modalImg.src = item.hdurl || item.url;
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalDesc.textContent = item.explanation;
  modal.style.display = "block";
}


closeModal.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});
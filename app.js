/**
 * TravelMate - Cute Pastel Scrapbook Travel Planner
 * Vanilla JavaScript Application Logic
 */

// ==========================================
// 1. Initial State & Realistic Mock Data
// ==========================================

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  INR: "₹"
};

// Backend API Client
const API_BASE = window.location.origin.includes("http") ? window.location.origin : "http://localhost:3000";
const api = {
  async getTrips() {
    try {
      const res = await fetch(`${API_BASE}/api/trips`);
      return res.ok ? await res.json() : null;
    } catch (e) {
      return null;
    }
  },
  async getTrip(id) {
    try {
      const res = await fetch(`${API_BASE}/api/trips/${id}`);
      return res.ok ? await res.json() : null;
    } catch (e) {
      return null;
    }
  },
  async createTrip(tripData) {
    try {
      const res = await fetch(`${API_BASE}/api/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData)
      });
      return res.ok ? await res.json() : null;
    } catch (e) {
      return null;
    }
  },
  async updateTrip(id, data) {
    try {
      const res = await fetch(`${API_BASE}/api/trips/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return res.ok ? await res.json() : null;
    } catch (e) {
      return null;
    }
  },
  async deleteTrip(id) {
    try {
      const res = await fetch(`${API_BASE}/api/trips/${id}`, { method: "DELETE" });
      return res.ok ? await res.json() : null;
    } catch (e) {
      return null;
    }
  },
  async savePacking(tripId, item) {
    try {
      const res = await fetch(`${API_BASE}/api/trips/${tripId}/packing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      return res.ok ? await res.json() : null;
    } catch (e) {
      return null;
    }
  },
  async togglePacking(tripId, itemId, isPacked) {
    try {
      const res = await fetch(`${API_BASE}/api/trips/${tripId}/packing/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_packed: isPacked })
      });
      return res.ok ? await res.json() : null;
    } catch (e) {
      return null;
    }
  },
  async deletePacking(tripId, itemId) {
    try {
      const res = await fetch(`${API_BASE}/api/trips/${tripId}/packing/${itemId}`, { method: "DELETE" });
      return res.ok ? await res.json() : null;
    } catch (e) {
      return null;
    }
  },
  async saveExpense(tripId, expense) {
    try {
      const res = await fetch(`${API_BASE}/api/trips/${tripId}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense)
      });
      return res.ok ? await res.json() : null;
    } catch (e) {
      return null;
    }
  },
  async generateTrip(preferences) {
    const res = await fetch(`${API_BASE}/generate-trip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences)
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  }
};

// Curated destinations with realistic travel info
const DESTINATIONS = [
  {
    id: "kyoto",
    city: "Kyoto",
    country: "Japan",
    vibe: "🌸 Peaceful & Historic",
    weather: "🌸 19°C Spring Bloom",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=75",
    desc: "Ancient wooden temples, tranquil zen moss gardens, and ethereal bamboo groves paired with warm matcha and street bakeries.",
    tags: ["Temples", "Tea Ceremonies", "Kimono", "Bamboo Grove"],
    defaultStyle: "Cultural & Historic",
    defaultAccommodation: "Boutique Ryokan / Hotel",
    defaultBudget: 1800,
    defaultDays: 5
  },
  {
    id: "amalfi",
    city: "Amalfi Coast",
    country: "Italy",
    vibe: "🍋 Sun-drenched & Pastel",
    weather: "☀️ 26°C Mediterranean Breeze",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=75",
    desc: "Cliffside pastel villages tumbling toward cobalt blue waters. Sip limoncello spritz and take breezy boat rides to hidden grottoes.",
    tags: ["Gelato", "Coastal Drives", "Boat Tours", "Limoncello"],
    defaultStyle: "Romantic Getaway",
    defaultAccommodation: "Quaint Bed & Breakfast",
    defaultBudget: 2200,
    defaultDays: 4
  },
  {
    id: "swiss-alps",
    city: "Interlaken & Lauterbrunnen",
    country: "Switzerland",
    vibe: "⛰️ Alpine Magic",
    weather: "⛅ 16°C Fresh Mountain Air",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=75",
    desc: "Valley of 72 waterfalls, panoramic wooden cogwheel trains, cozy fondue chalets, and wildflower meadows straight out of Heidi.",
    tags: ["Hiking", "Waterfalls", "Cheese Fondue", "Cogwheel Train"],
    defaultStyle: "Adventure & Nature",
    defaultAccommodation: "Traditional Countryside Cottage",
    defaultBudget: 2400,
    defaultDays: 6
  },
  {
    id: "bali",
    city: "Ubud & Canggu",
    country: "Indonesia",
    vibe: "🌴 Tropical Bliss",
    weather: "🌤️ 29°C Tropical Warmth",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=75",
    desc: "Emerald rice terraces, artisan craft markets, beachside sunsets with coconut sips, and tranquil yoga retreats in the jungle.",
    tags: ["Rice Terraces", "Surfing", "Smoothie Bowls", "Temples"],
    defaultStyle: "Beach & Coastal",
    defaultAccommodation: "Boutique Ryokan / Hotel",
    defaultBudget: 1300,
    defaultDays: 7
  },
  {
    id: "reykjavik",
    city: "Reykjavik & South Coast",
    country: "Iceland",
    vibe: "🌋 Nordic Wonder",
    weather: "❄️ 8°C Crisp Northern Winds",
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&auto=format&fit=crop&q=75",
    desc: "Geothermal lagoons, cascading glacial waterfalls, black sand coastlines, and fairy-tale puffin cliffs under glowing skies.",
    tags: ["Hot Springs", "Waterfalls", "Northern Lights", "Glaciers"],
    defaultStyle: "Adventure & Nature",
    defaultAccommodation: "Cozy Airbnb Apartment",
    defaultBudget: 2600,
    defaultDays: 5
  },
  {
    id: "paris",
    city: "Paris",
    country: "France",
    vibe: "🥐 Chic & Vintage",
    weather: "⛅ 21°C Gentle Breezes",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=75",
    desc: "Cobblestone alleys of Montmartre, buttery morning croissants by the Seine, art treasures inside the Louvre, and golden Eiffel hour.",
    tags: ["Croissants", "Louvre", "Bistros", "Vintage Flea Markets"],
    defaultStyle: "Romantic Getaway",
    defaultAccommodation: "Cozy Airbnb Apartment",
    defaultBudget: 2100,
    defaultDays: 4
  }
];

// Initial packing list items
const INITIAL_PACKING_ITEMS = [
  { id: 1, name: "Passport & Visa copies", category: "Documents", packed: true },
  { id: 2, name: "Flight & Hotel confirmation slips", category: "Documents", packed: true },
  { id: 3, name: "Lightweight linen shirts & tees (x4)", category: "Clothing", packed: false },
  { id: 4, name: "Comfortable walking sneakers", category: "Clothing", packed: true },
  { id: 5, name: "Cozy evening cardigan / jacket", category: "Clothing", packed: false },
  { id: 6, name: "Toiletry bag with mini skincare bottles", category: "Toiletries", packed: true },
  { id: 7, name: "Mineral sunscreen SPF 50+", category: "Toiletries", packed: false },
  { id: 8, name: "Universal travel plug adapter", category: "Tech & Gear", packed: true },
  { id: 9, name: "Portable power bank 10,000mAh", category: "Tech & Gear", packed: false },
  { id: 10, name: "Vintage 35mm film or Polaroid camera", category: "Tech & Gear", packed: true },
  { id: 11, name: "Travel journal notebook & gel pens", category: "Fun & Comfort", packed: false },
  { id: 12, name: "Silk eye mask & lavender pillow mist", category: "Fun & Comfort", packed: false }
];

// Default saved trips in "My Trips"
const INITIAL_SAVED_TRIPS = [
  {
    id: "trip-kyoto-spring",
    title: "Kyoto Spring Blossom Escape",
    destination: "Kyoto, Japan",
    dates: "2026-04-10 to 2026-04-15",
    duration: 5,
    travellers: "Couple / Pair (2 travellers)",
    style: "Cultural & Historic",
    hotel: "Boutique Ryokan Gion",
    budget: 1800,
    currency: "USD",
    pace: "Balanced & Steady (3-4 stops/day)",
    status: "Upcoming",
    coverImg: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&auto=format&fit=crop&q=70"
  },
  {
    id: "trip-amalfi-summer",
    title: "Pastel Cliffside Coastline",
    destination: "Amalfi Coast, Italy",
    dates: "2026-06-18 to 2026-06-22",
    duration: 4,
    travellers: "Solo Wanderer (1 traveller)",
    style: "Romantic Getaway",
    hotel: "Villa Rosa Positano B&B",
    budget: 2100,
    currency: "EUR",
    pace: "Relaxed & Breezy (1-2 stops/day)",
    status: "Planning",
    coverImg: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=500&auto=format&fit=crop&q=70"
  },
  {
    id: "trip-swiss-autumn",
    title: "Alpine Trails & Fondue Dreams",
    destination: "Interlaken, Switzerland",
    dates: "2026-09-02 to 2026-09-08",
    duration: 6,
    travellers: "Friend Squad (4 travellers)",
    style: "Adventure & Nature",
    hotel: "Valley Meadow Wooden Chalet",
    budget: 2500,
    currency: "USD",
    pace: "Fast & Action-Packed (Full day)",
    status: "Dreaming",
    coverImg: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=70"
  }
];

// App State
const state = {
  currentTrip: null,
  activeDayIndex: 0,
  packingItems: [...INITIAL_PACKING_ITEMS],
  packingFilter: "all",
  savedTrips: [...INITIAL_SAVED_TRIPS],
  budget: {
    total: 1800,
    currency: "USD",
    spent: 1140,
    categories: {
      "Accommodation": { planned: 700, spent: 520, color: "#B2E2E6" },
      "Food & Dining": { planned: 450, spent: 310, color: "#FFD1DC" },
      "Activities & Sights": { planned: 300, spent: 180, color: "#FFF1B0" },
      "Transport": { planned: 250, spent: 110, color: "#CBEAD6" },
      "Shopping & Souvenirs": { planned: 100, spent: 20, color: "#E4D7F5" }
    },
    expenses: [
      { id: 1, title: "Ryokan Deposit & Booking", category: "Accommodation", amount: 520 },
      { id: 2, title: "7-Day Regional Rail Pass", category: "Transport", amount: 110 },
      { id: 3, title: "Gion Tea Ceremony & Wagashi", category: "Activities & Sights", amount: 45 },
      { id: 4, title: "Kaiseki Dinner in Pontocho Alley", category: "Food & Dining", amount: 120 },
      { id: 5, title: "Matcha Soft Serve & Dango", category: "Food & Dining", amount: 15 },
      { id: 6, title: "Handmade ceramic teacup souvenir", category: "Shopping & Souvenirs", amount: 20 }
    ]
  }
};

// ==========================================
// 2. Itinerary Generator (Realistic Mock Engine)
// ==========================================

function generateRealisticItinerary(tripData) {
  const dest = tripData.destination || "Kyoto, Japan";
  const duration = parseInt(tripData.duration) || 5;
  const days = [];

  const activityTemplates = [
    {
      morning: { title: "Early Sunrise Walk & Bakery Treats", desc: "Beat the crowds to capture serene golden hour photos. Stop by a beloved local pastry shop for fresh warm treats.", tag: "Sunrise & Coffee" },
      afternoon: { title: "Historic Old Town & Hidden Alleys", desc: "Stroll along historic cobblestones, explore artisan workshops, and shop for local souvenirs and postcards.", tag: "Culture & Sights" },
      evening: { title: "Cozy Lantern-lit Dinner & Drinks", desc: "Unwind at a quaint local tavern or eatery. Savor regional specialities and write today's journal entries.", tag: "Gastronomy" }
    },
    {
      morning: { title: "Famous Landmark & Scenic Viewpoint", desc: "Ascend to the city's iconic overlook. Breathtaking panoramic views perfect for polaroids.", tag: "Scenic Panorama" },
      afternoon: { title: "Art Museum & Garden Picnic", desc: "Discover tranquil courtyards and contemporary exhibits, followed by an iced latte under shade trees.", tag: "Art & Leisure" },
      evening: { title: "Riverside Stroll & Street Food Market", desc: "Sample vibrant street stalls, sweet crêpes or skewers, and watch local performers as streetlamps glow.", tag: "Night Walk" }
    },
    {
      morning: { title: "Nature Excursion & Forest Path", desc: "Breathe in crisp pine air along a scenic nature trail. Peaceful serenity away from city buzz.", tag: "Fresh Air" },
      afternoon: { title: "Traditional Workshop Experience", desc: "Hands-on crafting session (pottery, cooking class, or tea tasting) with friendly local masters.", tag: "Interactive" },
      evening: { title: "Sunset Observation & Fine Dining", desc: "Watch the sky turn pastel pink and gold before a relaxed 3-course dinner celebration.", tag: "Sunset Glow" }
    },
    {
      morning: { title: "Local Farmers & Flea Market", desc: "Browse vintage postcards, handmade trinkets, and fresh fruit. Great spot for scrapbook stickers!", tag: "Treasure Hunt" },
      afternoon: { title: "Botanical Sanctuary & Reading Hour", desc: "A slow afternoon lounging near blooming flowerbeds or fountains with your favorite book.", tag: "Slow Living" },
      evening: { title: "Acoustic Live Music & Candlelit Cafe", desc: "Cozy up in a wooden jazz lounge or acoustic cafe with hot cider or craft cocktails.", tag: "Melodic Night" }
    },
    {
      morning: { title: "Farewell Morning Cafe & Packing", desc: "Leisurely breakfast in your hotel garden. Pack bags and seal the first batch of postcards.", tag: "Sweet Goodbyes" },
      afternoon: { title: "Last Minute Souvenirs & Treat Box", desc: "Pick up sweet confections, local spices, and tea tins for loved ones back home.", tag: "Gift Hunting" },
      evening: { title: "Grand Finale Dinner & Trip Toast", desc: "Toast to an unforgettable journey with fellow travellers. Review polaroids together.", tag: "Memory Night" }
    }
  ];

  for (let i = 1; i <= duration; i++) {
    const template = activityTemplates[(i - 1) % activityTemplates.length];
    days.push({
      dayNumber: i,
      title: `Day ${i}: ${i === 1 ? 'Arrival & Gentle Beginnings' : (i === duration ? 'Final Treasures & Farewell' : `Exploring the Charms of ${dest.split(',')[0]}`)}`,
      city: dest.split(',')[0].trim(),
      hotel: tripData.accommodation || "Cozy Boutique Stay",
      weather: ["☀️ 22°C Clear & Mild", "⛅ 20°C Breezy", "🌤️ 23°C Sunny", "🌸 19°C Spring Air"][i % 4],
      morning: {
        time: "08:30 AM - 11:30 AM",
        title: template.morning.title,
        desc: template.morning.desc,
        tag: template.morning.tag
      },
      afternoon: {
        time: "01:00 PM - 04:30 PM",
        title: template.afternoon.title,
        desc: template.afternoon.desc,
        tag: template.afternoon.tag
      },
      evening: {
        time: "06:30 PM - 09:30 PM",
        title: template.evening.title,
        desc: template.evening.desc,
        tag: template.evening.tag
      },
      journalNote: `Scrapbook reminder: Pick up stamps at the post office and save the restaurant receipt for pasting in our photo book!`,
      photoUrl: [
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&auto=format&fit=crop&q=70",
        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&auto=format&fit=crop&q=70",
        "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=500&auto=format&fit=crop&q=70",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=70",
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&auto=format&fit=crop&q=70"
      ][(i - 1) % 5]
    });
  }

  return {
    ...tripData,
    days: days
  };
}

// ==========================================
// 3. Navigation & Page Controller
// ==========================================

function navigateTo(pageId) {
  // Update view classes
  const views = document.querySelectorAll(".view-section");
  views.forEach(v => v.classList.remove("active"));

  const targetView = document.getElementById(`${pageId}-view`);
  if (targetView) {
    targetView.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Update Nav links
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    if (link.getAttribute("data-page") === pageId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Close mobile menu if open
  const navMenu = document.getElementById("navMenu");
  if (navMenu) navMenu.classList.remove("open");

  // Hash update without jumping
  if (history.pushState) {
    history.pushState(null, null, `#${pageId}`);
  } else {
    location.hash = `#${pageId}`;
  }
}

// ==========================================
// 4. Renderers: Itinerary View
// ==========================================

function renderItinerary() {
  const trip = state.currentTrip;
  if (!trip || !trip.days || trip.days.length === 0) return;

  // Header updates
  document.getElementById("itineraryTitle").innerText = trip.title || `Adventure in ${trip.destination}`;
  document.getElementById("itineraryCityDisplay").innerText = trip.destination;
  document.getElementById("itineraryHotelDisplay").innerText = trip.accommodation || trip.hotel || "Boutique Stay";
  document.getElementById("itineraryTravellersDisplay").innerText = `${trip.travellerType || 'Wanderer'} (${trip.travellerCount || 2} travellers)`;
  document.getElementById("itineraryStyleBadge").innerText = trip.travelStyle || trip.style || "Cultural & Historic";

  // Day Tabs
  const dayTabsList = document.getElementById("dayTabsList");
  dayTabsList.innerHTML = trip.days.map((day, idx) => `
    <button class="day-tab-btn ${idx === state.activeDayIndex ? 'active' : ''}" onclick="selectDayTab(${idx})">
      <span>Day ${day.dayNumber}</span>
      <span class="day-badge-small">${day.city}</span>
    </button>
  `).join("");

  // Active Day Spread
  const activeDay = trip.days[state.activeDayIndex] || trip.days[0];
  const spreadContainer = document.getElementById("dayDetailSpread");

  spreadContainer.innerHTML = `
    <div class="day-header-ribbon">
      <div class="day-heading-group">
        <div class="cute-badge">DAY ${activeDay.dayNumber} OF ${trip.days.length}</div>
        <h3>${activeDay.title}</h3>
      </div>
      <div class="day-weather-badge">${activeDay.weather}</div>
    </div>

    <div class="day-meta-cards">
      <div class="meta-info-card">
        <strong>📍 Exploring:</strong> ${activeDay.city} & surrounding neighborhood
      </div>
      <div class="meta-info-card">
        <strong>🏨 Hotel Base:</strong> ${activeDay.hotel}
      </div>
    </div>

    <div class="schedule-time-slots">
      <!-- Morning -->
      <div class="time-slot-card morning">
        <div class="slot-tag">☕ Morning</div>
        <div class="slot-time">${activeDay.morning.time}</div>
        <h4 class="slot-title">${activeDay.morning.title}</h4>
        <p class="slot-desc">${activeDay.morning.desc}</p>
        <span class="slot-highlight-tag">✨ ${activeDay.morning.tag}</span>
      </div>

      <!-- Afternoon -->
      <div class="time-slot-card afternoon">
        <div class="slot-tag">🌞 Afternoon</div>
        <div class="slot-time">${activeDay.afternoon.time}</div>
        <h4 class="slot-title">${activeDay.afternoon.title}</h4>
        <p class="slot-desc">${activeDay.afternoon.desc}</p>
        <span class="slot-highlight-tag">🌿 ${activeDay.afternoon.tag}</span>
      </div>

      <!-- Evening -->
      <div class="time-slot-card evening">
        <div class="slot-tag">🌙 Evening</div>
        <div class="slot-time">${activeDay.evening.time}</div>
        <h4 class="slot-title">${activeDay.evening.title}</h4>
        <p class="slot-desc">${activeDay.evening.desc}</p>
        <span class="slot-highlight-tag">🏮 ${activeDay.evening.tag}</span>
      </div>
    </div>

    <div class="day-scrapbook-footer">
      <div class="day-journal-note">
        <div class="pin">📌</div>
        <h4>Journal Note & Memory Stamp 💌</h4>
        <p>${activeDay.journalNote}</p>
      </div>
      <div class="day-side-photo">
        <div class="polaroid-card" style="transform: rotate(2deg); margin: 0 auto;">
          <img src="${activeDay.photoUrl}" alt="Day memory photo" />
          <div class="polaroid-caption">Day ${activeDay.dayNumber} moments 🌸</div>
        </div>
      </div>
    </div>
  `;
}

function selectDayTab(idx) {
  state.activeDayIndex = idx;
  renderItinerary();
}

// ==========================================
// 5. Renderers: Packing List
// ==========================================

function renderPackingList() {
  const grid = document.getElementById("packingListGrid");
  const filtered = state.packingItems.filter(item => {
    if (state.packingFilter === "all") return true;
    return item.category === state.packingFilter;
  });

  grid.innerHTML = filtered.map(item => `
    <div class="packing-item-card ${item.packed ? 'packed' : ''}" data-id="${item.id}">
      <div class="item-left">
        <input 
          type="checkbox" 
          class="item-checkbox" 
          ${item.packed ? 'checked' : ''} 
          onchange="togglePackingItem(${item.id})"
          id="pack-chk-${item.id}"
        />
        <div class="item-details">
          <label for="pack-chk-${item.id}" class="item-name">${escapeHtml(item.name)}</label>
          <span class="item-category-pill">${item.category}</span>
        </div>
      </div>
      <button class="item-delete-btn" onclick="deletePackingItem(${item.id})" title="Remove item">
        🗑️
      </button>
    </div>
  `).join("");

  // Update tally and progress bar
  const total = state.packingItems.length;
  const packed = state.packingItems.filter(i => i.packed).length;
  const pct = total === 0 ? 0 : Math.round((packed / total) * 100);

  document.getElementById("packedCount").innerText = packed;
  document.getElementById("totalCount").innerText = total;
  document.getElementById("packingProgressBar").style.width = `${pct}%`;
  document.getElementById("packingProgressPct").innerText = `${pct}%`;
}

function togglePackingItem(id) {
  const item = state.packingItems.find(i => i.id === id);
  if (item) {
    item.packed = !item.packed;
    const tripId = state.currentTrip ? state.currentTrip.id : 'trip-kyoto-spring';
    api.togglePacking(tripId, id, item.packed);
    if (window.db) db.savePackingItem(tripId, item);
    renderPackingList();
  }
}

function deletePackingItem(id) {
  state.packingItems = state.packingItems.filter(i => i.id !== id);
  const tripId = state.currentTrip ? state.currentTrip.id : 'trip-kyoto-spring';
  api.deletePacking(tripId, id);
  if (window.db) db.deletePackingItem(id);
  renderPackingList();
  showToast("Item removed from packing bag!");
}

function addPackingItem(name, category) {
  const newItem = {
    id: Date.now(),
    name: name.trim(),
    category: category,
    packed: false
  };
  state.packingItems.unshift(newItem);
  const tripId = state.currentTrip ? state.currentTrip.id : 'trip-kyoto-spring';
  api.savePacking(tripId, newItem);
  if (window.db) db.savePackingItem(tripId, newItem);
  renderPackingList();
  showToast(`Added "${name}" to ${category}!`);
}

// ==========================================
// 6. Renderers: Budget & Expenses
// ==========================================

function renderBudget() {
  const currency = state.budget.currency || "USD";
  const sym = CURRENCY_SYMBOLS[currency] || "$";

  // Re-calculate spent from expenses
  let totalSpent = 0;
  const catSpent = {};
  Object.keys(state.budget.categories).forEach(c => { catSpent[c] = 0; });

  state.budget.expenses.forEach(e => {
    totalSpent += parseFloat(e.amount);
    if (catSpent[e.category] !== undefined) {
      catSpent[e.category] += parseFloat(e.amount);
    }
  });

  state.budget.spent = totalSpent;
  const totalBudget = state.budget.total;
  const remaining = Math.max(0, totalBudget - totalSpent);
  const ratioPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Overview Cards
  document.getElementById("budgetTotalDisplay").innerText = `${sym}${totalBudget.toLocaleString()}`;
  document.getElementById("budgetSpentDisplay").innerText = `${sym}${totalSpent.toLocaleString()}`;
  document.getElementById("budgetSpentRatio").innerText = `${ratioPct}% of total budget`;
  document.getElementById("budgetRemainingDisplay").innerText = `${sym}${remaining.toLocaleString()}`;

  // Category Progress Bars
  const barsContainer = document.getElementById("categoryBarsList");
  barsContainer.innerHTML = Object.entries(state.budget.categories).map(([catName, catData]) => {
    const spent = catSpent[catName] || 0;
    const planned = catData.planned || 300;
    const pct = Math.min(100, Math.round((spent / planned) * 100));
    return `
      <div class="category-bar-row">
        <div class="bar-meta">
          <span>${catName}</span>
          <span>${sym}${spent} / ${sym}${planned} (${pct}%)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${pct}%; background-color: ${catData.color};"></div>
        </div>
      </div>
    `;
  }).join("");

  // Recent Receipts list
  const logList = document.getElementById("expenseLogList");
  logList.innerHTML = state.budget.expenses.slice().reverse().map(e => `
    <li class="expense-log-item">
      <div>
        <span class="expense-title-tag">${escapeHtml(e.title)}</span>
        <small style="color: #7A6F66; display: block; font-size: 0.76rem;">${e.category}</small>
      </div>
      <span class="expense-amount-tag">-${sym}${parseFloat(e.amount).toFixed(2)}</span>
    </li>
  `).join("");
}

function addExpense(title, amount, category) {
  const newExp = {
    id: Date.now(),
    title: title.trim(),
    amount: parseFloat(amount),
    category: category
  };
  state.budget.expenses.push(newExp);
  const tripId = state.currentTrip ? state.currentTrip.id : 'trip-kyoto-spring';
  api.saveExpense(tripId, newExp);
  if (window.db) db.saveBudgetItem(tripId, newExp);
  renderBudget();
  showToast(`Receipt logged: ${title} (-${CURRENCY_SYMBOLS[state.budget.currency] || '$'}${amount})`);
}

// ==========================================
// 7. Renderers: Destinations & My Trips
// ==========================================

function renderDestinations() {
  const container = document.getElementById("destinationsGrid");
  container.innerHTML = DESTINATIONS.map(d => `
    <div class="destination-postcard">
      <div class="destination-photo-box">
        <img src="${d.image}" alt="${d.city}" loading="lazy" />
        <span class="dest-vibe-badge">${d.vibe}</span>
      </div>
      <div class="destination-card-body">
        <div class="dest-city-country">
          <h3>${d.city}</h3>
          <span class="dest-weather-icon">${d.weather.split(' ')[0]}</span>
        </div>
        <small style="color: var(--ink-muted); margin-bottom: 0.6rem; font-weight: 600;">${d.country}</small>
        <p class="dest-description">${d.desc}</p>
        <div class="dest-tags">
          ${d.tags.map(t => `<span class="dest-tag">#${t}</span>`).join("")}
        </div>
        <button class="btn btn-secondary btn-small w-100" onclick="selectDestinationForPlanning('${d.id}')">
          ✏️ Plan Trip to ${d.city}
        </button>
      </div>
    </div>
  `).join("");
}

function selectDestinationForPlanning(destId) {
  const dest = DESTINATIONS.find(d => d.id === destId);
  if (!dest) return;

  // Pre-fill Plan Trip form
  document.getElementById("tripDestination").value = `${dest.city}, ${dest.country}`;
  document.getElementById("tripBudget").value = dest.defaultBudget;
  document.getElementById("accommodationType").value = dest.defaultAccommodation;

  // Set default 5-day departure & return dates starting tomorrow
  const today = new Date();
  const dep = new Date(today);
  dep.setDate(dep.getDate() + 7);
  const ret = new Date(dep);
  ret.setDate(ret.getDate() + dest.defaultDays);

  document.getElementById("tripDeparture").value = dep.toISOString().split('T')[0];
  document.getElementById("tripReturn").value = ret.toISOString().split('T')[0];
  document.getElementById("tripDuration").value = dest.defaultDays;

  // Check matching style radio
  const styleRadios = document.querySelectorAll("input[name='travelStyle']");
  styleRadios.forEach(radio => {
    if (radio.value === dest.defaultStyle) radio.checked = true;
  });

  navigateTo("plan-trip");
  showToast(`Pre-filled scrapbook for ${dest.city}!`);
}

function renderMyTrips() {
  const container = document.getElementById("myTripsGrid");
  container.innerHTML = state.savedTrips.map(trip => `
    <div class="my-trip-card">
      <div class="washi-tape-small tape-yellow"></div>
      <div class="trip-card-header">
        <span class="trip-status-badge ${trip.status === 'Active' ? 'active-trip' : 'upcoming-trip'}">
          ${trip.status || 'Planned'}
        </span>
        <span style="font-size: 1.2rem;">📌</span>
      </div>
      <h3>${trip.title}</h3>
      <div class="trip-destination-sub">📍 ${trip.destination}</div>

      <ul class="trip-meta-list">
        <li>🗓️ <strong>Dates:</strong> ${trip.dates} (${trip.duration} days)</li>
        <li>👥 <strong>Party:</strong> ${trip.travellers}</li>
        <li>🎨 <strong>Style:</strong> ${trip.style}</li>
        <li>🏨 <strong>Stay:</strong> ${trip.hotel || trip.accommodation}</li>
        <li>💰 <strong>Budget:</strong> ${CURRENCY_SYMBOLS[trip.currency] || '$'}${trip.budget}</li>
      </ul>

      <div class="trip-card-actions" style="display: flex; gap: 0.5rem;">
        <button class="btn btn-primary btn-small" style="flex: 2;" onclick="loadSavedTripToItinerary('${trip.id}')">
          📖 Open Itinerary
        </button>
        <button class="btn btn-outline btn-small" style="flex: 1; padding: 0.4rem;" onclick="deleteTripHandler('${trip.id}')" title="Delete Trip">
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join("");
}

async function deleteTripHandler(tripId) {
  if (!confirm("Are you sure you want to remove this trip journal?")) return;
  await api.deleteTrip(tripId);
  state.savedTrips = state.savedTrips.filter(t => t.id !== tripId);
  renderMyTrips();
  showToast("Trip removed from database!");
}

async function loadSavedTripToItinerary(tripId) {
  let tripData = await api.getTrip(tripId);
  const localTrip = state.savedTrips.find(t => t.id === tripId);

  if (tripData && tripData.trip) {
    const t = tripData.trip;
    state.currentTrip = {
      id: t.id,
      title: `${t.destination.split(',')[0]} Scrapbook Vacation`,
      destination: t.destination,
      dates: `${t.start_date} to ${t.end_date}`,
      duration: t.duration,
      budget: t.budget,
      currency: t.currency,
      travellerType: t.traveller_type,
      travellerCount: t.traveller_count,
      travelStyle: t.travel_style,
      accommodation: t.accommodation,
      pace: t.pace,
      days: (tripData.days && tripData.days.length > 0) 
        ? tripData.days 
        : generateRealisticItinerary({ destination: t.destination, duration: t.duration }).days
    };

    if (tripData.packing && tripData.packing.length > 0) {
      state.packingItems = tripData.packing.map(p => ({
        id: p.id,
        name: p.item_name,
        category: p.category,
        packed: !!p.is_packed
      }));
      renderPackingList();
    }

    if (tripData.budget && tripData.budget.length > 0) {
      state.budget.expenses = tripData.budget.map(b => ({
        id: b.id,
        title: b.title || b.category,
        category: b.category,
        amount: b.amount
      }));
      renderBudget();
    }
  } else if (localTrip) {
    state.currentTrip = generateRealisticItinerary({
      title: localTrip.title,
      destination: localTrip.destination,
      duration: localTrip.duration,
      dates: localTrip.dates,
      budget: localTrip.budget,
      currency: localTrip.currency,
      travellerType: localTrip.travellers.split(' ')[0],
      travellerCount: localTrip.travellers.match(/\d+/) ? localTrip.travellers.match(/\d+/)[0] : 2,
      travelStyle: localTrip.style,
      accommodation: localTrip.hotel,
      pace: localTrip.pace || "Balanced & Steady"
    });
  }

  state.activeDayIndex = 0;
  renderItinerary();
  navigateTo("itinerary");
  showToast(`Loaded ${state.currentTrip.title}!`);
}

// ==========================================
// 8. Utility Helpers & Toast
// ==========================================

function escapeHtml(str) {
  const div = document.createElement("div");
  div.innerText = str;
  return div.innerHTML;
}

let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById("scrapbookToast");
  const msgEl = document.getElementById("toastMessage");
  if (!toast || !msgEl) return;

  msgEl.innerText = msg;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// Auto calculate duration from dates
function calculateDuration() {
  const dep = document.getElementById("tripDeparture").value;
  const ret = document.getElementById("tripReturn").value;
  if (!dep || !ret) return;

  const d1 = new Date(dep);
  const d2 = new Date(ret);
  const diffTime = d2 - d1;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const durationInput = document.getElementById("tripDuration");
  if (diffDays > 0) {
    durationInput.value = diffDays;
  } else {
    durationInput.value = 1;
  }
}

// ==========================================
// 9. Event Listeners & Bootstrapping
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initial Dates Setup for Plan Trip Form (starts 1 week from today)
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() + 10);
  const end = new Date(start);
  end.setDate(start.getDate() + 5);

  const depInput = document.getElementById("tripDeparture");
  const retInput = document.getElementById("tripReturn");
  if (depInput && retInput) {
    depInput.value = start.toISOString().split("T")[0];
    retInput.value = end.toISOString().split("T")[0];
    depInput.addEventListener("change", calculateDuration);
    retInput.addEventListener("change", calculateDuration);
  }

  // 2. Navigation click handling
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      if (page) navigateTo(page);
    });
  });

  // Mobile menu toggle
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const navMenu = document.getElementById("navMenu");
  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });
  }

  // 3. Plan Trip Form Submission (Connected to Grok AI Backend)
  const planForm = document.getElementById("planTripForm");
  if (planForm) {
    planForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = planForm.querySelector("button[type='submit']");
      const originalBtnText = submitBtn.innerHTML;

      const destination = document.getElementById("tripDestination").value.trim();
      const depDate = document.getElementById("tripDeparture").value;
      const retDate = document.getElementById("tripReturn").value;
      const duration = parseInt(document.getElementById("tripDuration").value) || 5;
      const budget = parseFloat(document.getElementById("tripBudget").value) || 1500;
      const currency = document.getElementById("tripCurrency").value;
      const travellerType = document.getElementById("travellerType").value;
      const travellerCount = document.getElementById("travellerCount").value;
      const accommodation = document.getElementById("accommodationType").value;
      const pace = document.getElementById("tripPace").value;

      const styleRadio = document.querySelector("input[name='travelStyle']:checked");
      const travelStyle = styleRadio ? styleRadio.value : "Cultural & Historic";

      const tripPayload = {
        destination,
        startDate: depDate,
        endDate: retDate,
        duration,
        budget,
        currency,
        travellerType,
        travellerCount,
        travelStyle,
        accommodation,
        pace
      };

      // Loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = "✨ Groq AI is writing your itinerary...";

      try {
        const result = await api.generateTrip(tripPayload);

        if (result.ok && result.data && result.data.success) {
          const data = result.data;
          const tripObj = data.trip;

          state.currentTrip = {
            id: tripObj.id,
            title: data.title || `${destination.split(',')[0]} AI Vacation`,
            summary: data.summary,
            destination: tripObj.destination,
            dates: `${tripObj.start_date} to ${tripObj.end_date}`,
            duration: tripObj.duration,
            budget: tripObj.budget,
            currency: tripObj.currency,
            travellerType: tripObj.traveller_type,
            travellerCount: tripObj.traveller_count,
            style: tripObj.travel_style,
            hotel: tripObj.accommodation,
            accommodation: tripObj.accommodation,
            pace: tripObj.pace,
            days: data.days || generateRealisticItinerary({ destination, duration }).days
          };
          state.activeDayIndex = 0;

          // Update packing suggestions from Groq
          if (Array.isArray(data.packing) && data.packing.length > 0) {
            state.packingItems = data.packing.map(p => ({
              id: p.id || Date.now(),
              name: p.name || p.item_name,
              category: p.category || 'Clothing',
              packed: !!p.packed
            }));
            renderPackingList();
          }

          // Update budget breakdown from Groq
          if (data.budgetBreakdown && typeof data.budgetBreakdown === 'object') {
            Object.entries(data.budgetBreakdown).forEach(([cat, amt]) => {
              if (state.budget.categories[cat]) {
                state.budget.categories[cat].planned = amt;
              }
            });
            state.budget.total = budget;
            state.budget.currency = currency;
            renderBudget();
          }

          // Save to state trips
          state.savedTrips.unshift({
            id: tripObj.id,
            title: data.title || `${destination.split(',')[0]} AI Scrapbook Vacation`,
            destination: tripObj.destination,
            dates: `${tripObj.start_date} to ${tripObj.end_date}`,
            duration: tripObj.duration,
            travellers: `${tripObj.traveller_type} (${tripObj.traveller_count} travellers)`,
            style: tripObj.travel_style,
            hotel: tripObj.accommodation,
            budget: tripObj.budget,
            currency: tripObj.currency,
            pace: tripObj.pace,
            status: "Active"
          });

          renderItinerary();
          renderMyTrips();

          showToast(`✨ Groq AI generated your trip to ${destination}!`);
          navigateTo("itinerary");
        } else {
          // Error or missing key handling
          const errMsg = result.data?.error || "Groq AI is temporarily unavailable.";
          showToast(`⚠️ ${errMsg}`);

          if (result.data?.needsKey) {
            alert(
              "Groq API Key Notice:\n" +
              "1. Sign in at https://console.groq.com/keys\n" +
              "2. Generate a free API Key\n" +
              "3. Paste into .env file as GROQ_API_KEY=gsk_...\n" +
              "4. Restart server (npm start)\n\n" +
              "Generating a standard offline scrapbook plan for you now!"
            );

            // Fallback generation so user isn't stuck
            const fallbackId = `trip-${Date.now()}`;
            const fallbackTrip = {
              id: fallbackId,
              title: `${destination.split(',')[0]} Scrapbook Escape`,
              destination,
              dates: `${depDate} to ${retDate}`,
              duration,
              travellers: `${travellerType} (${travellerCount} travellers)`,
              style: travelStyle,
              hotel: accommodation,
              budget,
              currency,
              pace,
              status: "Active"
            };
            state.currentTrip = generateRealisticItinerary(fallbackTrip);
            state.activeDayIndex = 0;
            state.savedTrips.unshift(fallbackTrip);

            api.createTrip({ ...tripPayload, id: fallbackId, days: state.currentTrip.days });

            renderItinerary();
            renderBudget();
            renderMyTrips();
            navigateTo("itinerary");
          }
        }
      } catch (err) {
        console.error("Groq trip generation error:", err);
        showToast("⚠️ Network error while contacting Groq API. You can retry!");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // 4. Packing List events
  const packingForm = document.getElementById("addPackingItemForm");
  if (packingForm) {
    packingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("newPackingItemName");
      const catSelect = document.getElementById("newPackingCategory");
      if (input.value.trim()) {
        addPackingItem(input.value, catSelect.value);
        input.value = "";
      }
    });
  }

  const packingFilterButtons = document.querySelectorAll("#packingCategoryFilters .filter-tab");
  packingFilterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      packingFilterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.packingFilter = btn.getAttribute("data-cat");
      renderPackingList();
    });
  });

  // 5. Budget Form events
  const addExpenseForm = document.getElementById("addExpenseForm");
  if (addExpenseForm) {
    addExpenseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const titleInput = document.getElementById("expenseTitle");
      const amtInput = document.getElementById("expenseAmount");
      const catSelect = document.getElementById("expenseCategory");

      if (titleInput.value && amtInput.value) {
        addExpense(titleInput.value, amtInput.value, catSelect.value);
        titleInput.value = "";
        amtInput.value = "";
      }
    });
  }

  // 6. Print Itinerary button
  const printBtn = document.getElementById("printItineraryBtn");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // 7. Initialize State & Load from Backend Database
  async function initializeApp() {
    let backendTrips = await api.getTrips();

    if (backendTrips && backendTrips.length > 0) {
      state.savedTrips = backendTrips.map(t => ({
        id: t.id,
        title: `${t.destination.split(',')[0]} Scrapbook Vacation`,
        destination: t.destination,
        dates: `${t.start_date} to ${t.end_date}`,
        duration: t.duration,
        travellers: `${t.traveller_type} (${t.traveller_count} travellers)`,
        style: t.travel_style,
        hotel: t.accommodation,
        accommodation: t.accommodation,
        budget: t.budget,
        currency: t.currency,
        pace: t.pace,
        status: "Active"
      }));

      // Load first trip's details directly from backend
      await loadSavedTripToItinerary(state.savedTrips[0].id);
    } else {
      if (window.db) {
        try {
          const storedTrips = await db.getAllTrips();
          if (storedTrips && storedTrips.length > 0) {
            state.savedTrips = storedTrips;
          }
        } catch (err) {
          console.warn("Local DB read error:", err);
        }
      }

      state.currentTrip = generateRealisticItinerary({
        title: state.savedTrips[0]?.title || "Kyoto Spring Blossom Escape",
        destination: state.savedTrips[0]?.destination || "Kyoto, Japan",
        duration: state.savedTrips[0]?.duration || 5,
        dates: state.savedTrips[0]?.dates || "2026-04-10 to 2026-04-15",
        budget: state.savedTrips[0]?.budget || 1800,
        currency: state.savedTrips[0]?.currency || "USD",
        travellerType: "Couple / Pair",
        travellerCount: 2,
        travelStyle: "Cultural & Historic",
        accommodation: "Boutique Ryokan Gion",
        pace: "Balanced & Steady (3-4 stops/day)"
      });

      renderItinerary();
    }

    renderPackingList();
    renderBudget();
    renderDestinations();
    renderMyTrips();

    const hash = window.location.hash.replace("#", "");
    if (hash && document.getElementById(`${hash}-view`)) {
      navigateTo(hash);
    } else {
      navigateTo("home");
    }
  }

  initializeApp();
});

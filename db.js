/**
 * TravelMate Minimal Persistent Database (IndexedDB)
 * Stores essential data: trips, itineraries, packing, and budget.
 */

const DB_NAME = "TravelMateDB";
const DB_VERSION = 1;

let dbInstance = null;

function initDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Trips Store
      if (!db.objectStoreNames.contains("trips")) {
        db.createObjectStore("trips", { keyPath: "id" });
      }

      // 2. Itineraries Store
      if (!db.objectStoreNames.contains("itineraries")) {
        const itinStore = db.createObjectStore("itineraries", { keyPath: "id", autoIncrement: true });
        itinStore.createIndex("trip_id", "trip_id", { unique: false });
      }

      // 3. Packing Store
      if (!db.objectStoreNames.contains("packing")) {
        const packStore = db.createObjectStore("packing", { keyPath: "id", autoIncrement: true });
        packStore.createIndex("trip_id", "trip_id", { unique: false });
      }

      // 4. Budget Store
      if (!db.objectStoreNames.contains("budget")) {
        const budgetStore = db.createObjectStore("budget", { keyPath: "id", autoIncrement: true });
        budgetStore.createIndex("trip_id", "trip_id", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Database helper functions
const db = {
  // Trips
  async saveTrip(trip) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("trips", "readwrite");
      tx.objectStore("trips").put(trip);
      tx.oncomplete = () => resolve(trip);
      tx.onerror = () => reject(tx.error);
    });
  },

  async getAllTrips() {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("trips", "readonly");
      const request = tx.objectStore("trips").getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Itinerary
  async saveItinerary(tripId, days) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("itineraries", "readwrite");
      const store = tx.objectStore("itineraries");
      const index = store.index("trip_id");
      const getReq = index.getAllKeys(tripId);

      getReq.onsuccess = () => {
        getReq.result.forEach(key => store.delete(key));
        days.forEach(day => {
          store.add({
            trip_id: tripId,
            day_number: day.dayNumber,
            city: day.city,
            hotel: day.hotel,
            activities: day
          });
        });
      };

      tx.oncomplete = () => resolve(days);
      tx.onerror = () => reject(tx.error);
    });
  },

  async getItinerary(tripId) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("itineraries", "readonly");
      const index = tx.objectStore("itineraries").index("trip_id");
      const request = index.getAll(tripId);
      request.onsuccess = () => resolve(request.result.map(r => r.activities));
      request.onerror = () => reject(request.error);
    });
  },

  // Packing
  async savePackingItem(tripId, item) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("packing", "readwrite");
      const store = tx.objectStore("packing");
      store.put({ ...item, trip_id: tripId });
      tx.oncomplete = () => resolve(item);
      tx.onerror = () => reject(tx.error);
    });
  },

  async getAllPackingItems(tripId) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("packing", "readonly");
      const index = tx.objectStore("packing").index("trip_id");
      const request = index.getAll(tripId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deletePackingItem(id) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("packing", "readwrite");
      tx.objectStore("packing").delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  // Budget
  async saveBudgetItem(tripId, item) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("budget", "readwrite");
      const store = tx.objectStore("budget");
      store.put({ ...item, trip_id: tripId });
      tx.oncomplete = () => resolve(item);
      tx.onerror = () => reject(tx.error);
    });
  },

  async getAllBudgetItems(tripId) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("budget", "readonly");
      const index = tx.objectStore("budget").index("trip_id");
      const request = index.getAll(tripId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
};

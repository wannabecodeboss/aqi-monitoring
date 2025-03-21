const axios = require("axios");
const admin = require("firebase-admin");

// Load Firebase service account from GitHub Secret
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aqi-monitoring-f0ba6-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

// Function to fetch AQI data
async function fetchAQI() {
  const city = "Delhi"; // Change this if needed
  const apiKey = process.env.AQICN_API_TOKEN;
  const url = `https://api.waqi.info/feed/${city}/?token=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "ok") {
      const aqiValue = response.data.data.aqi;
      return aqiValue;
    } else {
      console.error("API Error:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error fetching AQI:", error.message);
    return null;
  }
}

// Function to update Firebase
async function updateFirebase(aqi) {
  if (aqi === null) return;

  const now = new Date();
  const dateKey = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const timeKey = now.toLocaleTimeString("en-IN", { hour12: false }).slice(0, 5); // HH:MM

  const db = admin.database();
  await db.ref(`/${dateKey}/${timeKey}`).set(aqi);
  console.log(`Updated AQI: ${aqi} at ${timeKey}`);
}

// Main function
async function main() {
  const aqi = await fetchAQI();
  await updateFirebase(aqi);
}

main();

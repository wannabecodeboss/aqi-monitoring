const axios = require("axios");
const admin = require("firebase-admin");

// Initialize Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://aqi-monitoring-f0ba6-default-rtdb.asia-southeast1.firebasedatabase.app/",
  });
}

const db = admin.database();

// Fetch AQI Data
async function fetchAQIData() {
  try {
    const city = "delhi"; // Change this as needed
    const apiKey = process.env.AQICN_API_TOKEN;
    const apiUrl = `https://api.waqi.info/feed/${city}/?token=${apiKey}`;

    const response = await axios.get(apiUrl);
    console.log("Full API Response:", JSON.stringify(response.data, null, 2)); // Debugging line

    if (response.data.status !== "ok") {
      throw new Error("Invalid API response: " + response.data.data);
    }

    const currentAQI = response.data.data.aqi;
    const forecastData = response.data.data.forecast ? response.data.data.forecast.daily.pm25 : null;

    if (!forecastData) {
      console.warn("Warning: 'daily' forecast data is missing!");
    }

    return { currentAQI, forecastData };
  } catch (error) {
    console.error("Error fetching AQI data:", error.message);
    return null;
  }
}

// Update Firebase
async function updateFirebase() {
  const aqiData = await fetchAQIData();
  if (!aqiData) return;

  const now = new Date();
  const dateKey = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const timeKey = now.toTimeString().split(" ")[0].slice(0, 5); // HH:MM

  const ref = db.ref(`aqi/${dateKey}/${timeKey}`);
  await ref.set({
    aqi: aqiData.currentAQI,
    forecast: aqiData.forecastData || "N/A",
  });

  console.log(`Updated Firebase: ${dateKey} ${timeKey} -> AQI: ${aqiData.currentAQI}`);
}

// Run the update
updateFirebase();

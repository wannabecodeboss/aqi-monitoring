const axios = require("axios");
const admin = require("firebase-admin");

// Initialize Firebase
const serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aqi-monitoring-f0ba6-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const db = admin.database();

// API Details
const CITY = "delhi";
const API_TOKEN = "f36238c6c7079c4f75849ca65cc35c312c8937b3";
const API_URL = `https://api.waqi.info/feed/${CITY}/?token=${API_TOKEN}`;

// Convert UTC to IST
function getCurrentISTTime() {
  let now = new Date();
  let istOffset = 5.5 * 60 * 60 * 1000; // IST Offset (+5:30)
  let istTime = new Date(now.getTime() + istOffset);
  
  let date = istTime.toISOString().split("T")[0]; // YYYY-MM-DD
  let hour = istTime.getHours().toString().padStart(2, "0");
  let minute = istTime.getMinutes().toString().padStart(2, "0");

  return { date, time: `${hour}:${minute}` };
}

// Fetch AQI Data & Update Firebase
async function fetchAndUpdateAQI() {
  try {
    const response = await axios.get(API_URL);
    const aqi = response.data.data.aqi;

    if (!aqi) {
      console.error("Error: Invalid AQI data received.");
      return;
    }

    const { date, time } = getCurrentISTTime();

    // Store in Firebase at: Delhi/YYYY-MM-DD/HH:MM → AQI
    await db.ref(`Delhi/${date}/${time}`).set(aqi);
    
    console.log(`✅ Updated AQI for Delhi: ${aqi} at ${time} IST`);
  } catch (error) {
    console.error("Error fetching AQI:", error);
  }
}

// Run the function
fetchAndUpdateAQI();

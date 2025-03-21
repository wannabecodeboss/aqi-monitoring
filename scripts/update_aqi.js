const axios = require("axios");
const admin = require("firebase-admin");

// Read Firebase credentials from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aqi-monitoring-f0ba6-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const db = admin.database();

const CITY = "delhi";
const API_TOKEN = "f36238c6c7079c4f75849ca65cc35c312c8937b3";
const API_URL = `https://api.waqi.info/feed/${CITY}/?token=${API_TOKEN}`;

function getCurrentISTTime() {
  let now = new Date();
  let istOffset = 5.5 * 60 * 60 * 1000;
  let istTime = new Date(now.getTime() + istOffset);
  
  let date = istTime.toISOString().split("T")[0]; // YYYY-MM-DD
  let hour = istTime.getHours().toString().padStart(2, "0");
  let minute = istTime.getMinutes().toString().padStart(2, "0");

  return { date, time: `${hour}:${minute}` };
}

async function fetchAndUpdateAQI() {
  try {
    const response = await axios.get(API_URL);
    const aqi = response.data.data.aqi;

    if (!aqi) {
      console.error("Error: Invalid AQI data received.");
      return;
    }

    const { date, time } = getCurrentISTTime();

    await db.ref(`Delhi/${date}/${time}`).set(aqi);
    
    console.log(`✅ Updated AQI for Delhi: ${aqi} at ${time} IST`);
  } catch (error) {
    console.error("Error fetching AQI:", error);
  }
}

fetchAndUpdateAQI();

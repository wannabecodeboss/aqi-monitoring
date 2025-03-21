const axios = require("axios");
const admin = require("firebase-admin");

// Load Firebase service account credentials
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aqi-monitoring-f0ba6-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const API_KEY = process.env.AQICN_API_TOKEN;
const CITY = "delhi";
const FIREBASE_DB = admin.database();

async function fetchAQIData() {
  try {
    // Fetch real-time AQI
    const realtimeRes = await axios.get(`https://api.waqi.info/feed/${CITY}/?token=${API_KEY}`);
    const realtimeAQI = realtimeRes.data.data.aqi;
    
    // Fetch forecast AQI
    const forecastRes = await axios.get(`https://api.waqi.info/api/feed/${CITY}/forecast/?token=${API_KEY}`);
    const forecastData = forecastRes.data.data.forecast.daily.pm25;

    // Prepare data
    const now = new Date();
    const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(" ")[0].substring(0, 5); // HH:MM
    
    const data = {
      real_time: realtimeAQI,
      forecast: forecastData,
    };

    // Upload to Firebase
    await FIREBASE_DB.ref(`aqi_data/${date}/${time}`).set(data);
    console.log(`AQI data updated successfully: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error("Error fetching AQI data:", error);
  }
}

// Run the function
fetchAQIData();

const axios = require("axios");
const admin = require("firebase-admin");

// Load Firebase Credentials from Secrets
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://aqi-monitoring-f0ba6-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const db = admin.database();
const API_TOKEN = "YOUR_API_TOKEN"; // Replace with actual API token
const CITY = "delhi";

async function fetchAndStoreAQI() {
    const now = new Date();
    const dateKey = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const timeKey = now.toTimeString().slice(0, 5); // HH:MM

    try {
        const response = await axios.get(`https://api.waqi.info/feed/delhi/?token=f36238c6c7079c4f75849ca65cc35c312c8937b3);
        if (response.data.status === "ok") {
            const aqiValue = response.data.data.aqi;
            await db.ref(`aqi/${dateKey}/${timeKey}`).set(aqiValue);
            console.log(`Stored AQI ${aqiValue} for ${timeKey} on ${dateKey}`);
        } else {
            console.error("API Error:", response.data);
        }
    } catch (error) {
        console.error("API Fetch Error:", error);
    }
}

fetchAndStoreAQI();

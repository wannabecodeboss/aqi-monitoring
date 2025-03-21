const admin = require("firebase-admin");

// Load Firebase service account credentials
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aqi-monitoring-f0ba6-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const FIREBASE_DB = admin.database();

async function fetchAQIData() {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const snapshot = await FIREBASE_DB.ref(`aqi_data/${today}`).once("value");

    if (!snapshot.exists()) {
      console.log("No AQI data found for today.");
      return;
    }

    const aqiData = snapshot.val();
    console.log("AQI Data:", JSON.stringify(aqiData, null, 2));
  } catch (error) {
    console.error("Error fetching AQI data:", error);
  }
}

// Run the function
fetchAQIData();

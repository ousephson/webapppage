const brokerUrl = "wss://broker.emqx.io:8084/mqtt";
const topic = "sensor/dht22_ldr";

const tempElement = document.getElementById("temperature");
const humidityElement = document.getElementById("humidity");
const sunlightElement = document.getElementById("sunlight");
const statusElement = document.getElementById("status");

let client;
let isConnected = false;

// Reconnection Logic
function connectToBroker() {
  client = mqtt.connect(brokerUrl);

  client.on("connect", () => {
    isConnected = true;
    statusElement.textContent = "Connected to MQTT broker";
    client.subscribe(topic, (err) => {
      if (err) console.error("Subscription error:", err);
    });
  });

  client.on("disconnect", () => {
    isConnected = false;
    statusElement.textContent = "Disconnected. Reconnecting...";
    setTimeout(connectToBroker, 5000); // Retry connection after 5 seconds
  });

  client.on("message", (topic, message) => {
    const data = JSON.parse(message.toString());
    updateData(data);
    cacheData(data);
  });

  client.on("error", (error) => {
    console.error("MQTT Client Error:", error);
    statusElement.textContent = "Connection error. Retrying...";
    setTimeout(connectToBroker, 5000);
  });
}

// Update UI with Data
function updateData(data) {
  const { temperature, humidity, sunlightIntensity } = data;

  tempElement.textContent = `${temperature.toFixed(1)} °C`;
  humidityElement.textContent = `${humidity.toFixed(1)} %`;
  sunlightElement.textContent = `${sunlightIntensity.toFixed(1)} %`;

  statusElement.textContent = isConnected ? "Connected" : "Offline (Cached Data)";
}

// Cache Data Locally
function cacheData(data) {
  localStorage.setItem("lastData", JSON.stringify(data));
}

// Load Cached Data
function loadCachedData() {
  const cachedData = JSON.parse(localStorage.getItem("lastData"));
  if (cachedData) updateData(cachedData);
}

// Manual Reload Button
function reloadSensorData() {
  if (isConnected) {
    console.log("Reloading sensor data...");
    statusElement.textContent = "Reloading...";
  } else {
    loadCachedData();
  }
}

// Initial Connection
connectToBroker();
loadCachedData(); // Load cached data on startup

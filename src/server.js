require("dotenv").config();
const app = require("./app");
const connectDb = require("./config/db");

const PORT = process.env.PORT || 4000;
const PING_INTERVAL_MS = Number(process.env.PING_INTERVAL_MS || 10 * 60 * 1000);

const startPing = (baseUrl) => {
  const ping = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.warn(`Ping failed with status ${response.status}`);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Ping failed", error.message);
    }
  };

  ping();
  setInterval(ping, PING_INTERVAL_MS);
};

const start = async () => {
  try {
    await connectDb();
app.listen(PORT, '0.0.0.0', () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`);
      const baseUrl = process.env.PING_URL || `http://localhost:${PORT}`;
      startPing(baseUrl);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

start();

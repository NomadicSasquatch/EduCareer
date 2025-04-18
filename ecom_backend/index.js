const os = require("os");
const express = require("express");
const path = require("path");
const pool = require("./db");
const routes = require("./routes"); // Import all routes
const { handleErrors } = require("./middlewares/errorHandler");
require("dotenv").config();
const sessionMiddleware = require("./middlewares/sessionConfig");

const app = express();

app.use(sessionMiddleware);
app.use(express.json());
const cors = require("cors");

const CLIENT_PORT =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_PROD_PORT
    : process.env.FRONTEND_DEV_PORT;

app.use(
  cors({
    origin: `http://localhost:${CLIENT_PORT}` || "*", // Allow the client app to access the server
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  } else {
    console.log("Database connected successfully!");
    connection.release();
  }
});

app.use("/api", routes); // Prefix all routes with /api

app.use(handleErrors);
app.use((req, res) => {
  res.status(404).json({ error: "Resource not found" });
});

// Start the server
const PORT =
  process.env.NODE_ENV === "production"
    ? process.env.BACKEND_PROD_PORT || 5050
    : process.env.BACKEND_DEV_PORT || 5000;
const HOST = process.env.BACKEND_HOST || "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  if (HOST != "127.0.0.1") {
    showNetworkAddresses(PORT);
  }
});

function showNetworkAddresses(port) {
  const ifaces = os.networkInterfaces();
  console.log("Your server is accessible on the following addresses:");
  Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname].forEach((iface) => {
      if (iface.family === "IPv4" && !iface.internal) {
        console.log(`http://${iface.address}:${port}`);
      }
    });
  });
}

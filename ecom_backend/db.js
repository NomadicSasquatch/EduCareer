// Import the MySQL2 package for database connection
const mysql = require("mysql2");

// Load environment variables from the .env file
require("dotenv").config();

// Create a connection pool to efficiently manage multiple database connections
const pool = mysql.createPool({
  host: process.env.DB_HOST, // Database server host (e.g., localhost or cloud-based DB)
  port: process.env.DB_PORT, // Port number for the database connection
  user: process.env.DB_USERNAME, // Database username for authentication
  password: process.env.DB_PASSWORD, // Database password for authentication
  database: process.env.DB_NAME, // The specific database to connect to
  waitForConnections: true, // Wait for an available connection instead of throwing an error
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0, // Unlimited request queue (0 means no limit)
});

// Export the pool object for use in other parts of the application
module.exports = pool.promise();

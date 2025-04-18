// I am using express-session and express-mysql-session to create sessionCookie
// Follow the instruction from this link: https://www.npmjs.com/package/express-mysql-session
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const pool = require("../db");

// This pool is inside ./db
// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//   });
const sessionStore = new MySQLStore({}, pool); // this line will create a session table in mySQL

const sessionMiddleware = session({
  key: "sessionCookie",
  secret: process.env.SESSION_SECRET || "ecom_secret_key", // will have to update when in production
  store: sessionStore, // Use the pool for session storage
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // if it is in production set to 'true'. make the session https
    // maxAge: 24 * 60 * 60 * 1000, // cookie last 1 day
    httpOnly: true,
  },
});

module.exports = sessionMiddleware; //export the session can liao

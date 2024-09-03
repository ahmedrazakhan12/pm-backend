require("dotenv").config();
const { Sequelize } = require("sequelize");

// Create a new Sequelize instance
const sequelize = new Sequelize("rectApp", "pgkt-mgt", "reactapp123!", {
  host: "localhost",
  dialect: "mysql",
  port: 3306, // MySQL default port
  logging: false, // Set to true if you want to see SQL queries in the console
});

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err.message);
  });

module.exports = sequelize;
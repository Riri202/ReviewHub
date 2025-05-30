const mongoose = require('mongoose');
require("dotenv").config;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL, {
        dbName: process.env.DB_NAME
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
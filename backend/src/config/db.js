const mongoose = require('mongoose');

/**
 * Establishes the Mongoose connection to MongoDB.
 * Reads the URI from the MONGO_URI environment variable (set in .env).
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit on failure — prevents server from running without DB
  }
};

module.exports = connectDB;

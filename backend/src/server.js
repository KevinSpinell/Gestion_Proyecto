require('dotenv').config();
const connectDB = require('./config/db');
const app       = require('./app');

const PORT = process.env.PORT || 3001;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  });
};

start();

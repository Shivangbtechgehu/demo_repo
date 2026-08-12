const mongoose = require('mongoose');
const dns = require('dns');
const { env } = require('./env');

async function connectDB() {
  // Try multiple DNS servers to handle restricted networks
  // Falls back to next if one is blocked
  dns.setServers([
    '8.8.8.8',        // Google Primary
    '8.8.4.4',        // Google Secondary
    '1.1.1.1',        // Cloudflare Primary
    '1.0.0.1',        // Cloudflare Secondary
    '208.67.222.222', // OpenDNS Primary
  ]);

  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4 — fixes many DNS issues on Windows
  });
  console.log('MongoDB connected successfully');
  return mongoose.connection;
}

module.exports = { connectDB };

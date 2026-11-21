const mongoose = require('mongoose');
// Cache the connection across serverless invocations
let cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

module.exports = async function connect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

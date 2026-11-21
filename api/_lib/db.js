const mongoose = require('mongoose');
let cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

module.exports = async function connect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, { bufferCommands: false, serverSelectionTimeoutMS: 8000 })
      .catch((e) => { cached.promise = null; throw e; }); // allow retry after failure
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

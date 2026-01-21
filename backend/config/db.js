const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
    console.log("MongoDB Connected ✅");
    console.log("DB Host:", conn.connection.host);
    console.log("DB Name:", conn.connection.name);
  } catch (error) {
    console.error("MongoDB Connection Error ❌");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
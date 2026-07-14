const mongoose = require("mongoose");

//to provide the connection uri
const DB_URI = "mongodb://candidate:candidate%40hackerearth@localhost:27017/hackerearth_db?authSource=hackerearth_db";
//connect function
const connectDb = async () => {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.log(error);
  }
};

//exportion so that it can be used in server.js
module.exports = connectDb;

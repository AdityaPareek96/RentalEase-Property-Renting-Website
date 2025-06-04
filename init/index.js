// require("dotenv").config(); //  LOAD ENV VARIABLES

// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");

// // const MongoURL = "mongodb://127.0.0.1:27017/wanderlust";
// const dbURL = process.env.ATLASDB_URL;

// main().then(() => {
//     console.log("Connected to DB.");
// }).catch((err) => {console.log(err); });

// async function main() {
//     await mongoose.connect(dbURL);
// };

// const initDB = async () => {
//     await Listing.deleteMany({});
//     initData.data = initData.data.map((obj) => ({...obj, owner: "682dacf165a50fb372539450"}))
//     await Listing.insertMany(initData.data);
//     console.log("data initialized.");
// };

// initDB();

require('dotenv').config({ path: '../.env' }); // LOAD ENV VARIABLES

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

console.log(process.env.ATLASDB_URL)
const dbURL = process.env.ATLASDB_URL;

async function main() {
  try {
    await mongoose.connect(dbURL);
    console.log("Connected to DB.");

    await initDB();

    mongoose.connection.close();
  } catch (err) {
    console.log(err);
  }
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "682dacf165a50fb372539450",
  }));
  await Listing.insertMany(initData.data);
  console.log("data initialized.");
};

main();
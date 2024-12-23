// db.js

// This module contain helper function that connect/disconnect database

const mongoose = require("mongoose");

function connectDatabase() {
    const mongodb_addr = "mongodb://127.0.0.1:27017/phreddit";
    mongoose.connect(mongodb_addr, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    const mongodb = mongoose.connection;

    mongodb.on("error", console.error.bind("[ERROR] MongoDB connection error: "));
    mongodb.on("connected", function() {
        console.log(`[INFO] Connected to database`);
    });

    return mongodb;
}

async function disconnectDatabase() {
    console.log('[INFO] Disconnecting from database');
    await mongoose.disconnect();
    console.log('[INFO] Database disconnected.');
}

module.exports = { 
    connectDatabase, 
    disconnectDatabase 
};
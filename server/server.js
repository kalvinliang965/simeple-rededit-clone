// server.js

// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

const { app, sessionStore } = require("./app.js");
const { connectDatabase, disconnectDatabase } = require("./db.js");

const port = 8000;

const mongodb = connectDatabase();

const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


async function terminate() {
    try {
        console.log("Terminating server...");

        // Close session store if it exists
        if (sessionStore) {
            console.log("Closing session store...");
            sessionStore.close();
        }

        // Disconnect the database
        await disconnectDatabase();

        console.log("Server terminated successfully.");
        // Only exit the process if not in a test environment
        if (process.env.NODE_ENV !== "test") {
            process.exit(0); // Exit gracefully
        }

        await new Promise((resolve) => server.close(resolve));
    } catch (err) {
        console.error("Error during termination:", err);
        process.exit(1); // Exit with error
    }
}


process.on("SIGINT", terminate);
process.on("SIGTERM", terminate);

module.exports = { app, server, mongodb, terminate };
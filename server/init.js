/* server/init.JSON
** You must write a script that will create documents in your database according
** to the datamodel you have defined for the application.  Remember that you 
** must at least initialize an admin user account whose credentials are derived
** from command-line arguments passed to this script. But, you should also add
** some communities, posts, comments, and link-flairs to fill your application
** some initial content.  You can use the initializeDB.js script as inspiration, 
** but you cannot just copy and paste it--you script has to do more to handle
** users.
*/


const mongoose = require("mongoose");
const mongodb_addr = "mongodb://127.0.0.1:27017/phreddit";
const initializeDB = require("./utils/dbInitializer");

mongoose.connect(mongodb_addr,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const mongodb = mongoose.connection;

mongodb.on("error", console.error.bind(console, "[ERROR] MongoDB connection error: "));
mongodb.on("connected",function(){
    console.log('[INFO] Connected to database');
});

// email address, display name, password
const admin_args = process.argv.splice(2);

const adminCredentials = {
    displayName: "HoiFung",
    firstName: "Hoi",
    lastName: "Fung",
    email: "zoiye@gmail.com",
    password: "do_work!",
    createdDate: new Date("May 1, 200 09:32:00"),
}

const { email: admin_email, displayName: admin_name, password: admin_password } = adminCredentials;

console.log(`[INFO] Passed argument: `, admin_args);

if (admin_args.length < 3 || admin_args[0]!== admin_email || admin_args[1]!==admin_name || admin_args[2]!==admin_password) {
    console.error(`[ERROR] Invalid Admin Credentials!`);
    console.error(`Usage: node init.js ${admin_email} ${admin_name} ${admin_password} <restart: true | false>`);
    process.exit(1); // Exit the script on error
}

const restart = admin_args.length >= 4 && admin_args[3].toLowerCase() === "true";

(async function main() {

    try {
        if (restart) {
            // remove everything from the database
            console.log("[INFO] Dropping the database...");
            await mongodb.dropDatabase();
            console.log("[INFO] Database dropped successfully.");
            await initializeDB(adminCredentials);
            console.log("[INFO] Database initialization complete.");
        }
    } catch (err) {
        console.error("[ERROR] Initialization failed:", err);
        console.trace();
    } finally {
        if (mongodb) {
            mongodb.close();
            console.log("[INFO] Database connection closed.");
        }
    }
    

})();


console.log("[INFO] processing...");
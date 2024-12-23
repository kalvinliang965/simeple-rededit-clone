// express.test.js
const request = require("supertest");
const initializeDB = require("./utils/dbInitializer");
const userUtils = require("./utils/userUtils");

const adminCredentials = {
    displayName: "HoiFung",
    firstName: "Hoi",
    lastName: "Fung",
    email: "zoiye@gmail.com",
    password: "do_work!",
    createdDate: new Date("May 1, 200 09:32:00"),
}

// server.js does the mongodb initializing
const { app, server,mongodb, terminate } = require("./server"); // Adjust the path if necessary

describe("Express Server Test", () => {

    beforeAll(async () => {
        await mongodb.dropDatabase();
        await initializeDB(adminCredentials);
    });

    it("should confirm that the server is listening on port 8000", async () => {
        const response = await request(app).get("/"); // Send a GET request to the root route
        expect(response.statusCode).toBe(200); // Expect the server to respond with status code 200
        expect(response.text).toBe("Server is running"); // Verify the server's response text
    });


    it("should return 404 for an unknown route", async () => {
        const response = await request(app).get("/unknown-route");
        expect(response.status).toBe(404);
    });


    it("should signup a new user", async () => {
        
        const newUser = {
            email: "pog@woggies.com",
            firstName: "test",
            lastName: "user",
            displayName: "testuser",
            password: "poggywoggies",
            admin: false,
        }
        const response = await request(app)
            .post("/api/users/register/") // Use only the route, not the full URL
            .send({newUser});
            
        // Verify response status
        expect(response.status).toBe(201);
        

        // Verify response body contains the registered email
        expect(response.body.data).toHaveProperty("email", newUser.email);
        expect(response.body.data).toHaveProperty("firstName", newUser.firstName);
        expect(response.body.data).toHaveProperty("lastName", newUser.lastName);
        expect(response.body.data).toHaveProperty("displayName", newUser.displayName);
    });
    
    it("should login an existing user", async () => {

        const newUser = {
            displayName: "ken", 
            email: "kendricklamar@gmail.com", 
            password: "password123",
            firstName: "test",
            lastName: "user",
            admin: false,
        }

        const createdUser = await userUtils.createUser(newUser);
        expect(createdUser).not.toBeNull();
        
        const response = await request(app)
            .post("/api/users/login/")
            .send({user: {
                email: createdUser.email,
                password: "password123",
            }});
        expect(response.status).toBe(200);
        expect(response.body.email).toBe(createdUser.email);
    });
    
    it("should logout a user", async () => {
        const response = await request(app)
            .post("/api/users/logout/");
        expect(response.status).toBe(204);
    });

    afterAll(async () => {
        await terminate();
    });
});

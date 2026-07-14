const request = require("supertest");
const createServer = require("./src/server");
const Appointment = require("./src/Appointment");
const connectDb = require("./src/db");
const mongoose = require("mongoose");

let app;
let appointmentId;

// Set up the server and database connection before running tests
beforeAll(async () => {
    app = createServer();
    process.env.NODE_ENV = "test";
    await connectDb();
});

describe("Healthcare Appointment API Tests", () => {
    
    // Test for creating an appointment
    it("Create Appointment", async () => {
        const appointmentData = {
            patientName: "Test Patient",
            patientEmail: "patient@test.com",
            doctorName: "Dr. Test",
            department: "Cardiology",
            date: new Date().toISOString().split('T')[0], // Today's date
            time: "10:00 AM",
            notes: "Test appointment",
            status: "scheduled"
        };

        const response = await request(app)
            .post("/appointments")
            .send(appointmentData)
            .expect(201);

        expect(response.body.patientName).toBe("Test Patient");
        appointmentId = response.body._id; // Store appointment ID for future tests
    });

});

// Close the database connection after all tests
afterAll(async () => {
    await mongoose.connection.close();
});
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

    // Test for doctor scheduling conflict
    it("Create Appointment - Doctor Conflict", async () => {
        const conflictingAppointmentData = {
            patientName: "Another Patient",
            patientEmail: "another@test.com",
            doctorName: "Dr. Test", // Same doctor
            department: "Cardiology",
            date: new Date().toISOString().split('T')[0], // Same date
            time: "10:00 AM", // Same time
            notes: "This should fail due to conflict",
            status: "scheduled"
        };

        const response = await request(app)
            .post("/appointments")
            .send(conflictingAppointmentData)
            .expect(400);

        expect(response.body.message).toBe("Doctor already has an appointment at this time");
    });

    // Test for retrieving all appointments
    it("Get All Appointments", async () => {
        const response = await request(app)
            .get("/appointments")
            .expect(200);

        expect(response.body.length).toBeGreaterThan(0);
    });

    // Test for retrieving appointments by department
    it("Get Appointments by Department", async () => {
        const response = await request(app)
            .get("/appointments/department/Cardiology")
            .expect(200);

        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].department).toBe("Cardiology");
    });

    // Test for retrieving appointments by status
    it("Get Appointments by Status", async () => {
        const response = await request(app)
            .get("/appointments/status/scheduled")
            .expect(200);

        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].status).toBe("scheduled");
    });

    // Test for retrieving a single appointment by ID
    it("Get Appointment by ID", async () => {
        const response = await request(app)
            .get(`/appointments/${appointmentId}`)
            .expect(200);

        expect(response.body._id).toBe(appointmentId);
        expect(response.body.patientName).toBe("Test Patient");
    });

    it("Get Appointment by ID - Non-existent ID", async () => {
        const nonExistentId = "65b5c66b7fcf4315a7b91837"; // Valid MongoDB ObjectId format but does not exist
    
        const response = await request(app)
            .get(`/appointments/${nonExistentId}`)
            .expect(404);
    
        expect(response.body.message).toBe("Appointment not found");
    });

    // Test for updating an existing appointment
    it("Update Appointment", async () => {
        const updatedAppointmentData = {
            patientName: "Updated Patient",
            patientEmail: "updated@test.com",
            doctorName: "Dr. Updated",
            department: "Neurology",
            date: new Date().toISOString().split('T')[0], // Today's date
            time: "11:00 AM",
            notes: "Updated test appointment",
            status: "scheduled"
        };

        const response = await request(app)
            .put(`/appointments/${appointmentId}`)
            .send(updatedAppointmentData)
            .expect(200);

        expect(response.body.patientName).toBe("Updated Patient");
        expect(response.body.department).toBe("Neurology");
    });

   
    // Test for deleting a single appointment
    it("Delete Appointment", async () => {
        await request(app)
            .delete(`/appointments/${appointmentId}`)
            .expect(200);

        const deletedAppointment = await Appointment.findById(appointmentId);
        expect(deletedAppointment).toBeNull();
    });

    it("Delete Appointment - Non-existent ID", async () => {
        const nonExistentId = "65b5c66b7fcf4315a7b91837";
    
        const response = await request(app)
            .delete(`/appointments/${nonExistentId}`)
            .expect(404);
    
        expect(response.body.message).toBe("Appointment not found");
    });

    // Create multiple appointments and test deleting all
    it("Delete All Appointments", async () => {
        // Create test appointments
        const appointmentData1 = {
            patientName: "Patient 1",
            patientEmail: "patient1@test.com",
            doctorName: "Dr. One",
            department: "Pediatrics",
            date: new Date().toISOString().split('T')[0],
            time: "09:00 AM",
            notes: "Test appointment 1",
            status: "scheduled"
        };
        
        const appointmentData2 = {
            patientName: "Patient 2",
            patientEmail: "patient2@test.com",
            doctorName: "Dr. Two",
            department: "Dermatology",
            date: new Date().toISOString().split('T')[0],
            time: "09:30 AM",
            notes: "Test appointment 2",
            status: "scheduled"
        };
        
        await request(app).post("/appointments").send(appointmentData1);
        await request(app).post("/appointments").send(appointmentData2);
        
        // Verify appointments were created
        const beforeDelete = await Appointment.find();
        expect(beforeDelete.length).toBeGreaterThan(0);
        
        // Delete all appointments
        await request(app)
            .delete("/appointments")
            .expect(200);

        // Verify all appointments were deleted
        const afterDelete = await Appointment.find();
        expect(afterDelete.length).toBe(0);
    });
});

// Close the database connection after all tests
afterAll(async () => {
    await mongoose.connection.close();
});
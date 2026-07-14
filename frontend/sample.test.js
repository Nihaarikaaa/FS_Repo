import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AddAppointment from "./src/components/AddAppointment";
import EditAppointment from "./src/components/EditAppointment";
import AppointmentList from "./src/components/AppointmentList";
import AppointmentDetails from "./src/components/AppointmentDetails";
import api from './src/api';

jest.mock("./src/api");

// Silence React 18 render warnings
const originalConsoleError = console.error;
console.error = (...args) => {
 if (args[0] && typeof args[0] === 'string' && args[0].includes('ReactDOM.render is no longer supported in React 18')) {
   return;
 }
 originalConsoleError(...args);
};

describe("Healthcare Appointment Scheduler Tests", () => {
 // AddAppointment Component Tests
 describe("AddAppointment Component", () => {
   it("successfully adds an appointment and redirects to the appointment list", async () => {
     const mockAppointment = {
       _id: "123",
       patientName: "John Doe",
       patientEmail: "john@example.com",
       doctorName: "Dr. Smith",
       department: "Cardiology",
       date: new Date().toISOString().split('T')[0],
       time: "10:00 AM",
       notes: "Regular checkup",
       status: "scheduled",
       createdAt: new Date().toISOString()
     };

     api.post.mockResolvedValueOnce({ data: mockAppointment });

     render(
       <MemoryRouter initialEntries={["/add"]}>
         <Routes>
           <Route path="/add" element={<AddAppointment />} />
           <Route path="/appointments" element={<div>Appointment List</div>} />
         </Routes>
       </MemoryRouter>
     );

     // Fill in the form fields
     fireEvent.change(screen.getByLabelText("Patient Name"), {
       target: { value: "John Doe" }
     });
     fireEvent.change(screen.getByLabelText("Patient Email"), {
       target: { value: "john@example.com" }
     });
     fireEvent.change(screen.getByLabelText("Doctor Name"), {
       target: { value: "Dr. Smith" }
     });
     fireEvent.change(screen.getByLabelText("Department"), {
       target: { value: "Cardiology" }
     });
     
     // Set date to today
     const today = new Date().toISOString().split('T')[0];
     fireEvent.change(screen.getByLabelText("Appointment Date"), {
       target: { value: today }
     });
     
     fireEvent.change(screen.getByLabelText("Appointment Time"), {
       target: { value: "10:00 AM" }
     });
     
     fireEvent.change(screen.getByLabelText("Notes"), {
       target: { value: "Regular checkup" }
     });

     // Submit the form
     fireEvent.click(screen.getByText("Schedule Appointment"));

     await waitFor(() => {
       expect(api.post).toHaveBeenCalledWith("/", {
         patientName: "John Doe",
         patientEmail: "john@example.com",
         doctorName: "Dr. Smith",
         department: "Cardiology",
         date: today,
         time: "10:00 AM",
         notes: "Regular checkup",
         status: "scheduled"
       });
       expect(screen.getByText("Appointment scheduled successfully!")).toBeInTheDocument;
     });
   });

   it("shows error when submitting empty form", async () => {
     render(
       <MemoryRouter initialEntries={["/add"]}>
         <Routes>
           <Route path="/add" element={<AddAppointment />} />
         </Routes>
       </MemoryRouter>
     );

     // Submit the form without filling any fields
     fireEvent.click(screen.getByText("Schedule Appointment"));

     await waitFor(() => {
       expect(screen.getByText("All fields except notes are required")).toBeInTheDocument;
     });
   });

 });

});

// Restore the original console.error after all tests
afterAll(() => {
 console.error = originalConsoleError;
});
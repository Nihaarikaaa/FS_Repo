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

   it("validates email format", async () => {
     render(
       <MemoryRouter initialEntries={["/add"]}>
         <Routes>
           <Route path="/add" element={<AddAppointment />} />
         </Routes>
       </MemoryRouter>
     );

     // Fill in form fields with invalid email
     fireEvent.change(screen.getByLabelText("Patient Name"), {
       target: { value: "John Doe" }
     });
     fireEvent.change(screen.getByLabelText("Patient Email"), {
       target: { value: "invalid-email" } // Invalid email format
     });
     fireEvent.change(screen.getByLabelText("Doctor Name"), {
       target: { value: "Dr. Smith" }
     });
     fireEvent.change(screen.getByLabelText("Department"), {
       target: { value: "Cardiology" }
     });
     
     const today = new Date().toISOString().split('T')[0];
     fireEvent.change(screen.getByLabelText("Appointment Date"), {
       target: { value: today }
     });
     
     fireEvent.change(screen.getByLabelText("Appointment Time"), {
       target: { value: "10:00 AM" }
     });

     // Submit the form
     fireEvent.click(screen.getByText("Schedule Appointment"));

     await waitFor(() => {
       expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument;
     });
   });
 });

 // AppointmentDetails Component Tests
 describe("AppointmentDetails Component", () => {
   it("renders appointment details correctly", async () => {
     const mockAppointment = {
       _id: "123",
       patientName: "John Doe",
       patientEmail: "john@example.com",
       doctorName: "Dr. Smith",
       department: "Cardiology",
       date: new Date().toISOString(),
       time: "10:00 AM",
       notes: "Regular checkup",
       status: "scheduled",
       createdAt: new Date().toISOString()
     };

     api.get.mockResolvedValueOnce({ data: mockAppointment });

     render(
       <MemoryRouter initialEntries={["/details/123"]}>
         <Routes>
           <Route path="/details/:id" element={<AppointmentDetails />} />
         </Routes>
       </MemoryRouter>
     );

     // Check for loading indicator
     expect(screen.getByRole("status")).toBeInTheDocument;

     await waitFor(() => {
       expect(screen.getByText("John Doe")).toBeInTheDocument;
       expect(screen.getByText("Dr. Smith")).toBeInTheDocument;
       expect(screen.getByText("Cardiology")).toBeInTheDocument;
       expect(screen.getByText("Regular checkup")).toBeInTheDocument;
       expect(screen.getByText("Scheduled")).toBeInTheDocument;
     });
   });

   it("handles error when the appointment is not found", async () => {
     api.get.mockRejectedValueOnce(new Error("Appointment not found"));

     render(
       <MemoryRouter initialEntries={["/details/123"]}>
         <Routes>
           <Route path="/details/:id" element={<AppointmentDetails />} />
         </Routes>
       </MemoryRouter>
     );

     await waitFor(() => {
       expect(screen.getByText("Failed to load appointment details")).toBeInTheDocument;
     });
   });

   it("allows changing appointment status", async () => {
     const mockAppointment = {
       _id: "123",
       patientName: "John Doe",
       patientEmail: "john@example.com",
       doctorName: "Dr. Smith",
       department: "Cardiology",
       date: new Date().toISOString(),
       time: "10:00 AM",
       notes: "Regular checkup",
       status: "scheduled",
       createdAt: new Date().toISOString()
     };

     api.get.mockResolvedValueOnce({ data: mockAppointment });
     
     const updatedAppointment = {
       ...mockAppointment,
       status: "completed"
     };
     
     api.put.mockResolvedValueOnce({ data: updatedAppointment });

     render(
       <MemoryRouter initialEntries={["/details/123"]}>
         <Routes>
           <Route path="/details/:id" element={<AppointmentDetails />} />
         </Routes>
       </MemoryRouter>
     );

     await waitFor(() => {
       expect(screen.getByText("Mark as Completed")).toBeInTheDocument;
     });

     // Change status to completed
     fireEvent.click(screen.getByText("Mark as Completed"));

     await waitFor(() => {
       expect(api.put).toHaveBeenCalledWith("/123", {
         ...mockAppointment,
         status: "completed"
       });
     });
   });
 });

 // EditAppointment Component Tests
 describe("EditAppointment Component", () => {
   it("renders the form correctly and populates fields", async () => {
     const mockAppointment = {
       _id: "123",
       patientName: "John Doe",
       patientEmail: "john@example.com",
       doctorName: "Dr. Smith",
       department: "Cardiology",
       date: new Date().toISOString(),
       time: "10:00 AM",
       notes: "Regular checkup",
       status: "scheduled",
       createdAt: new Date().toISOString()
     };

     api.get.mockResolvedValueOnce({ data: mockAppointment });

     render(
       <MemoryRouter initialEntries={["/edit/123"]}>
         <Routes>
           <Route path="/edit/:id" element={<EditAppointment />} />
         </Routes>
       </MemoryRouter>
     );

     await waitFor(() => {
       expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument;
       expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument;
       expect(screen.getByDisplayValue("Dr. Smith")).toBeInTheDocument;
       expect(screen.getByDisplayValue("Cardiology")).toBeInTheDocument;
       expect(screen.getByDisplayValue("10:00 AM")).toBeInTheDocument;
       expect(screen.getByDisplayValue("Regular checkup")).toBeInTheDocument;
     });
   });

   // In your test file where the EditAppointment test is defined
 });

 // AppointmentList Component Tests
 describe("AppointmentList Component", () => {
   it("renders the appointment list correctly", async () => {
     const mockAppointments = [
       {
         _id: "1",
         patientName: "John Doe",
         patientEmail: "john@example.com",
         doctorName: "Dr. Smith",
         department: "Cardiology",
         date: new Date().toISOString(),
         time: "10:00 AM",
         status: "scheduled",
         createdAt: new Date().toISOString()
       },
       {
         _id: "2",
         patientName: "Jane Smith",
         patientEmail: "jane@example.com",
         doctorName: "Dr. Johnson",
         department: "Dermatology",
         date: new Date().toISOString(),
         time: "11:00 AM",
         status: "completed",
         createdAt: new Date().toISOString()
       }
     ];

     api.get.mockResolvedValueOnce({ data: mockAppointments });

     render(
       <MemoryRouter>
         <Routes>
           <Route path="/" element={<AppointmentList />} />
         </Routes>
       </MemoryRouter>
     );

     await waitFor(() => {
       expect(screen.getByText("John Doe")).toBeInTheDocument;
       expect(screen.getByText("Jane Smith")).toBeInTheDocument;
       expect(screen.getByText("Dr. Smith (Cardiology)")).toBeInTheDocument;
       expect(screen.getByText("Dr. Johnson (Dermatology)")).toBeInTheDocument;
     });
   });

   it("deletes an appointment from the list", async () => {
     const mockAppointments = [
       {
         _id: "1",
         patientName: "John Doe",
         patientEmail: "john@example.com",
         doctorName: "Dr. Smith",
         department: "Cardiology",
         date: new Date().toISOString(),
         time: "10:00 AM",
         status: "scheduled",
         createdAt: new Date().toISOString()
       },
       {
         _id: "2",
         patientName: "Jane Smith",
         patientEmail: "jane@example.com",
         doctorName: "Dr. Johnson",
         department: "Dermatology",
         date: new Date().toISOString(),
         time: "11:00 AM",
         status: "completed",
         createdAt: new Date().toISOString()
       }
     ];

     api.get.mockResolvedValueOnce({ data: mockAppointments });
     api.delete.mockResolvedValueOnce({});

     // Mock window.confirm to always return true
     global.confirm = jest.fn(() => true);

     render(
       <MemoryRouter>
         <Routes>
           <Route path="/" element={<AppointmentList />} />
         </Routes>
       </MemoryRouter>
     );

     await waitFor(() => {
       expect(screen.getByText("John Doe")).toBeInTheDocument;
     });

     // Find all delete buttons and click the first one
     const deleteButtons = screen.getAllByText("Delete");
     fireEvent.click(deleteButtons[0]);

     await waitFor(() => {
       expect(api.delete).toHaveBeenCalledWith("/1");
     });
   });

   it("filters appointments by status", async () => {
     const allAppointments = [
       {
         _id: "1",
         patientName: "John Doe",
         patientEmail: "john@example.com",
         doctorName: "Dr. Smith",
         department: "Cardiology",
         date: new Date().toISOString(),
         time: "10:00 AM",
         status: "scheduled",
         createdAt: new Date().toISOString()
       },
       {
         _id: "2",
         patientName: "Jane Smith",
         patientEmail: "jane@example.com",
         doctorName: "Dr. Johnson",
         department: "Dermatology",
         date: new Date().toISOString(),
         time: "11:00 AM",
         status: "completed",
         createdAt: new Date().toISOString()
       }
     ];

     const scheduledAppointments = [
       {
         _id: "1",
         patientName: "John Doe",
         patientEmail: "john@example.com",
         doctorName: "Dr. Smith",
         department: "Cardiology",
         date: new Date().toISOString(),
         time: "10:00 AM",
         status: "scheduled",
         createdAt: new Date().toISOString()
       }
     ];

     api.get.mockResolvedValueOnce({ data: allAppointments });
     api.get.mockResolvedValueOnce({ data: scheduledAppointments });

     render(
       <MemoryRouter>
         <Routes>
           <Route path="/" element={<AppointmentList />} />
         </Routes>
       </MemoryRouter>
     );

     await waitFor(() => {
       expect(screen.getByText("John Doe")).toBeInTheDocument;
       expect(screen.getByText("Jane Smith")).toBeInTheDocument;
     });

     // Change filter to scheduled
     fireEvent.change(screen.getByLabelText("Filter by Status"), {
       target: { value: "scheduled" }
     });

     await waitFor(() => {
       expect(screen.getByText("John Doe")).toBeInTheDocument;
       expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument;
     });
   });

   it("filters appointments by department", async () => {
     const allAppointments = [
       {
         _id: "1",
         patientName: "John Doe",
         patientEmail: "john@example.com",
         doctorName: "Dr. Smith",
         department: "Cardiology",
         date: new Date().toISOString(),
         time: "10:00 AM",
         status: "scheduled",
         createdAt: new Date().toISOString()
       },
       {
         _id: "2",
         patientName: "Jane Smith",
         patientEmail: "jane@example.com",
         doctorName: "Dr. Johnson",
         department: "Dermatology",
         date: new Date().toISOString(),
         time: "11:00 AM",
         status: "completed",
         createdAt: new Date().toISOString()
       }
     ];

     const cardiologyAppointments = [
       {
         _id: "1",
         patientName: "John Doe",
         patientEmail: "john@example.com",
         doctorName: "Dr. Smith",
         department: "Cardiology",
         date: new Date().toISOString(),
         time: "10:00 AM",
         status: "scheduled",
         createdAt: new Date().toISOString()
       }
     ];

     api.get.mockResolvedValueOnce({ data: allAppointments });
     api.get.mockResolvedValueOnce({ data: cardiologyAppointments });

     render(
       <MemoryRouter>
         <Routes>
           <Route path="/" element={<AppointmentList />} />
         </Routes>
       </MemoryRouter>
     );

     await waitFor(() => {
       expect(screen.getByText("John Doe")).toBeInTheDocument;
       expect(screen.getByText("Jane Smith")).toBeInTheDocument;
     });

     // Change filter to Cardiology department
     fireEvent.change(screen.getByLabelText("Filter by Department"), {
       target: { value: "Cardiology" }
     });

     await waitFor(() => {
       expect(screen.getByText("John Doe")).toBeInTheDocument;
       expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument;
     });
   });

   it("displays empty message when no appointments exist", async () => {
     api.get.mockResolvedValueOnce({ data: [] });

     render(
       <MemoryRouter>
         <Routes>
           <Route path="/" element={<AppointmentList />} />
         </Routes>
       </MemoryRouter>
     );

     await waitFor(() => {
       expect(screen.getByText("No appointments found. Click on \"New Appointment\" to schedule one.")).toBeInTheDocument;
     });
   });
 });

 // Delete All Appointments Functionality Test
 describe("Delete All Appointments Functionality", () => {
   it("deletes all appointments and clears the list", async () => {
     const mockAppointments = [
       {
         _id: "1",
         patientName: "John Doe",
         patientEmail: "john@example.com",
         doctorName: "Dr. Smith",
         department: "Cardiology",
         date: new Date().toISOString(),
         time: "10:00 AM",
         status: "scheduled",
         createdAt: new Date().toISOString()
       },
       {
         _id: "2",
         patientName: "Jane Smith",
         patientEmail: "jane@example.com",
         doctorName: "Dr. Johnson",
         department: "Dermatology",
         date: new Date().toISOString(),
         time: "11:00 AM",
         status: "completed",
         createdAt: new Date().toISOString()
       }
     ];

     api.get.mockResolvedValueOnce({ data: mockAppointments });
     api.delete.mockResolvedValueOnce({ data: { message: "All appointments have been deleted" } });
     
     // Mock window.confirm to always return true
     global.confirm = jest.fn(() => true);

     render(
       <MemoryRouter>
         <Routes>
           <Route path="/" element={<AppointmentList />} />
         </Routes>
       </MemoryRouter>
     );

     await waitFor(() => {
       expect(screen.getByText("John Doe")).toBeInTheDocument;
       expect(screen.getByText("Jane Smith")).toBeInTheDocument;
     });

     // Click the delete all button
     fireEvent.click(screen.getByText("Delete All"));

     await waitFor(() => {
       expect(api.delete).toHaveBeenCalledWith("/");
       expect(screen.getByText("No appointments found. Click on \"New Appointment\" to schedule one.")).toBeInTheDocument;
     });
   });
 });
});

// Restore the original console.error after all tests
afterAll(() => {
 console.error = originalConsoleError;
});
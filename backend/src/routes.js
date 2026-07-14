const express = require('express');
const { 
  getAllAppointments, 
  getAppointmentById, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment, 
  deleteAllAppointments, 
  getAppointmentsByDepartment,
  getAppointmentsByStatus
} = require('./appointmentController');
const router = express.Router();

router.get('/', getAllAppointments); // Fetch all appointments
router.get('/department/:department', getAppointmentsByDepartment); // Fetch appointments by department
router.get('/status/:status', getAppointmentsByStatus); // Fetch appointments by status
router.get('/:id', getAppointmentById); // Fetch an appointment by ID
router.post('/', createAppointment); // Add a new appointment
router.put('/:id', updateAppointment); // Update an appointment by ID
router.delete('/:id', deleteAppointment); // Delete an appointment by ID
router.delete('/', deleteAllAppointments); // Delete all appointments

module.exports = router;
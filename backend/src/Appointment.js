const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  doctorName: { type: String, required: true },
  department: { 
    type: String, 
    required: true,
    enum: ['Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'General Medicine']
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
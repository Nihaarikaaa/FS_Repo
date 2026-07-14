const Appointment = require('./Appointment'); // Import the Appointment model

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, time: 1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

// Get a single appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointment' });
  }
};

// Get appointments by department
exports.getAppointmentsByDepartment = async (req, res) => {
  try {
    const appointments = await Appointment.find({ department: req.params.department }).sort({ date: 1, time: 1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments by department' });
  }
};

// Get appointments by status
exports.getAppointmentsByStatus = async (req, res) => {
  try {
    const appointments = await Appointment.find({ status: req.params.status }).sort({ date: 1, time: 1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments by status' });
  }
};

// Add a new appointment
exports.createAppointment = async (req, res) => {
  try {
    // Check for appointment conflicts
    const existingAppointment = await Appointment.findOne({
      doctorName: req.body.doctorName,
      date: new Date(req.body.date),
      time: req.body.time,
      status: 'scheduled'
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Doctor already has an appointment at this time' });
    }

    const newAppointment = new Appointment(req.body);
    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating appointment' });
  }
};

// Update an appointment by ID
exports.updateAppointment = async (req, res) => {
  try {
    // If changing date/time/doctor, check for conflicts
    if (req.body.date || req.body.time || req.body.doctorName) {
      const appointmentToUpdate = await Appointment.findById(req.params.id);
      
      // Only check for conflicts if it's still scheduled
      if (appointmentToUpdate.status === 'scheduled' && req.body.status !== 'cancelled') {
        const existingAppointment = await Appointment.findOne({
          doctorName: req.body.doctorName || appointmentToUpdate.doctorName,
          date: req.body.date ? new Date(req.body.date) : appointmentToUpdate.date,
          time: req.body.time || appointmentToUpdate.time,
          status: 'scheduled',
          _id: { $ne: req.params.id } // Exclude current appointment
        });

        if (existingAppointment) {
          return res.status(400).json({ message: 'Doctor already has an appointment at this time' });
        }
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating appointment' });
  }
};

// Delete an appointment by ID
exports.deleteAppointment = async (req, res) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!deletedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment' });
  }
};

// Delete all appointments
exports.deleteAllAppointments = async (req, res) => {
  try {
    await Appointment.deleteMany({});
    res.status(200).json({ message: 'All appointments have been deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointments' });
  }
};
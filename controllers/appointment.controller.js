import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Availability from '../models/Availability.js';

export const bookAppointment = async (req, res) => {

    if (req.user.role !== 'student') {
        return res.status(403).json({ success: false, message: 'Only students can book appointments.' });
    }

    const { professorId, slot } = req.body;

    if (!professorId || !mongoose.Types.ObjectId.isValid(professorId)) {
        return res.status(400).json({ success: false, message: 'Valid professorId is required.' });
    }

    if (!slot || !slot.start || !slot.end) {

        return res.status(400).json({ success: false, message: 'Slot with valid start and end time is required.' });
    }

    const availability = await Availability.findOne({ professor: professorId });

    if (!availability) {
        return res.status(404).json({ success: false, message: 'Professor availability not found.' });
    }

    const requestedStart = new Date(slot.start);
    const requestedEnd = new Date(slot.end);

    if (requestedStart >= requestedEnd) {
        return res.status(400).json({ status: false, message: "Start time can not be same or greater then end time" })
    }

    const isValidSlot = availability.slots.some(slot => {
        const availableStart = new Date(slot.start);
        const availableEnd = new Date(slot.end);
        return requestedStart >= availableStart && requestedEnd <= availableEnd;
    });

    if (!isValidSlot) {
        return res.status(400).json({ success: false, message: 'Requested slot is not available for the professor.' });
    }

    const overlapping = await Appointment.findOne({
        professor: professorId,
        status: 'booked',
        $or: [
            {
                'slot.start': { $lt: requestedEnd },
                'slot.end': { $gt: requestedStart }
            }
        ]
    });


    if (overlapping) {
        return res.status(409).json({ success: false, message: 'This slot is already booked.' });
    }

    const appointment = await Appointment.create({
        student: req.user._id,
        professor: professorId,
        slot: { start: requestedStart, end: requestedEnd },
    });

    res.status(201).json({ success: true, appointment });
};

export const getAppointments = async (req, res) => {

    const filter = req.user.role === 'student' ? { student: req.user._id } : { professor: req.user._id };

    const apps = await Appointment.find(filter).populate('student professor');

    res.json({ success: true, message: "Appointments fetched successfully", appointments: apps });

};

export const cancelAppointment = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid appointment ID.' });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }


    if (appointment.status === 'canceled') {
        return res.status(400).json({ success: false, message: 'Appointment is already canceled.' });
    }

    if (appointment.status !== 'booked') {
        return res.status(400).json({ success: false, message: 'Only booked appointments can be canceled.' });
    }

    await Appointment.findByIdAndDelete(id)



    res.json({ success: true, message: 'Appointment canceled successfully.', appointment });
};

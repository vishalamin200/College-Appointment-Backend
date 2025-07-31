import express from 'express';
import { bookAppointment, getAppointments, cancelAppointment } from '../controllers/appointment.controller.js';

const router = express.Router();

router.post('/', bookAppointment);
router.get('/', getAppointments);
router.delete('/:id', cancelAppointment);


export default router;
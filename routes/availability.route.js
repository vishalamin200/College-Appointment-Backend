import express from 'express';
import { setAvailability, getAvailability } from '../controllers/availability.controller.js';

const router = express.Router();

router.post('/', setAvailability);

router.get('/:professorId', getAvailability);

export default router;
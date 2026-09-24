import express from 'express';
import { createAppointmentController, listAppointmentsController, patchAppointmentStatusController } from '../controllers/appointments.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listAppointmentsController);
router.post('/', requireRole('admin', 'staff'), createAppointmentController);
router.patch('/:id/status', requireRole('admin', 'staff'), patchAppointmentStatusController);

export default router;

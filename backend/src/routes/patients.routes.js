import express from 'express';
import { createPatientController, listPatients, getPatientDetails, updatePatientController, deletePatientController } from '../controllers/patients.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listPatients);
router.get('/:id', getPatientDetails);
router.post('/', requireRole('admin', 'staff'), createPatientController);
router.put('/:id', requireRole('admin', 'staff'), updatePatientController);
router.delete('/:id', requireRole('admin'), deletePatientController);

export default router;

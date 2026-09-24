import express from 'express';
import { getStatsController } from '../controllers/appointments.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getStatsController);

export default router;

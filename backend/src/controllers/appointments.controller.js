import { createAppointment, listAppointments, updateAppointmentStatus, getDashboardStats } from '../services/appointment.service.js';
import { appointmentSchema, appointmentStatusSchema } from '../validators/appointment.validator.js';
import { AppError } from '../utils/AppError.js';

export const createAppointmentController = async (req, res, next) => {
  try {
    const parsed = appointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, 'Validation failed', parsed.error.flatten().fieldErrors);
    }

    const data = await createAppointment({
      ...parsed.data,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const listAppointmentsController = async (req, res, next) => {
  try {
    const { date = '', status = '', page = 1, limit = 10 } = req.query;
    const data = await listAppointments({ date, status, page, limit });
    res.status(200).json({ success: true, data: data.data, pagination: data.pagination });
  } catch (error) {
    next(error);
  }
};

export const patchAppointmentStatusController = async (req, res, next) => {
  try {
    const parsed = appointmentStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, 'Validation failed', parsed.error.flatten().fieldErrors);
    }

    const data = await updateAppointmentStatus(req.params.id, parsed.data, req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getStatsController = async (req, res, next) => {
  try {
    const data = await getDashboardStats();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

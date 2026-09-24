import { createPatient, getPatients, getPatientById, updatePatient, deletePatient } from '../services/patient.service.js';
import { patientSchema, patientUpdateSchema } from '../validators/patient.validator.js';
import { AppError } from '../utils/AppError.js';

export const createPatientController = async (req, res, next) => {
  try {
    const parsed = patientSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, 'Validation failed', parsed.error.flatten().fieldErrors);
    }

    const data = await createPatient(parsed.data);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const listPatients = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const data = await getPatients({ search, page, limit });
    res.status(200).json({ success: true, data: data.data, pagination: data.pagination });
  } catch (error) {
    next(error);
  }
};

export const getPatientDetails = async (req, res, next) => {
  try {
    const data = await getPatientById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updatePatientController = async (req, res, next) => {
  try {
    const parsed = patientUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, 'Validation failed', parsed.error.flatten().fieldErrors);
    }

    const data = await updatePatient(req.params.id, parsed.data);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deletePatientController = async (req, res, next) => {
  try {
    const response = await deletePatient(req.params.id);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

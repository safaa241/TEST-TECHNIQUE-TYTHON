import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';

const getAppointmentWindowConflict = async (patientId, appointmentDate, excludeAppointmentId = null) => {
  const start = new Date(new Date(appointmentDate).getTime() - 30 * 60 * 1000);
  const end = new Date(new Date(appointmentDate).getTime() + 30 * 60 * 1000);

  const query = `
    SELECT a.id, a.status, a.appointment_date AS "appointmentDate"
    FROM appointments a
    WHERE a.patient_id = $1
      AND a.status = 'confirmed'
      AND a.id <> COALESCE($2, '00000000-0000-0000-0000-000000000000'::uuid)
      AND a.appointment_date BETWEEN $3 AND $4
    LIMIT 1
  `;

  const result = await pool.query(query, [patientId, excludeAppointmentId, start.toISOString(), end.toISOString()]);
  return result.rows[0];
};

export const createAppointment = async ({ patientId, appointmentDate, status = 'pending', reason, notes, createdBy }) => {
  const patientCheck = await pool.query('SELECT id FROM patients WHERE id = $1', [patientId]);
  if (patientCheck.rows.length === 0) {
    throw new AppError(404, 'Patient not found');
  }

  const date = new Date(appointmentDate);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, 'Valid appointment date is required');
  }

  if (status === 'confirmed') {
    const conflict = await getAppointmentWindowConflict(patientId, date.toISOString());
    if (conflict) {
      throw new AppError(409, 'A confirmed appointment already exists within 30 minutes for this patient');
    }
  }

  const result = await pool.query(
    `INSERT INTO appointments (id, patient_id, appointment_date, status, reason, notes, created_by)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
     RETURNING *, created_at AS "createdAt"`,
    [patientId, date.toISOString(), status, reason.trim(), notes || null, createdBy]
  );

  return result.rows[0];
};

export const listAppointments = async ({ date = '', status = '', page = 1, limit = 10 }) => {
  const pageNumber = Number(page) > 0 ? Number(page) : 1;
  const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
  const offset = (pageNumber - 1) * limitNumber;

  const conditions = [];
  const params = [];

  if (date) {
    const selectedDate = new Date(date);
    if (Number.isNaN(selectedDate.getTime())) {
      throw new AppError(400, 'Invalid date filter');
    }

    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    conditions.push(`a.appointment_date >= $${params.length + 1}`);
    params.push(start.toISOString());
    conditions.push(`a.appointment_date <= $${params.length + 1}`);
    params.push(end.toISOString());
  }

  if (status) {
    conditions.push(`a.status = $${params.length + 1}`);
    params.push(status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM appointments a ${whereClause}`,
    params
  );

  const result = await pool.query(
    `SELECT a.id, a.patient_id AS "patientId", p.full_name AS "patientName", a.appointment_date AS "appointmentDate",
            a.status, a.reason, a.notes, a.created_by AS "createdBy", a.created_at AS "createdAt"
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     ${whereClause}
     ORDER BY a.appointment_date DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limitNumber, offset]
  );

  return {
    data: result.rows,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total: countResult.rows[0].total,
      totalPages: Math.max(1, Math.ceil(countResult.rows[0].total / limitNumber)),
    },
  };
};

export const updateAppointmentStatus = async (appointmentId, { status }, userId) => {
  const appointmentResult = await pool.query(
    `SELECT id, patient_id AS "patientId", appointment_date AS "appointmentDate", status
     FROM appointments WHERE id = $1`,
    [appointmentId]
  );

  if (appointmentResult.rows.length === 0) {
    throw new AppError(404, 'Appointment not found');
  }

  const appointment = appointmentResult.rows[0];

  if (status === 'confirmed' && appointment.status !== 'confirmed') {
    const conflict = await getAppointmentWindowConflict(appointment.patientId, appointment.appointmentDate, appointmentId);
    if (conflict) {
      throw new AppError(409, 'A confirmed appointment already exists within 30 minutes for this patient');
    }
  }

  const updated = await pool.query(
    `UPDATE appointments
     SET status = $1, updated_by = $2
     WHERE id = $3
     RETURNING id, patient_id AS "patientId", appointment_date AS "appointmentDate", status, reason, notes, created_by AS "createdBy", created_at AS "createdAt"`,
    [status, userId, appointmentId]
  );

  return updated.rows[0];
};

export const getDashboardStats = async () => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM patients) AS "totalPatients",
      (SELECT COUNT(*) FROM appointments WHERE appointment_date::date = CURRENT_DATE) AS "appointmentsToday",
      (SELECT COUNT(*) FROM appointments WHERE status = 'pending') AS "pendingCount",
      (SELECT COUNT(*) FROM appointments WHERE status = 'confirmed') AS "confirmedCount"
  `);

  return result.rows[0];
};

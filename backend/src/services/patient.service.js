import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export const createPatient = async (payload) => {
  const exists = await pool.query('SELECT id FROM patients WHERE cin = $1', [payload.cin.trim()]);

  if (exists.rows.length > 0) {
    throw new AppError(409, 'A patient with this CIN already exists');
  }

  const result = await pool.query(
    `INSERT INTO patients (id, full_name, cin, phone, birth_date, address)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
     RETURNING *, created_at AS "createdAt"`,
    [payload.fullName.trim(), payload.cin.trim(), payload.phone.trim(), payload.birthDate, payload.address || null]
  );

  return result.rows[0];
};

export const getPatients = async ({ search = '', page = 1, limit = 10 }) => {
  const pageNumber = Number(page) > 0 ? Number(page) : 1;
  const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
  const offset = (pageNumber - 1) * limitNumber;

  let searchClause = '';
  const queryParams = [];

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    searchClause = `WHERE full_name ILIKE $1 OR cin ILIKE $2`;
    queryParams.push(term, term);
  }

  const countQuery = `SELECT COUNT(*)::int AS total FROM patients ${searchClause}`;
  const countResult = await pool.query(countQuery, queryParams);

  const dataQuery = `
    SELECT p.id, p.full_name AS "fullName", p.cin, p.phone, p.birth_date AS "birthDate",
           p.address, p.created_at AS "createdAt",
           EXISTS (
             SELECT 1
             FROM appointments a
             WHERE a.patient_id = p.id AND a.status != 'cancelled'
           ) AS "hasActiveAppointments"
    FROM patients p
    ${searchClause}
    ORDER BY p.created_at DESC
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
  `;

  const dataResult = await pool.query(dataQuery, [...queryParams, limitNumber, offset]);

  return {
    data: dataResult.rows,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total: countResult.rows[0].total,
      totalPages: Math.max(1, Math.ceil(countResult.rows[0].total / limitNumber)),
    },
  };
};

export const getPatientById = async (patientId) => {
  const result = await pool.query(
    `SELECT id, full_name AS "fullName", cin, phone, birth_date AS "birthDate",
            address, created_at AS "createdAt"
     FROM patients WHERE id = $1`,
    [patientId]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'Patient not found');
  }

  const appointments = await pool.query(
    `SELECT a.id, a.patient_id AS "patientId", a.appointment_date AS "appointmentDate",
            a.status, a.reason, a.notes, a.created_by AS "createdBy", a.created_at AS "createdAt"
     FROM appointments a
     WHERE a.patient_id = $1
     ORDER BY a.appointment_date DESC`,
    [patientId]
  );

  return {
    ...result.rows[0],
    appointments: appointments.rows,
  };
};

export const updatePatient = async (patientId, payload) => {
  const existing = await pool.query('SELECT id FROM patients WHERE id = $1', [patientId]);

  if (existing.rows.length === 0) {
    throw new AppError(404, 'Patient not found');
  }

  if (payload.cin) {
    const sameCin = await pool.query('SELECT id FROM patients WHERE cin = $1 AND id != $2', [payload.cin.trim(), patientId]);
    if (sameCin.rows.length > 0) {
      throw new AppError(409, 'A patient with this CIN already exists');
    }
  }

  const updates = [];
  const values = [];

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;

    updates.push(`${key === 'fullName' ? 'full_name' : key === 'birthDate' ? 'birth_date' : key} = $${values.length + 1}`);
    values.push(key === 'fullName' ? value.trim() : key === 'cin' || key === 'phone' ? value.trim() : value);
  });

  if (updates.length === 0) {
    return await getPatientById(patientId);
  }

  values.push(patientId);

  const query = `
    UPDATE patients
    SET ${updates.join(', ')}
    WHERE id = $${values.length}
    RETURNING id, full_name AS "fullName", cin, phone, birth_date AS "birthDate",
              address, created_at AS "createdAt"
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deletePatient = async (patientId) => {
  const existing = await pool.query('SELECT id FROM patients WHERE id = $1', [patientId]);

  if (existing.rows.length === 0) {
    throw new AppError(404, 'Patient not found');
  }

  await pool.query('DELETE FROM appointments WHERE patient_id = $1', [patientId]);
  await pool.query('DELETE FROM patients WHERE id = $1', [patientId]);
  return { success: true };
};

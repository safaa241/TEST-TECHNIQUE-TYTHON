import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const users = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'admin@clinicflow.test',
    password: bcrypt.hashSync('Admin123!', 10),
    role: 'admin',
    fullName: 'Dr. Admin',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'staff@clinicflow.test',
    password: bcrypt.hashSync('Staff123!', 10),
    role: 'staff',
    fullName: 'Nurse Staff',
  },
  {
    id: '88888888-8888-4888-8888-888888888888',
    email: 'staff2@clinicflow.test',
    password: bcrypt.hashSync('Staff123!', 10),
    role: 'staff',
    fullName: 'Nurse Staff 2',
  },
];

const patients = [
  {
    id: '33333333-3333-4333-8333-333333333333',
    fullName: 'Alice Martin',
    cin: 'AA123456',
    phone: '0601020304',
    birthDate: '1988-05-12',
    address: '12 Rue de la Santé, Lyon',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    fullName: 'Bob Dupont',
    cin: 'BB234567',
    phone: '0611223344',
    birthDate: '1974-11-06',
    address: '8 Avenue Centrale, Marseille',
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    fullName: 'Claire Leroy',
    cin: 'CC345678',
    phone: '0677889900',
    birthDate: '1992-02-18',
    address: '14 Place du Marché, Lille',
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    fullName: 'Daniel Petit',
    cin: 'DD456789',
    phone: '0655443322',
    birthDate: '1969-08-27',
    address: '21 Rue Jean Jaurès, Nantes',
  },
  {
    id: '77777777-7777-4777-8777-777777777777',
    fullName: 'Emma Bernard',
    cin: 'EE567890',
    phone: '0622334455',
    birthDate: '2001-01-29',
    address: '5 Rue de l\'Hôpital, Paris',
  },
];

const now = new Date();
const appointments = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    patientId: patients[0].id,
    appointmentDate: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    status: 'pending',
    reason: 'Consultation de suivi',
    notes: 'À confirmer',
    createdBy: users[0].id,
  },
  {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    patientId: patients[1].id,
    appointmentDate: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'confirmed',
    reason: 'Bilan annuel',
    notes: 'Patient à jeun',
    createdBy: users[1].id,
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    patientId: patients[2].id,
    appointmentDate: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'cancelled',
    reason: 'Contrôle',
    notes: 'Annulé par le patient',
    createdBy: users[0].id,
  },
  {
    id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    patientId: patients[3].id,
    appointmentDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    reason: 'Suivi post-opératoire',
    notes: null,
    createdBy: users[1].id,
  },
  {
    id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    patientId: patients[4].id,
    appointmentDate: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'confirmed',
    reason: 'Visite de routine',
    notes: 'Fiche complétée',
    createdBy: users[0].id,
  },
  {
    id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
    patientId: patients[0].id,
    appointmentDate: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
    status: 'pending',
    reason: 'Traitement',
    notes: 'A venir',
    createdBy: users[1].id,
  },
  {
    id: '12121212-1212-4121-8121-121212121212',
    patientId: patients[1].id,
    appointmentDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    reason: 'Consultation spécialisée',
    notes: null,
    createdBy: users[0].id,
  },
  {
    id: '13131313-1313-4131-8131-131313131313',
    patientId: patients[2].id,
    appointmentDate: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'confirmed',
    reason: 'Vaccination',
    notes: 'À suivre',
    createdBy: users[1].id,
  },
  {
    id: '14141414-1414-4141-8141-141414141414',
    patientId: patients[3].id,
    appointmentDate: new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    reason: 'Contrôle',
    notes: null,
    createdBy: users[0].id,
  },
  {
    id: '15151515-1515-4151-8151-151515151515',
    patientId: patients[4].id,
    appointmentDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'cancelled',
    reason: 'Examens',
    notes: 'Aucun traitement',
    createdBy: users[1].id,
  },
];

const main = async () => {
  await pool.query('DELETE FROM appointments');
  await pool.query('DELETE FROM patients');
  await pool.query('DELETE FROM users');

  for (const user of users) {
    await pool.query(
      `INSERT INTO users (id, email, password, role, full_name, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [user.id, user.email, user.password, user.role, user.fullName]
    );
  }

  for (const patient of patients) {
    await pool.query(
      `INSERT INTO patients (id, full_name, cin, phone, birth_date, address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [patient.id, patient.fullName, patient.cin, patient.phone, patient.birthDate, patient.address]
    );
  }

  for (const appointment of appointments) {
    await pool.query(
      `INSERT INTO appointments (id, patient_id, appointment_date, status, reason, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [appointment.id, appointment.patientId, appointment.appointmentDate, appointment.status, appointment.reason, appointment.notes, appointment.createdBy]
    );
  }

  console.log('Database seeded with demo data');
  await pool.end();
};

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});

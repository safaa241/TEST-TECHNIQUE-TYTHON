INSERT INTO users (id, email, password, role, full_name, created_at)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'admin@clinicflow.test', '$2b$10$Aw/Ey2.h5GYLArJz3A2H7e1IEVeGmS/mxKzCkdkYXLug3dYMi95Mm', 'admin', 'Dr. Admin', NOW()),
  ('22222222-2222-4222-8222-222222222222', 'staff@clinicflow.test', '$2b$10$qvcX4qwTD.eJVDYK9b30CO8sXO024kxv4IcdFdzkf50CjCnA7fW36', 'staff', 'Nurse Staff', NOW()),
  ('33333333-3333-4333-8333-333333333333', 'stuff@clinicflow.test', '$2b$10$qvcX4qwTD.eJVDYK9b30CO8sXO024kxv4IcdFdzkf50CjCnA7fW36', 'staff', 'Nurse Staff', NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO patients (id, full_name, cin, phone, birth_date, address, created_at)
VALUES
  ('33333333-3333-4333-8333-333333333333', 'Alice Martin', 'AA123456', '0601020304', '1988-05-12', '12 Rue de la Santé, Lyon', NOW()),
  ('44444444-4444-4444-8444-444444444444', 'Bob Dupont', 'BB234567', '0611223344', '1974-11-06', '8 Avenue Centrale, Marseille', NOW()),
  ('55555555-5555-4555-8555-555555555555', 'Claire Leroy', 'CC345678', '0677889900', '1992-02-18', '14 Place du Marché, Lille', NOW()),
  ('66666666-6666-4666-8666-666666666666', 'Daniel Petit', 'DD456789', '0655443322', '1969-08-27', '21 Rue Jean Jaurès, Nantes', NOW()),
  ('77777777-7777-4777-8777-777777777777', 'Emma Bernard', 'EE567890', '0622334455', '2001-01-29', '5 Rue de l''Hôpital, Paris', NOW())
ON CONFLICT (cin) DO NOTHING;

INSERT INTO appointments (id, patient_id, appointment_date, status, reason, notes, created_by, created_at)
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '33333333-3333-4333-8333-333333333333', NOW() + INTERVAL '1 hour', 'pending', 'Consultation de suivi', 'À confirmer', '11111111-1111-4111-8111-111111111111', NOW()),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '44444444-4444-4444-8444-444444444444', NOW() + INTERVAL '2 hours', 'confirmed', 'Bilan annuel', 'Patient à jeun', '22222222-2222-4222-8222-222222222222', NOW()),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '55555555-5555-4555-8555-555555555555', NOW() - INTERVAL '1 day', 'cancelled', 'Contrôle', 'Annulé par le patient', '11111111-1111-4111-8111-111111111111', NOW()),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '66666666-6666-4666-8666-666666666666', NOW() + INTERVAL '3 days', 'pending', 'Suivi post-opératoire', NULL, '22222222-2222-4222-8222-222222222222', NOW()),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '77777777-7777-4777-8777-777777777777', NOW() - INTERVAL '2 hours', 'confirmed', 'Visite de routine', 'Fiche complétée', '11111111-1111-4111-8111-111111111111', NOW()),
  ('ffffffff-ffff-4fff-8fff-ffffffffffff', '33333333-3333-4333-8333-333333333333', NOW() + INTERVAL '30 minutes', 'pending', 'Traitement', 'A venir', '22222222-2222-4222-8222-222222222222', NOW()),
  ('12121212-1212-4121-8121-121212121212', '44444444-4444-4444-8444-444444444444', NOW() + INTERVAL '10 days', 'pending', 'Consultation spécialisée', NULL, '11111111-1111-4111-8111-111111111111', NOW()),
  ('13131313-1313-4131-8131-131313131313', '55555555-5555-4555-8555-555555555555', NOW() + INTERVAL '4 hours', 'confirmed', 'Vaccination', 'À suivre', '22222222-2222-4222-8222-222222222222', NOW()),
  ('14141414-1414-4141-8141-141414141414', '66666666-6666-4666-8666-666666666666', NOW() + INTERVAL '5 hours', 'pending', 'Contrôle', NULL, '11111111-1111-4111-8111-111111111111', NOW()),
  ('15151515-1515-4151-8151-151515151515', '77777777-7777-4777-8777-777777777777', NOW() + INTERVAL '7 days', 'cancelled', 'Examens', 'Aucun traitement', '22222222-2222-4222-8222-222222222222', NOW())
ON CONFLICT (id) DO NOTHING;

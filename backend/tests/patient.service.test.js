import { jest } from '@jest/globals';
import pool from '../src/config/db.js';
import { deletePatient } from '../src/services/patient.service.js';

describe('deletePatient', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deletes linked appointments before removing the patient', async () => {
    const queryMock = jest.spyOn(pool, 'query').mockImplementation((sql) => {
      if (sql.includes('SELECT id FROM patients')) {
        return Promise.resolve({ rows: [{ id: 'patient-1' }] });
      }

      if (sql.includes('DELETE FROM appointments')) {
        return Promise.resolve({ rowCount: 1 });
      }

      if (sql.includes('DELETE FROM patients')) {
        return Promise.resolve({ rowCount: 1 });
      }

      return Promise.resolve({ rows: [] });
    });

    const result = await deletePatient('patient-1');

    expect(result).toEqual({ success: true });
    expect(queryMock).toHaveBeenCalledTimes(3);
    expect(queryMock.mock.calls[0][0]).toContain('SELECT id FROM patients');
    expect(queryMock.mock.calls[1][0]).toContain('DELETE FROM appointments');
    expect(queryMock.mock.calls[2][0]).toContain('DELETE FROM patients');
  });
});

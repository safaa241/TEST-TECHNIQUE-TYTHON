import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const appointmentStatuses = ['pending', 'confirmed', 'cancelled'];

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [patientMode, setPatientMode] = useState('existing');
  const [form, setForm] = useState({
    patientId: '',
    appointmentDate: '',
    status: 'pending',
    reason: '',
    notes: '',
  });
  const [newPatientForm, setNewPatientForm] = useState({
    fullName: '',
    cin: '',
    phone: '',
    birthDate: '',
    address: '',
  });

  const normalizeDateInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/patients', {
        params: {
          page: 1,
          limit: 100,
        },
      });
      const patientList = response.data.data || [];
      setPatients(patientList);
      if (!form.patientId && patientList.length > 0) {
        setForm((prev) => ({ ...prev, patientId: patientList[0].id }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur de chargement des patients');
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/appointments', {
        params: {
          date: filterDate,
          status: filterStatus,
          page: 1,
          limit: 50,
        },
      });
      setAppointments(response.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
  }, [filterDate, filterStatus]);

  const handleFormChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      let patientId = form.patientId;

      if (patientMode === 'new') {
        const patientPayload = {
          ...newPatientForm,
          birthDate: normalizeDateInput(newPatientForm.birthDate),
        };

        if (!patientPayload.fullName || !patientPayload.cin || !patientPayload.phone || !patientPayload.birthDate) {
          setError('Veuillez compléter les informations du nouveau patient.');
          return;
        }

        const createdPatient = await api.post('/api/patients', patientPayload);
        const createdPatientData = createdPatient.data?.data || createdPatient.data;
        patientId = createdPatientData.id;
        setPatients((prev) => [createdPatientData, ...prev]);
        setForm((prev) => ({ ...prev, patientId }));
        setNewPatientForm({ fullName: '', cin: '', phone: '', birthDate: '', address: '' });
      }

      if (!patientId) {
        setError('Veuillez choisir un patient valide.');
        return;
      }

      const payload = {
        ...form,
        patientId,
        appointmentDate: form.appointmentDate ? new Date(form.appointmentDate).toISOString() : '',
      };

      await api.post('/api/appointments', payload);
      setForm({ patientId: patients[0]?.id || '', appointmentDate: '', status: 'pending', reason: '', notes: '' });
      setPatientMode('existing');
      setShowForm(false);
      fetchAppointments();
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur création rendez-vous');
    }
  };

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await api.patch(`/api/appointments/${appointmentId}/status`, { status });
      fetchAppointments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Changement impossible');
    }
  };

  return (
    <Layout>
      <section className="card-panel">
        <div className="toolbar-row right-only">
          <button type="button" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? 'Fermer' : 'Créer un rendez-vous'}
          </button>
        </div>

        {showForm && (
          <form className="big-form" onSubmit={handleCreate}>
            <div className="input-grid">
              <div className="field full-width">
                <label>Patient</label>
                <div className="segmented-control">
                  <button type="button" className={patientMode === 'existing' ? 'active' : ''} onClick={() => setPatientMode('existing')}>Patient existant</button>
                  <button type="button" className={patientMode === 'new' ? 'active' : ''} onClick={() => setPatientMode('new')}>Nouveau patient</button>
                </div>
              </div>

              {patientMode === 'existing' ? (
                <div className="field full-width">
                  <label htmlFor="patientId">Choisir un patient</label>
                  <select id="patientId" name="patientId" value={form.patientId} onChange={handleFormChange} required>
                    <option value="">Sélectionner un patient</option>
                    {patients.map((patient) => (
                      <option key={`patient-option-${patient.id}`} value={patient.id}>{patient.fullName}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="field">
                    <label htmlFor="newPatientName">Nom complet</label>
                    <input id="newPatientName" value={newPatientForm.fullName} onChange={(e) => setNewPatientForm((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Nom complet" required />
                  </div>
                  <div className="field">
                    <label htmlFor="newPatientCin">CIN</label>
                    <input id="newPatientCin" value={newPatientForm.cin} onChange={(e) => setNewPatientForm((prev) => ({ ...prev, cin: e.target.value }))} placeholder="CIN" required />
                  </div>
                  <div className="field">
                    <label htmlFor="newPatientPhone">Téléphone</label>
                    <input id="newPatientPhone" value={newPatientForm.phone} onChange={(e) => setNewPatientForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Téléphone" required />
                  </div>
                  <div className="field">
                    <label htmlFor="newPatientBirthDate">Date de naissance</label>
                    <input id="newPatientBirthDate" type="date" value={newPatientForm.birthDate} onChange={(e) => setNewPatientForm((prev) => ({ ...prev, birthDate: e.target.value }))} required />
                  </div>
                  <div className="field full-width">
                    <label htmlFor="newPatientAddress">Adresse</label>
                    <input id="newPatientAddress" value={newPatientForm.address} onChange={(e) => setNewPatientForm((prev) => ({ ...prev, address: e.target.value }))} placeholder="Adresse" />
                  </div>
                </>
              )}

              <div className="field">
                <label htmlFor="appointmentDate">Date et heure</label>
                <input id="appointmentDate" name="appointmentDate" type="datetime-local" value={form.appointmentDate} onChange={handleFormChange} required />
              </div>
              <div className="field">
                <label htmlFor="status">Statut</label>
                <select id="status" name="status" value={form.status} onChange={handleFormChange}>
                  {appointmentStatuses.map((status) => (
                    <option key={`appointment-status-${status}`} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="reason">Motif</label>
                <input id="reason" name="reason" value={form.reason} placeholder="Motif" onChange={handleFormChange} required />
              </div>
              <div className="field full-width">
                <label htmlFor="notes">Notes</label>
                <textarea id="notes" name="notes" value={form.notes} placeholder="Notes" onChange={handleFormChange} />
              </div>
            </div>
            <div className="submit-row">
              <button type="submit">Créer</button>
              <button type="button" className="secondary" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </form>
        )}
      </section>

      <section className="card-panel">
        <div className="compact-filters">
          <div className="field">
            <input id="filterDate" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>
          <div className="field">
            <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Tous statuts</option>
              {appointmentStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="card-panel">
        <div className="section-header-inline">
          <h3>Rendez-vous</h3>
        </div>
        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p className="alert error">{error}</p>
        ) : appointments.length === 0 ? (
          <p className="empty-state">Aucun rendez-vous trouvé.</p>
        ) : (
          <div className="list-stack">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-row stacked">
                <div>
                  <strong>{appointment.patientName}</strong>
                  <p>{appointment.reason}</p>
                  <small>{new Date(appointment.appointmentDate).toLocaleString()}</small>
                </div>
                <div className="row-actions">
                  <span className={`badge ${appointment.status}`}>{appointment.status}</span>
                  <select value={appointment.status} onChange={(event) => handleStatusChange(appointment.id, event.target.value)}>
                    {appointmentStatuses.map((status) => (
                      <option key={`appointment-status-list-${status}`} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default AppointmentsPage;

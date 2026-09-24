import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const PatientsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', cin: '', phone: '', birthDate: '', address: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchPatients = async (nextPage = page) => {
    try {
      setLoading(true);
      const response = await api.get('/api/patients', {
        params: { search, page: nextPage, limit: 10 },
      });
      setPatients(response.data.data || []);
      setPagination(response.data.pagination || { totalPages: 1, page: 1 });
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement des patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(page);
  }, [search, page]);

  const normalizeDateInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  };

  const resetForm = () => {
    setForm({ fullName: '', cin: '', phone: '', birthDate: '', address: '' });
    setEditingId(null);
  };

  const handleFormChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, birthDate: normalizeDateInput(form.birthDate) };
      if (editingId) {
        await api.put(`/api/patients/${editingId}`, payload);
      } else {
        await api.post('/api/patients', payload);
      }

      resetForm();
      setShowForm(false);
      fetchPatients(1);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de l’enregistrement');
    }
  };

  const handleEdit = (patient) => {
    setEditingId(patient.id);
    setForm({
      fullName: patient.fullName,
      cin: patient.cin,
      phone: patient.phone,
      birthDate: normalizeDateInput(patient.birthDate),
      address: patient.address || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (patient) => {
    const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer le patient ${patient.fullName} ?`);
    if (!confirmed) return;

    try {
      await api.delete(`/api/patients/${patient.id}`);
      fetchPatients(1);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Suppression impossible');
    }
  };

  return (
    <Layout>
      <section className="card-panel">
        <div className="toolbar-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Recherche"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (showForm && editingId) {
                resetForm();
              }
              setShowForm((prev) => !prev);
            }}
          >
            {showForm ? 'Fermer' : 'Ajouter un patient'}
          </button>
        </div>

        {showForm && (
          <form className="big-form" onSubmit={handleSubmit}>
            <div className="input-grid">
              <div className="field">
                <label htmlFor="fullName">Nom complet</label>
                <input id="fullName" name="fullName" value={form.fullName} placeholder="Nom complet" onChange={handleFormChange} required />
              </div>
              <div className="field">
                <label htmlFor="cin">CIN</label>
                <input id="cin" name="cin" value={form.cin} placeholder="CIN" onChange={handleFormChange} required />
              </div>
              <div className="field">
                <label htmlFor="phone">Téléphone</label>
                <input id="phone" name="phone" value={form.phone} placeholder="Téléphone" onChange={handleFormChange} required />
              </div>
              <div className="field">
                <label htmlFor="birthDate">Date de naissance</label>
                <input id="birthDate" name="birthDate" type="date" value={form.birthDate} onChange={handleFormChange} required />
              </div>
              <div className="field full-width">
                <label htmlFor="address">Adresse</label>
                <input id="address" name="address" value={form.address} placeholder="Adresse" onChange={handleFormChange} />
              </div>
            </div>
            <div className="submit-row">
              <button type="submit">{editingId ? 'Enregistrer' : 'Ajouter'}</button>
              <button type="button" className="secondary" onClick={() => { resetForm(); setShowForm(false); }}>
                Annuler
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="card-panel">
        <div className="section-header-inline">
          <h3>Les patients</h3>
        </div>
        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p className="alert error">{error}</p>
        ) : patients.length === 0 ? (
          <p className="empty-state">Aucun patient trouvé.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>CIN</th>
                  <th>Téléphone</th>
                  <th>Date naissance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <a href={`/patients/${patient.id}`} className="link-button">{patient.fullName}</a>
                    </td>
                    <td>{patient.cin}</td>
                    <td>{patient.phone}</td>
                    <td>{new Date(patient.birthDate).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button type="button" className="secondary" onClick={() => handleEdit(patient)}>Modifier</button>
                      {user?.role === 'admin' && (
                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleDelete(patient)}
                          title="Supprimer ce patient"
                        >
                          Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pager">
          <button type="button" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>Précédent</button>
          <span>Page {pagination.page || page} / {pagination.totalPages || 1}</span>
          <button type="button" disabled={page >= (pagination.totalPages || 1)} onClick={() => setPage((prev) => Math.min(pagination.totalPages || 1, prev + 1))}>Suivant</button>
        </div>
      </section>
    </Layout>
  );
};

export default PatientsPage;

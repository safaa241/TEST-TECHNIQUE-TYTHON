import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

const PatientDetailsPage = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await api.get(`/api/patients/${id}`);
        setPatient(response.data.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Patient introuvable');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  if (loading) return <Layout><div className="screen-center">Chargement du patient...</div></Layout>;
  if (error) return <Layout><div className="screen-center alert error">{error}</div></Layout>;

  return (
    <Layout>
      <div className="card-panel detail-grid">
        <div>
          <h3>{patient.fullName}</h3>
          <p><strong>CIN :</strong> {patient.cin}</p>
          <p><strong>Téléphone :</strong> {patient.phone}</p>
          <p><strong>Naissance :</strong> {new Date(patient.birthDate).toLocaleDateString()}</p>
          <p><strong>Adresse :</strong> {patient.address || 'Aucune adresse'}</p>
        </div>
      </div>

      <div className="card-panel">
        <h3>Rendez-vous</h3>
        {patient.appointments.length === 0 ? (
          <p className="empty-state">Aucun rendez-vous pour ce patient.</p>
        ) : (
          <div className="list-stack">
            {patient.appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-row">
                <div>
                  <strong>{appointment.reason}</strong>
                  <p>{new Date(appointment.appointmentDate).toLocaleString()}</p>
                </div>
                <span className={`badge ${appointment.status}`}>{appointment.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PatientDetailsPage;

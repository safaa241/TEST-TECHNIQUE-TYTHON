import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsResponse, appointmentsResponse] = await Promise.all([
          api.get('/api/dashboard'),
          api.get('/api/appointments?date=' + new Date().toISOString().slice(0, 10)),
        ]);

        setStats(statsResponse.data.data);
        setAppointments(appointmentsResponse.data.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <Layout><div className="screen-center">Chargement du tableau de bord...</div></Layout>;
  if (error) return <Layout><div className="screen-center alert error">{error}</div></Layout>;

  return (
    <Layout>
      <div className="stats-grid">
        <div className="stat-card">
          <span>Total patients</span>
          <strong>{stats?.totalPatients ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span>Rendez-vous du jour</span>
          <strong>{stats?.appointmentsToday ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span>Pending</span>
          <strong>{stats?.pendingCount ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span>Confirmed</span>
          <strong>{stats?.confirmedCount ?? 0}</strong>
        </div>
      </div>

      <div className="card-panel">
        <h3>Rendez-vous du jour</h3>
        {appointments.length === 0 ? (
          <p className="empty-state">Aucun rendez-vous programmé pour aujourd’hui.</p>
        ) : (
          <div className="list-stack">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-row">
                <div>
                  <strong>{appointment.patientName}</strong>
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

export default DashboardPage;

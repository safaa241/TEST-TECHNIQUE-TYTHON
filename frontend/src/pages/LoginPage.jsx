import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: 'staff@clinicflow.test', password: 'Staff123!' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-block">
          <div className="brand-logo large">CF</div>
          <h1>ClinicFlow</h1>
          <p>Gestion clinique moderne</p>
        </div>

        <form onSubmit={handleSubmit} className="form-card">
          <div className="field-row">
            <label className="field">
              <span>Email</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Mot de passe</span>
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </label>
          </div>

          {error && <div className="alert error">{error}</div>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className="demo-box">
            <strong>Compte démonstration</strong>
            <p>staff@clinicflow.test / Staff123!</p>
            <p>admin@clinicflow.test / Admin123!</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Tableau de bord', to: '/dashboard' },
  { label: 'Les patients', to: '/patients' },
  { label: 'Rendez-vous', to: '/appointments' },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-logo">CF</div>
          <div>
            <strong>CLINICFLOW</strong>
            <small>Medical management</small>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="user-card">
          <div>
            <small>Connected</small>
            <strong>{user?.fullName || user?.email || 'User'}</strong>
          </div>
          <span className="role-badge">{user?.role}</span>
        </div>
      </aside>

      <main className="main-content">
<header
  className="topbar"
  style={{
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  }}
>         <div>
            <p className="eyebrow">Gestion clinique</p>
            <h1>Tableau de bord de la clinique</h1>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Déconnexion
          </button>
        </header>
        {children}
      </main>
    </div>
  );
};

export default Layout;

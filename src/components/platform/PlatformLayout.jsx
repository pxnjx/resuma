import { useEffect, useState } from 'react';
import { Link } from '../../router.jsx';
import Icon from '../Icon.jsx';

// Platform shell (mirrors the original Lanjut /platform structure):
// sidebar sections "Platform", "My Resume", and "Other".
export default function PlatformLayout({ route, resumes, onNew, onResetData, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the drawer whenever the route changes (e.g. after a nav click).
  useEffect(() => {
    setSidebarOpen(false);
  }, [route]);

  return (
    <div className="platform">
      <button
        type="button"
        className="platform-menu-btn"
        aria-label="Toggle navigation menu"
        aria-expanded={sidebarOpen}
        onClick={() => setSidebarOpen((v) => !v)}
      >
        <Icon name="menu" size={18} />
      </button>
      <aside className={`platform-sidebar${sidebarOpen ? ' open' : ''}`}>
        <Link to="/" className="platform-logo">
          Resuma <span>Platform</span>
        </Link>

        <div className="side-section">Platform</div>
        <Link to="/dashboard" className={`side-link${route === '/dashboard' ? ' active' : ''}`}>
          <Icon name="layout-dashboard" size={15} />
          <span className="side-label">Dashboard</span>
        </Link>
        <Link to="/templates" className={`side-link${route === '/templates' ? ' active' : ''}`}>
          <Icon name="layout-template" size={15} />
          <span className="side-label">Browse Template</span>
        </Link>

        <div className="side-section">My Resume</div>
        {resumes.map((r) => (
          <Link
            key={r.id}
            to={'/builder/' + r.id}
            className={`side-link side-resume${route === '/builder/' + r.id ? ' active' : ''}`}
            title={r.title || 'Untitled Resume'}
          >
            <Icon name="file-text" size={15} />
            <span className="side-label">{r.title || 'Untitled Resume'}</span>
          </Link>
        ))}
        <button type="button" className="side-link side-new" onClick={onNew}>
          <Icon name="plus" size={15} />
          <span className="side-label">New Resume</span>
        </button>

        <div className="side-section">Other</div>
        <Link to="/" className="side-link">
          <Icon name="home" size={15} />
          <span className="side-label">Home</span>
        </Link>
        <button type="button" className="side-link side-danger" onClick={onResetData}>
          <Icon name="triangle-alert" size={15} />
          <span className="side-label">Reset All Data</span>
        </button>
      </aside>
      {sidebarOpen && (
        <div className="platform-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
      <main className="platform-main">{children}</main>
    </div>
  );
}


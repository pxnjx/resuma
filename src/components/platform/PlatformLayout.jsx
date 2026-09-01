import { Link } from '../../router.jsx';

// Platform shell (mirrors the real Lanjut /platform structure):
// sidebar sections "Platform", "My Resume", and "Other".
export default function PlatformLayout({ route, resumes, onNew, onResetData, children }) {
  return (
    <div className="platform">
      <aside className="platform-sidebar">
        <Link to="/" className="platform-logo">
          Lanjut <span>Platform</span>
        </Link>

        <div className="side-section">Platform</div>
        <Link to="/dashboard" className={`side-link${route === '/dashboard' ? ' active' : ''}`}>
          📊 Dashboard
        </Link>
        <Link to="/templates" className={`side-link${route === '/templates' ? ' active' : ''}`}>
          🎨 Browse Template
        </Link>

        <div className="side-section">My Resume</div>
        {resumes.map((r) => (
          <Link
            key={r.id}
            to={'/builder/' + r.id}
            className={`side-link side-resume${route === '/builder/' + r.id ? ' active' : ''}`}
            title={r.title || 'Untitled Resume'}
          >
            📄 {r.title || 'Untitled Resume'}
          </Link>
        ))}
        <button type="button" className="side-link side-new" onClick={onNew}>
          ＋ New Resume
        </button>

        <div className="side-section">Other</div>
        <Link to="/" className="side-link">
          🏠 Home
        </Link>
        <button type="button" className="side-link side-danger" onClick={onResetData}>
          ⚠ Reset All Data
        </button>
      </aside>
      <main className="platform-main">{children}</main>
    </div>
  );
}

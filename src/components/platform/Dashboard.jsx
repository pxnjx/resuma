import { Link } from '../../router.jsx';

function formatRelative(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

// Dashboard page — stats + "My Resume" card grid.
export default function Dashboard({ resumes, onNew, onDuplicate, onDelete }) {
  const lastEdited = resumes.length
    ? Math.max(...resumes.map((r) => r.updatedAt || 0))
    : null;

  return (
    <div>
      <div className="dash-header">
        <div>
          <div className="section-label">Dashboard</div>
          <div className="dash-title">My Resume</div>
        </div>
        <button type="button" className="btn-primary" onClick={onNew}>
          ＋ New Resume
        </button>
      </div>

      <div className="dash-stats">
        <div className="dash-stat">
          <div className="dash-stat-value">{resumes.length}</div>
          <div className="dash-stat-label">Resumes</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-value">3</div>
          <div className="dash-stat-label">Templates</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-value">{lastEdited ? formatRelative(lastEdited) : '—'}</div>
          <div className="dash-stat-label">Last Edited</div>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="empty-state">
          <h3>No resumes yet</h3>
          <p>Create your first resume — pick a template or start from scratch.</p>
          <button type="button" className="btn-primary" onClick={onNew}>
            ＋ Create Resume
          </button>
        </div>
      ) : (
        <div className="resume-grid">
          {resumes.map((r) => (
            <div className="resume-card" key={r.id}>
              <Link to={'/builder/' + r.id} className="resume-card-title">
                {r.title || 'Untitled Resume'}
              </Link>
              <div className="resume-card-meta">
                {r.data?.name || 'No name yet'} · {r.data?.template || 'modern'} ·{' '}
                {formatRelative(r.updatedAt)}
              </div>
              <div className="resume-card-actions">
                <Link to={'/builder/' + r.id} className="mini-btn">
                  ✏️ Edit
                </Link>
                <button type="button" className="mini-btn" onClick={() => onDuplicate(r.id)}>
                  ⧉ Duplicate
                </button>
                <button
                  type="button"
                  className="mini-btn danger"
                  title="Delete resume"
                  onClick={() => onDelete(r.id)}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
